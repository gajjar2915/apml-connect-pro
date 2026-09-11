import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';

// Generate Invoice
export const createInvoice = async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, appointmentId, items, discount, dueDate } = req.body;

  try {
    const rawAmount = items.reduce((sum: number, item: any) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
    const taxRate = 0.18; // 18% GST standard
    const tax = rawAmount * taxRate;
    const disc = Number(discount) || 0;
    const total = rawAmount + tax - disc;

    const invoice = await prisma.$transaction(async (tx: any) => {
      const inv = await tx.invoice.create({
        data: {
          patientId,
          appointmentId,
          amount: rawAmount,
          tax,
          discount: disc,
          total,
          status: 'UNPAID',
          dueDate: new Date(dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
          items: {
            createMany: {
              data: items.map((itm: any) => ({
                description: itm.description,
                quantity: Number(itm.quantity) || 1,
                unitPrice: Number(itm.unitPrice),
                amount: Number(itm.unitPrice) * (Number(itm.quantity) || 1),
              })),
            },
          },
        },
        include: {
          items: true,
          patient: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      });

      if (appointmentId) {
        await tx.appointment.update({
          where: { id: appointmentId },
          data: { paymentStatus: 'UNPAID' },
        });
      }

      return inv;
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Invoice generation failed' });
  }
};

// Process Payment
export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Invoice ID
  const { amount, gateway, referenceId } = req.body; // cash, upi, stripe, razorpay

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { transactions: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const payAmount = Number(amount);
    const prevPaid = invoice.transactions
      .filter((t: any) => t.status === 'SUCCESS')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const totalPaid = prevPaid + payAmount;
    let nextStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' = 'UNPAID';

    if (totalPaid >= Number(invoice.total)) {
      nextStatus = 'PAID';
    } else if (totalPaid > 0) {
      nextStatus = 'PARTIALLY_PAID';
    }

    const transaction = await prisma.$transaction(async (tx: any) => {
      const trans = await tx.transaction.create({
        data: {
          invoiceId: id,
          amount: payAmount,
          gateway,
          referenceId: referenceId || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'SUCCESS', // Mock successful checkout
        },
      });

      await tx.invoice.update({
        where: { id },
        data: { status: nextStatus },
      });

      if (invoice.appointmentId && nextStatus === 'PAID') {
        await tx.appointment.update({
          where: { id: invoice.appointmentId },
          data: { paymentStatus: 'PAID' },
        });
      }

      return trans;
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Payment processing failed' });
  }
};

// Process Refund
export const processRefund = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Invoice ID
  const { amount } = req.body;

  try {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const refund = await prisma.$transaction(async (tx: any) => {
      const trans = await tx.transaction.create({
        data: {
          invoiceId: id,
          amount: -Math.abs(Number(amount)),
          gateway: 'REFUND',
          status: 'SUCCESS',
        },
      });

      await tx.invoice.update({
        where: { id },
        data: { status: 'REFUNDED' },
      });

      return trans;
    });

    res.status(200).json(refund);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Refund failed' });
  }
};

// List Invoices & Billing Dashboard
export const listInvoices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const invoices = await prisma.invoice.findMany({
      where: {
        patient: {
          user: { tenantId },
        },
      },
      include: {
        patient: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        items: true,
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve invoices' });
  }
};

// Get Daily/Monthly Revenue Statistics
export const getBillingAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    const invoices = await prisma.invoice.findMany({
      where: {
        patient: {
          user: { tenantId },
        },
      },
      include: { transactions: true },
    });

    let totalRevenue = 0;
    let pendingPayments = 0;
    let dailyCollection = 0;

    const todayStr = new Date().toDateString();

    invoices.forEach((inv: any) => {
      const isPaid = inv.status === 'PAID';
      const isPartial = inv.status === 'PARTIALLY_PAID';

      const successTxns = inv.transactions.filter((t: any) => t.status === 'SUCCESS');
      const paidAmt = successTxns.reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      totalRevenue += paidAmt;

      if (!isPaid) {
        pendingPayments += Number(inv.total) - paidAmt;
      }

      successTxns.forEach((t: any) => {
        if (new Date(t.createdAt).toDateString() === todayStr) {
          dailyCollection += Number(t.amount);
        }
      });
    });

    res.status(200).json({
      totalRevenue,
      pendingPayments,
      dailyCollection,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch billing analytics' });
  }
};

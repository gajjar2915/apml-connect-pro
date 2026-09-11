import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';

// Get Clinic Performance Reports & Caseloads
export const getCaseloadReport = async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const tenantId = req.user?.tenantId;

    const start = startDate ? new Date(String(startDate)) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(String(endDate)) : new Date();

    const stats = await prisma.appointment.groupBy({
      by: ['doctorId'],
      where: {
        hospital: { tenantId },
        date: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });

    const doctors = await prisma.doctor.findMany({
      where: {
        hospital: { tenantId },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    const report = doctors.map((doc: any) => {
      const match = stats.find((s: any) => s.doctorId === doc.id);
      return {
        doctorId: doc.id,
        doctorName: `Dr. ${doc.user.firstName} ${doc.user.lastName}`,
        specialization: doc.specialization,
        appointmentsCount: match?._count.id || 0,
      };
    });

    res.status(200).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate caseload reports' });
  }
};

// Get Financial Collections Report
export const getCollectionsReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    const invoices = await prisma.invoice.findMany({
      where: {
        patient: { user: { tenantId } },
      },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        transactions: { where: { status: 'SUCCESS' } },
      },
    });

    const summary = invoices.map((inv: any) => {
      const collected = inv.transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      const outstanding = Number(inv.total) - collected;
      return {
        invoiceId: inv.id,
        patientName: `${inv.patient.user.firstName} ${inv.patient.user.lastName}`,
        totalAmount: Number(inv.total),
        collectedAmount: collected,
        outstandingAmount: outstanding,
        status: inv.status,
        date: inv.createdAt,
      };
    });

    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate collections reports' });
  }
};

// Export Reports as CSV File
export const exportReportCSV = async (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.query; // 'collections' or 'caseload'

  try {
    const tenantId = req.user?.tenantId;
    let csvContent = '';

    if (type === 'collections') {
      const invoices = await prisma.invoice.findMany({
        where: { patient: { user: { tenantId } } },
        include: { patient: { include: { user: true } } },
      });

      csvContent = 'Invoice ID,Patient Name,Total,Status,Created At\n';
      invoices.forEach((inv: any) => {
        csvContent += `"${inv.id}","${inv.patient.user.firstName} ${inv.patient.user.lastName}",${inv.total},"${inv.status}","${inv.createdAt.toISOString()}"\n`;
      });
    } else {
      const appointments = await prisma.appointment.findMany({
        where: { hospital: { tenantId } },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
        },
      });

      csvContent = 'Appointment ID,Patient Name,Doctor Name,Date,Status\n';
      appointments.forEach((appt: any) => {
        csvContent += `"${appt.id}","${appt.patient.user.firstName} ${appt.patient.user.lastName}","Dr. ${appt.doctor.user.firstName} ${appt.doctor.user.lastName}","${appt.date.toISOString()}","${appt.status}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=apml-connect-report-${type || 'export'}.csv`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).send(error.message || 'Export failed');
  }
};

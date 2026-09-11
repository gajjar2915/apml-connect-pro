import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';

// Create/Update Insurance Policy for Patient
export const saveInsurancePolicy = async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, providerName, policyNumber, coverageDetails, startDate, endDate } = req.body;

  try {
    const policy = await prisma.insurancePolicy.upsert({
      where: { patientId },
      update: {
        providerName,
        policyNumber,
        coverageDetails,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
      create: {
        patientId,
        providerName,
        policyNumber,
        coverageDetails,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(200).json(policy);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save policy details' });
  }
};

// Verify Insurance (Mock API check)
export const verifyInsurancePolicy = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Policy ID or Patient ID

  try {
    const policy = await prisma.insurancePolicy.findFirst({
      where: {
        OR: [{ id }, { patientId: id }],
      },
    });

    if (!policy) {
      return res.status(404).json({ error: 'Insurance policy not found' });
    }

    const today = new Date();
    const isValid = policy.isActive && new Date(policy.startDate) <= today && new Date(policy.endDate) >= today;

    res.status(200).json({
      policy,
      verified: isValid,
      status: isValid ? 'ACTIVE' : 'EXPIRED_OR_INACTIVE',
      copayDetails: '10% patient copay applies',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
};

// Submit Insurance Claim
export const submitClaim = async (req: AuthenticatedRequest, res: Response) => {
  const { invoiceId, amountClaimed, notes } = req.body;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { patient: { include: { insurancePolicy: true } } },
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (!invoice.patient.insurancePolicy) {
      return res.status(400).json({ error: 'Patient does not have an active insurance policy registered' });
    }

    const claim = await prisma.claim.create({
      data: {
        policyId: invoice.patient.insurancePolicy.id,
        invoiceId,
        amountClaimed: Number(amountClaimed) || Number(invoice.total),
        status: 'SUBMITTED',
        notes,
      },
    });

    res.status(201).json(claim);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit claim' });
  }
};

// Update Claim Status
export const updateClaimStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Claim ID
  const { status, amountApproved, notes } = req.body; // APPROVED, REJECTED, PROCESSING

  try {
    const claim = await prisma.claim.update({
      where: { id },
      data: {
        status,
        amountApproved: amountApproved ? Number(amountApproved) : undefined,
        notes,
      },
      include: {
        invoice: true,
      },
    });

    // If claim is approved, mark the invoice as PAID or update outstanding balance
    if (status === 'APPROVED' && claim.amountApproved) {
      const approvedVal = Number(claim.amountApproved);
      const isFullyPaid = approvedVal >= Number(claim.invoice.total);

      await prisma.invoice.update({
        where: { id: claim.invoiceId },
        data: {
          status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
        },
      });

      // Track the transaction matching insurance payment
      await prisma.transaction.create({
        data: {
          invoiceId: claim.invoiceId,
          amount: approvedVal,
          gateway: 'INSURANCE_DISBURSEMENT',
          referenceId: `CLAIM-${id}`,
          status: 'SUCCESS',
        },
      });
    }

    res.status(200).json(claim);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Claim status update failed' });
  }
};

// List Claims
export const listClaims = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const claims = await prisma.claim.findMany({
      where: {
        policy: {
          patient: { user: { tenantId } },
        },
      },
      include: {
        policy: {
          include: {
            patient: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(claims);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list claims' });
  }
};

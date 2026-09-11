import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';

// Generate Token
export const generateToken = async (req: AuthenticatedRequest, res: Response) => {
  const { hospitalId, patientId, doctorId, appointmentId, priority } = req.body;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get number of tokens today for this doctor to assign next token number
    const tokenCount = await prisma.queueToken.count({
      where: {
        doctorId,
        createdAt: {
          gte: today,
        },
      },
    });

    const tokenNumber = tokenCount + 1;

    const token = await prisma.queueToken.create({
      data: {
        hospitalId,
        patientId,
        doctorId,
        appointmentId,
        tokenNumber,
        priority: priority || 'NORMAL',
        status: 'WAITING',
      },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    // If appointment exists, update status to Checked-in or Waiting
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'WAITING' },
      });
    }

    // Broadcast update using Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('queue-update', { type: 'TOKEN_CREATED', token });
    }

    res.status(201).json(token);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Token generation failed' });
  }
};

// Check-in patient
export const checkInPatient = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Token ID or Appointment ID

  try {
    const token = await prisma.queueToken.update({
      where: { id },
      data: { status: 'WAITING' },
    });

    if (token.appointmentId) {
      await prisma.appointment.update({
        where: { id: token.appointmentId },
        data: { status: 'WAITING' },
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('queue-update', { type: 'STATUS_UPDATED', token });
    }

    res.status(200).json(token);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Check-in failed' });
  }
};

// Update Queue Token Status (e.g. IN_CONSULTATION, COMPLETED, CANCELLED)
export const updateQueueStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // WAITING, IN_CONSULTATION, COMPLETED, CANCELLED

  try {
    const token = await prisma.queueToken.update({
      where: { id },
      data: { status },
      include: {
        patient: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    // Map token statuses back to appointment statuses
    if (token.appointmentId) {
      let apptStatus: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' = 'WAITING';
      if (status === 'IN_CONSULTATION') apptStatus = 'IN_CONSULTATION';
      if (status === 'COMPLETED') apptStatus = 'COMPLETED';
      if (status === 'CANCELLED') apptStatus = 'CANCELLED';

      await prisma.appointment.update({
        where: { id: token.appointmentId },
        data: { status: apptStatus },
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('queue-update', { type: 'STATUS_UPDATED', token });
    }

    res.status(200).json(token);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Status update failed' });
  }
};

// Get Live Queue Dashboard data
export const getLiveQueue = async (req: AuthenticatedRequest, res: Response) => {
  const { hospitalId, doctorId } = req.query;

  try {
    const tenantId = req.user?.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queue = await prisma.queueToken.findMany({
      where: {
        hospitalId: hospitalId ? String(hospitalId) : undefined,
        doctorId: doctorId ? String(doctorId) : undefined,
        hospital: {
          tenantId,
        },
        createdAt: {
          gte: today,
        },
        status: {
          in: ['WAITING', 'IN_CONSULTATION'],
        },
      },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: [
        { priority: 'desc' }, // Emergency/Urgent first
        { tokenNumber: 'asc' }, // By queue number
      ],
    });

    res.status(200).json(queue);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch queue' });
  }
};

// Get Queue Performance Analytics
export const getQueueAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    const totalTokensToday = await prisma.queueToken.count({
      where: {
        hospital: { tenantId },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const completedToday = await prisma.queueToken.count({
      where: {
        hospital: { tenantId },
        status: 'COMPLETED',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const waitingToday = await prisma.queueToken.count({
      where: {
        hospital: { tenantId },
        status: 'WAITING',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    res.status(200).json({
      totalTokensToday,
      completedToday,
      waitingToday,
      avgWaitTimeMinutes: totalTokensToday > 0 ? 18 : 0, // Mock average calculation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
  }
};

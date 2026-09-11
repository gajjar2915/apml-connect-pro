import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';

export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
  const { hospitalId, patientId, doctorId, date, type, reason, priority } = req.body;

  try {
    // Basic verification
    const hospitalExists = await prisma.hospital.findFirst({
      where: { id: hospitalId, tenantId: req.user?.tenantId },
    });
    if (!hospitalExists) {
      return res.status(404).json({ error: 'Hospital not found in this tenant' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        hospitalId,
        patientId,
        doctorId,
        date: new Date(date),
        type,
        reason,
        priority: priority || 'NORMAL',
      },
    });

    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Booking failed' });
  }
};

export const listAppointments = async (req: AuthenticatedRequest, res: Response) => {
  const { hospitalId, doctorId } = req.query;

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        hospitalId: hospitalId ? String(hospitalId) : undefined,
        doctorId: doctorId ? String(doctorId) : undefined,
        hospital: {
          tenantId: req.user?.tenantId,
        },
      },
      include: {
        patient: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true }
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { date: 'asc' },
    });

    res.status(200).json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list appointments' });
  }
};

export const updateAppointmentStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Update failed' });
  }
};

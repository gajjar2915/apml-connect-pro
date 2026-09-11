import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';

// Get User's Notifications
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user?.id,
        isArchived: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve notifications' });
  }
};

// Mark Notification as Read
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update notification' });
  }
};

// Archive Notification
export const archiveNotification = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isArchived: true },
    });

    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to archive notification' });
  }
};

// Mock Broadcast / Outbound Notification Engine (WhatsApp, SMS, Email logs)
export const sendCommunication = async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, type, template, customMessage } = req.body; // type: SMS, WHATSAPP, EMAIL

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const message = customMessage || `Reminder for your upcoming appointment. APML Connect Pro.`;
    const target = type === 'EMAIL' ? patient.user.email : patient.user.phone || '9876543210';

    console.log(`[OUTBOUND COMM LOG - ${type}] Sent to ${target}: "${message}" using template "${template}"`);

    // Log the notification in DB for tracking
    const notification = await prisma.notification.create({
      data: {
        userId: patient.userId,
        title: `Communication Sent: ${type}`,
        message: `Template: ${template}. Body: ${message}`,
        type: 'COMMUNICATION',
      },
    });

    res.status(200).json({
      success: true,
      log: `Mocked ${type} message sent to ${target}`,
      notification,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Communication failed' });
  }
};

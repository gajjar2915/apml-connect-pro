import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import prisma from '../config/db';

export const logAudit = (action: string, resource: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Capture details after controller executes
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;
      
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId = req.params.id || req.body.id || null;
        
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            resource,
            resourceId: resourceId ? String(resourceId) : undefined,
            ipAddress: req.ip || req.socket.remoteAddress,
            details: {
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
            }
          }
        }).catch((err: any) => {
          console.error('Failed to write audit log:', err);
        });
      }
      return originalSend.apply(this, arguments as any);
    };
    next();
  };
};

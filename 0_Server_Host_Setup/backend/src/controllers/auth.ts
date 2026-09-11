import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import prisma from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_secret_token_key_2026';

export const registerTenant = async (req: Request, res: Response) => {
  const { tenantName, domain, email, password, firstName, lastName } = req.body;

  try {
    const existingTenant = await prisma.tenant.findUnique({ where: { domain } });
    if (existingTenant) {
      return res.status(400).json({ error: 'Domain already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Transaction to create tenant & administrator user
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          domain,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash,
          role: 'HOSPITAL_ADMIN',
          firstName,
          lastName,
        },
      });

      return { tenant, user };
    });

    res.status(201).json({ message: 'Tenant registered successfully', tenantId: result.tenant.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Track user session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 Hours
        deviceDetails: req.headers['user-agent'],
        ipAddress: req.ip || req.socket.remoteAddress,
      },
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantName: user.tenant.name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';

// --- LAB MANAGEMENT SUPPORT ---

// Book Lab Test
export const createLabBooking = async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, testName, bookingDate } = req.body;

  try {
    const booking = await prisma.labBooking.create({
      data: {
        patientId,
        testName,
        bookingDate: new Date(bookingDate),
        status: 'PENDING',
      },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lab booking failed' });
  }
};

// Update Lab Sample & Test Status
export const updateLabStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Booking ID
  const { status } = req.body; // PENDING, SAMPLE_COLLECTED, COMPLETED, CANCELLED

  try {
    const updated = await prisma.labBooking.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update lab status' });
  }
};

// Upload Lab Report Metadata
export const uploadLabReport = async (req: AuthenticatedRequest, res: Response) => {
  const { bookingId, resultData, fileUrl } = req.body;

  try {
    const report = await prisma.$transaction(async (tx: any) => {
      const rep = await tx.labReport.create({
        data: {
          bookingId,
          resultData: resultData || {},
          fileUrl: fileUrl || 'https://s3.amazonaws.com/apml-connect-reports/sample-report.pdf',
        },
      });

      await tx.labBooking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
      });

      return rep;
    });

    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Report upload failed' });
  }
};

// List Lab Bookings
export const listLabBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const bookings = await prisma.labBooking.findMany({
      where: {
        patient: { user: { tenantId } },
      },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list bookings' });
  }
};

// --- PHARMACY SUPPORT ---

// View Medicine Catalog (Availability)
export const listMedicines = async (req: AuthenticatedRequest, res: Response) => {
  const { search } = req.query;

  try {
    const medicines = await prisma.medicine.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { genericName: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : undefined,
      take: 20,
    });

    // Seed dummy medicines if catalog is empty
    if (medicines.length === 0 && (!search || search === '')) {
      const seedMed = await prisma.medicine.createMany({
        data: [
          { name: 'Paracetamol 650mg', genericName: 'Acetaminophen', manufacturer: 'GSK', stock: 120, price: 15.0, category: 'Analgesics' },
          { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', manufacturer: 'Abbott', stock: 85, price: 45.0, category: 'Antibiotics' },
          { name: 'Metformin 500mg', genericName: 'Metformin', manufacturer: 'Cipla', stock: 240, price: 12.5, category: 'Antidiabetics' },
        ],
        skipDuplicates: true,
      });

      const seeded = await prisma.medicine.findMany({ take: 20 });
      return res.status(200).json(seeded);
    }

    res.status(200).json(medicines);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch medicines' });
  }
};

// Submit Pharmacy Order (From Reception / Prescriptions forwarding)
export const createPharmacyOrder = async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, prescriptionId, items, paymentMethod } = req.body;

  try {
    const totalAmount = items.reduce((sum: number, itm: any) => sum + Number(itm.price) * Number(itm.quantity), 0);

    const order = await prisma.pharmacyOrder.create({
      data: {
        patientId,
        prescriptionId,
        status: 'PENDING',
        totalAmount,
        paymentMethod: paymentMethod || 'CASH',
        trackingId: `PHAR-${Date.now()}`,
      },
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate pharmacy order' });
  }
};

// List Pharmacy Orders
export const listPharmacyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const orders = await prisma.pharmacyOrder.findMany({
      where: {
        patient: { user: { tenantId } },
      },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        prescription: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list pharmacy orders' });
  }
};

// List Medicine Stocks (Postgres DB)
export const listMedicineStocks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let stocks = await prisma.medicineStock.findMany({
      orderBy: { name: 'asc' }
    });

    // If empty, auto-seed defaults in database
    if (stocks.length === 0) {
      await prisma.medicineStock.createMany({
        data: [
          { name: 'Tab. Paracetamol 650mg', qty: 450, min: 100, batch: 'BAT-2026A', expiryDays: 90, outOfStock: false },
          { name: 'Tab. Telmisartan 40mg', qty: 85, min: 100, batch: 'BAT-2026B', expiryDays: 30, outOfStock: false },
          { name: 'Tab. Amlodipine 5mg', qty: 210, min: 50, batch: 'BAT-2026C', expiryDays: 60, outOfStock: false },
          { name: 'Syp. Ascoril DX 100ml', qty: 15, min: 20, batch: 'BAT-2026D', expiryDays: 30, outOfStock: false },
          { name: 'Tab. Vitamin C 500mg', qty: 620, min: 100, batch: 'BAT-2026E', expiryDays: 90, outOfStock: false },
          { name: 'Tab. Amoxicillin 500mg', qty: 140, min: 50, batch: 'BAT-2026F', expiryDays: 60, outOfStock: false },
        ]
      });
      stocks = await prisma.medicineStock.findMany({
        orderBy: { name: 'asc' }
      });
    }

    res.status(200).json(stocks);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list stocks' });
  }
};

// Create or Update Medicine Stock (Postgres DB)
export const updateMedicineStock = async (req: AuthenticatedRequest, res: Response) => {
  const { name, qty, outOfStock, min, batch, expiryDays } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Medicine name is required' });
  }

  try {
    const stock = await prisma.medicineStock.upsert({
      where: { name },
      update: {
        qty: qty !== undefined ? Number(qty) : undefined,
        outOfStock: outOfStock !== undefined ? Boolean(outOfStock) : undefined,
        min: min !== undefined ? Number(min) : undefined,
        batch: batch !== undefined ? String(batch) : undefined,
        expiryDays: expiryDays !== undefined ? Number(expiryDays) : undefined,
      },
      create: {
        name,
        qty: qty !== undefined ? Number(qty) : 100,
        min: min !== undefined ? Number(min) : 20,
        batch: batch !== undefined ? String(batch) : 'BAT-2026',
        expiryDays: expiryDays !== undefined ? Number(expiryDays) : 90,
        outOfStock: outOfStock !== undefined ? Boolean(outOfStock) : false,
      }
    });

    res.status(200).json(stock);
  } catch (error: any) {
    res.status(505).json({ error: error.message || 'Failed to update stock' });
  }
};

// --- WHO MEDICINE DATABASE ENDPOINT ---
import { WHO_ESSENTIAL_MEDICINES } from '../data/whoMedicinesData';

export const searchWhoMedicines = async (req: AuthenticatedRequest, res: Response) => {
  const { query, category } = req.query;

  try {
    let results = WHO_ESSENTIAL_MEDICINES;

    if (category) {
      results = results.filter(m => m.category.toLowerCase().includes(String(category).toLowerCase()));
    }

    if (query) {
      const q = String(query).toLowerCase();
      results = results.filter(m => 
        m.genericName.toLowerCase().includes(q) ||
        m.atcCode.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }

    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to query WHO medicines' });
  }
};


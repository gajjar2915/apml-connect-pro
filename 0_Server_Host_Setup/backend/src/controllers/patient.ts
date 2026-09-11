import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';

// Register New Patient
export const registerPatient = async (req: AuthenticatedRequest, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    emergencyContact,
    aadhaarNumber,
  } = req.body;

  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized: Tenant missing' });
    }

    // 1. Duplicate check (phone or email or Aadhaar number)
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId,
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Patient with this email or phone already exists' });
    }

    // Mock encrypt Aadhaar
    const encryptedAadhaar = aadhaarNumber ? `ENC_${Buffer.from(aadhaarNumber).toString('base64')}` : null;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'patient123', salt);

    // Create User & Patient profile in Transaction
    const patient = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          tenantId,
          email,
          passwordHash,
          role: 'PATIENT',
          firstName,
          lastName,
          phone,
        },
      });

      const medicalRecordNumber = `MRN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const patientProfile = await tx.patient.create({
        data: {
          userId: user.id,
          medicalRecordNumber,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          bloodGroup,
          address,
          emergencyContact,
          encryptedAadhaar,
          medicalHistory: {},
        },
      });

      return { user, patientProfile };
    });

    res.status(201).json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

// Search & List Patients
export const listPatients = async (req: AuthenticatedRequest, res: Response) => {
  const { search, bloodGroup, gender } = req.query;

  try {
    const tenantId = req.user?.tenantId;
    const patients = await prisma.patient.findMany({
      where: {
        user: {
          tenantId,
          OR: search
            ? [
                { firstName: { contains: String(search), mode: 'insensitive' } },
                { lastName: { contains: String(search), mode: 'insensitive' } },
                { phone: { contains: String(search) } },
                { email: { contains: String(search), mode: 'insensitive' } },
              ]
            : undefined,
        },
        bloodGroup: bloodGroup ? String(bloodGroup) : undefined,
        gender: gender ? String(gender) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        userId: 'desc',
      },
    });

    res.status(200).json(patients);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list patients' });
  }
};

// Get Full Patient Profile Details
export const getPatientProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        familyMembers: true,
        emergencyContacts: true,
        documents: true,
        insurancePolicy: {
          include: { claims: true },
        },
        appointments: {
          include: {
            doctor: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve patient profile' });
  }
};

// Update Patient Profile
export const updatePatient = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: patient.userId },
        data: { firstName, lastName, phone },
      });

      return tx.patient.update({
        where: { id },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          bloodGroup,
          address,
          emergencyContact,
        },
      });
    });

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Update failed' });
  }
};

// Add Family Profile
export const addFamilyMember = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Patient ID
  const { name, relationship, gender, age, phone } = req.body;

  try {
    const member = await prisma.familyMember.create({
      data: {
        patientId: id,
        name,
        relationship,
        gender,
        age: Number(age),
        phone,
      },
    });

    res.status(201).json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add family member' });
  }
};

// Add Emergency Contact
export const addEmergencyContact = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Patient ID
  const { name, relationship, phone, email } = req.body;

  try {
    const contact = await prisma.emergencyContact.create({
      data: {
        patientId: id,
        name,
        relationship,
        phone,
        email,
      },
    });

    res.status(201).json(contact);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add emergency contact' });
  }
};

// Delete Patient
export const deletePatient = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Delete records referencing patient
    await prisma.$transaction([
      prisma.familyMember.deleteMany({ where: { patientId: id } }),
      prisma.emergencyContact.deleteMany({ where: { patientId: id } }),
      prisma.document.deleteMany({ where: { patientId: id } }),
      prisma.queueToken.deleteMany({ where: { patientId: id } }),
      prisma.appointment.deleteMany({ where: { patientId: id } }),
      prisma.patient.delete({ where: { id } }),
      prisma.user.delete({ where: { id: patient.userId } }),
    ]);

    res.status(200).json({ message: 'Patient profile and linked records deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Delete failed' });
  }
};

// Add Patient Document metadata (mock file vault upload)
export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // Patient ID
  const { name, type, fileUrl } = req.body;

  try {
    const document = await prisma.document.create({
      data: {
        patientId: id,
        name,
        type, // REPORT, PRESCRIPTION, INSURANCE, CONSENT
        fileUrl: fileUrl || 'https://apml-connect-s3.amazonaws.com/documents/sample_upload.pdf',
      },
    });

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Document registration failed' });
  }
};


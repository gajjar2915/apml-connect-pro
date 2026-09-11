import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock_key_or_replace_with_actual',
});

export const createMedicalRecord = async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, doctorId, symptoms, diagnosis, icd10Codes, notes, items } = req.body;

  try {
    const record = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create EMR MedicalRecord
      const medicalRecord = await tx.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          symptoms,
          diagnosis,
          icd10Codes: icd10Codes || [],
          notes,
        },
      });

      // 2. Create corresponding digital Prescription if items exist
      if (items && items.length > 0) {
        await tx.prescription.create({
          data: {
            medicalRecordId: medicalRecord.id,
            patientId,
            doctorId,
            digitalSignature: `SIG_${doctorId}_${Date.now()}`,
            items: {
              createMany: {
                data: items.map((itm: any) => ({
                  medicineName: itm.medicineName,
                  dosage: itm.dosage,
                  frequency: itm.frequency,
                  duration: itm.duration,
                  instructions: itm.instructions || '',
                })),
              },
            },
          },
        });
      }

      return medicalRecord;
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create medical record' });
  }
};

export const getPatientHistory = async (req: AuthenticatedRequest, res: Response) => {
  const { patientId } = req.params;

  try {
    const history = await prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        prescription: {
          include: { items: true }
        }
      },
      orderBy: { encounterDate: 'desc' },
    });

    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve patient medical records' });
  }
};

export const generateAiConsultSummary = async (req: AuthenticatedRequest, res: Response) => {
  const { symptoms, notes } = req.body;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock_key_or_replace_with_actual') {
      return res.status(200).json({
        summary: `[Mock AI Summary]: Patient presented with symptoms: ${symptoms}. Recommended rest and periodic follow-up. Notes: ${notes}`
      });
    }

    const prompt = `Synthesize a brief, professional clinical summary for a doctor's EMR record based on the following input details:
Symptoms: ${symptoms}
Clinical Notes: ${notes}
Provide only the summary paragraph.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    res.status(200).json({ summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'AI processing failed' });
  }
};

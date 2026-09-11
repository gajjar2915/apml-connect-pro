import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/db';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock_key_or_replace_with_actual',
});

// AI Chatbot Assistant for Receptionists
export const assistantChatbot = async (req: AuthenticatedRequest, res: Response) => {
  const { query, history } = req.body;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock_key_or_replace_with_actual') {
      const lowerQuery = query.toLowerCase();
      let reply = `I am your APML Connect Pro AI Receptionist Assistant. I can help you check schedules, triage patient symptoms, or query clinic directories.`;
      
      if (lowerQuery.includes('schedule') || lowerQuery.includes('appointment')) {
        reply = `Based on current schedules, Dr. Suresh Mehta has open slots today between 3:00 PM and 4:30 PM. Dr. Vivek Gupta is fully booked until tomorrow morning.`;
      } else if (lowerQuery.includes('triage') || lowerQuery.includes('emergency')) {
        reply = `For emergency symptoms (e.g. chest pain, breathing difficulty, severe bleeding), bypass the normal queue, generate an Emergency priority token, and assign them directly to the on-duty physician.`;
      } else if (lowerQuery.includes('billing') || lowerQuery.includes('gst')) {
        reply = `Invoices automatically calculate 18% GST on consultation fees and procedures. You can apply a discount in the billing dashboard prior to generating the invoice.`;
      }

      return res.status(200).json({ reply });
    }

    const messages = [
      {
        role: 'system' as const,
        content: `You are APML Connect Pro AI Receptionist Assistant. You help hospital desk staff manage scheduling, understand billing structures (18% GST), manage emergency queue triage priorities (Normal, Urgent, Emergency), and coordinate doctor rosters. Keep answers short, clinical, and helpful.`,
      },
      ...(history || []),
      { role: 'user' as const, content: query },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 300,
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    res.status(200).json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'AI assistant request failed' });
  }
};

// AI Appointment Scheduling Suggestions & No-Show Prediction
export const getSchedulingAdvice = async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, doctorId } = req.query;

  try {
    // Generate mock AI suggestions
    const noShowProbability = patientId ? Math.floor(10 + Math.random() * 25) : 15; // e.g. 15% probability
    const suggestions = [
      'Doctor has highest slot attendance at 10:30 AM.',
      'Patient has historically missed late-evening appointments. Prefer morning schedules.',
      'Assigning to Dr. Suresh Mehta reduces overall queue wait by 15 mins.',
    ];

    res.status(200).json({
      noShowPredictionPercentage: noShowProbability,
      reliabilityLevel: noShowProbability > 30 ? 'MEDIUM-LOW' : 'HIGH',
      slotRecommendations: suggestions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate scheduling advice' });
  }
};

// AI Patient Triage Prioritization
export const getTriagePrioritization = async (req: AuthenticatedRequest, res: Response) => {
  const { symptoms } = req.body;

  try {
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms string is required' });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock_key_or_replace_with_actual') {
      const lowerSym = symptoms.toLowerCase();
      let priority = 'NORMAL';
      let reason = 'Patient presents mild symptoms. Routine consultation suggested.';

      if (lowerSym.includes('chest pain') || lowerSym.includes('heart') || lowerSym.includes('breath') || lowerSym.includes('unconscious')) {
        priority = 'EMERGENCY';
        reason = 'Suspected cardiovascular or respiratory distress. High threat. Priority triage required immediately.';
      } else if (lowerSym.includes('fever') && lowerSym.includes('high') || lowerSym.includes('fracture') || lowerSym.includes('pain')) {
        priority = 'URGENT';
        reason = 'Patient has acute pain or high fever. Needs slot assignment within next 60 minutes.';
      }

      return res.status(200).json({ priority, reason });
    }

    const prompt = `Evaluate the following patient symptoms and classify them into one of these Triage Priorities: NORMAL, URGENT, EMERGENCY. Explain the clinical reason in one short sentence.
Symptoms: ${symptoms}
Format output as JSON: {"priority": "...", "reason": "..."}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    res.status(200).json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Triage prioritization failed' });
  }
};

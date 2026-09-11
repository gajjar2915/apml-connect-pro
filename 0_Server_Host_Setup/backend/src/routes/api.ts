import { Router } from 'express';
import { registerTenant, login } from '../controllers/auth';
import { createAppointment, listAppointments, updateAppointmentStatus } from '../controllers/appointment';
import { createMedicalRecord, getPatientHistory, generateAiConsultSummary } from '../controllers/emr';

// Receptionist controllers
import {
  registerPatient,
  listPatients,
  getPatientProfile,
  updatePatient,
  addFamilyMember,
  addEmergencyContact,
  deletePatient,
  uploadDocument,
} from '../controllers/patient';

import {
  generateToken,
  checkInPatient,
  updateQueueStatus,
  getLiveQueue,
  getQueueAnalytics,
} from '../controllers/queue';

import {
  createInvoice,
  processPayment,
  processRefund,
  listInvoices,
  getBillingAnalytics,
} from '../controllers/billing';

import {
  saveInsurancePolicy,
  verifyInsurancePolicy,
  submitClaim,
  updateClaimStatus,
  listClaims,
} from '../controllers/insurance';

import {
  createLabBooking,
  updateLabStatus,
  uploadLabReport,
  listLabBookings,
  listMedicines,
  createPharmacyOrder,
  listPharmacyOrders,
  listMedicineStocks,
  updateMedicineStock,
  searchWhoMedicines,
} from '../controllers/labPharmacy';

import {
  getNotifications,
  markAsRead,
  archiveNotification,
  sendCommunication,
} from '../controllers/notification';

import {
  assistantChatbot,
  getSchedulingAdvice,
  getTriagePrioritization,
} from '../controllers/ai';

import {
  getCaseloadReport,
  getCollectionsReport,
  exportReportCSV,
} from '../controllers/report';

import { authenticateJWT, requireRoles } from '../middlewares/auth';
import { logAudit } from '../middlewares/audit';

const router = Router();

// 1. Auth routes
router.post('/auth/register', registerTenant);
router.post('/auth/login', login);

// 2. Appointments routes (Protected)
router.post('/appointments', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT']) as any, createAppointment as any);
router.get('/appointments', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE']) as any, listAppointments as any);
router.put('/appointments/:id/status', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR']) as any, updateAppointmentStatus as any);

// 3. EMR & EHR routes (Enforces HIPAA Audit Logging)
router.post('/emr/record', authenticateJWT as any, requireRoles(['DOCTOR', 'NURSE']) as any, logAudit('CREATE_EMR_RECORD', 'MedicalRecord') as any, createMedicalRecord as any);
router.get('/emr/history/:patientId', authenticateJWT as any, requireRoles(['DOCTOR', 'NURSE', 'PATIENT']) as any, logAudit('READ_EMR_HISTORY', 'MedicalRecord') as any, getPatientHistory as any);
router.post('/emr/ai/summary', authenticateJWT as any, requireRoles(['DOCTOR']) as any, generateAiConsultSummary as any);

// 4. Patient Registry routes
router.post('/patients', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, registerPatient as any);
router.get('/patients', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR']) as any, listPatients as any);
router.get('/patients/:id', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR']) as any, getPatientProfile as any);
router.put('/patients/:id', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, updatePatient as any);
router.post('/patients/:id/family', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, addFamilyMember as any);
router.post('/patients/:id/emergency', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, addEmergencyContact as any);
router.delete('/patients/:id', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, deletePatient as any);
router.post('/patients/:id/documents', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, uploadDocument as any);

// 5. Queue routes
router.post('/queues/token', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, generateToken as any);
router.put('/queues/token/:id/checkin', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, checkInPatient as any);
router.put('/queues/token/:id/status', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR']) as any, updateQueueStatus as any);
router.get('/queues/live', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR']) as any, getLiveQueue as any);
router.get('/queues/analytics', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, getQueueAnalytics as any);

// 6. Billing routes
router.post('/billing/invoice', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, createInvoice as any);
router.post('/billing/invoice/:id/pay', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, processPayment as any);
router.post('/billing/invoice/:id/refund', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN']) as any, processRefund as any);
router.get('/billing/invoice', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, listInvoices as any);
router.get('/billing/analytics', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, getBillingAnalytics as any);

// 7. Insurance routes
router.post('/insurance/policy', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, saveInsurancePolicy as any);
router.get('/insurance/policy/:id/verify', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, verifyInsurancePolicy as any);
router.post('/insurance/claim', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, submitClaim as any);
router.put('/insurance/claim/:id/status', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN']) as any, updateClaimStatus as any);
router.get('/insurance/claims', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, listClaims as any);

// 8. Lab & Pharmacy routes
router.post('/lab/booking', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, createLabBooking as any);
router.put('/lab/booking/:id/status', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'LAB_TECHNICIAN']) as any, updateLabStatus as any);
router.post('/lab/report', authenticateJWT as any, requireRoles(['LAB_TECHNICIAN']) as any, uploadLabReport as any);
router.get('/lab/bookings', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'LAB_TECHNICIAN']) as any, listLabBookings as any);
router.get('/pharmacy/medicines', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'PHARMACIST']) as any, listMedicines as any);
router.get('/pharmacy/medicines/who', searchWhoMedicines as any);
router.post('/pharmacy/order', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, createPharmacyOrder as any);
router.get('/pharmacy/orders', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST', 'PHARMACIST']) as any, listPharmacyOrders as any);
router.get('/pharmacy/stocks', listMedicineStocks as any);
router.post('/pharmacy/stocks', updateMedicineStock as any);

// 9. Outbound Communications routes
router.post('/communication/send', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, sendCommunication as any);

// 10. AI Copilot routes
router.post('/ai/assistant', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, assistantChatbot as any);
router.get('/ai/advice', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, getSchedulingAdvice as any);
router.post('/ai/triage', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, getTriagePrioritization as any);

// 11. Reports & Analytics exports
router.get('/reports/caseload', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, getCaseloadReport as any);
router.get('/reports/collections', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, getCollectionsReport as any);
router.get('/reports/export', authenticateJWT as any, requireRoles(['HOSPITAL_ADMIN', 'RECEPTIONIST']) as any, exportReportCSV as any);

// 12. Notification Center feed
router.get('/notifications', authenticateJWT as any, getNotifications as any);
router.put('/notifications/:id/read', authenticateJWT as any, markAsRead as any);
router.put('/notifications/:id/archive', authenticateJWT as any, archiveNotification as any);

export default router;


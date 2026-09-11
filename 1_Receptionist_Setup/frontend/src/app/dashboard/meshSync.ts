'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// Core Types
export interface QueueItem {
  token: string;
  name: string;
  age: string;
  gender: string;
  doctor: string;
  status: string; // 'WAITING' | 'IN_CONSULTATION' | 'CHECKED_IN' | 'COMPLETED'
  waitTime: number;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  time: string;
  type: string;
}

export interface MedicalDoc {
  id: string;
  name: string;
  patient: string;
  type: string; // 'Lab Report' | 'Prescription' | 'Insurance' | 'Consent Form' | 'Radiology' | 'Medical Certificate' | 'Referral Letter'
  format: string; // 'PDF' | 'DICOM' | 'JPG'
  size: string;
  date: string;
  details?: any;
}

export interface Invoice {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  amount: number;
  status: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'REFUNDED';
  method: string;
}

export interface NotificationItem {
  id: number;
  icon: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  category: string; // 'appointment' | 'billing' | 'queue' | 'lab' | 'pharmacy' | 'doctor' | 'insurance' | 'system'
}

export interface BroadcastDelay {
  minutes: number;
  message: string;
  timestamp: number;
}

// Extended Types for Fully Functional Sub-modules
export interface AppointmentItem {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
  status: string; // 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  token: string;
  payStatus: 'PAID' | 'UNPAID' | 'REFUNDED';
}

export interface ClaimItem {
  id: string;
  patient: string;
  provider: string;
  policy: string;
  invoiceId: string;
  amount: number;
  approved: number | null;
  status: 'APPROVED' | 'SUBMITTED' | 'PENDING' | 'REJECTED';
  date: string;
}

export interface LabBookingItem {
  id: string;
  patient: string;
  test: string;
  doctor: string;
  date: string;
  status: 'PENDING' | 'SAMPLE_COLLECTED' | 'COMPLETED' | 'CANCELLED';
  priority: 'NORMAL' | 'URGENT';
}

export interface PatientProfileItem {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  blood: string;
  status: 'Active' | 'Inactive';
  lastVisit: string;
  insurance: boolean;
}

export interface ClinicSettings {
  notificationsEnabled: boolean;
  smsTemplatesEnabled: boolean;
  clinicAddress: string;
  clinicPhone: string;
}

export interface StockItem {
  id: string;
  name: string;
  qty: number;
  min: number;
  batch: string;
  expiryDays: number; // 30 | 60 | 90
  outOfStock: boolean;
}

export interface BillingItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface WHOMedicineItem {
  atcCode: string;
  genericName: string;
  category: string;
  dosageForm: string;
  typicalStrength: string;
  route: string;
  whoEssentialGroup: 'Core' | 'Complementary';
  description: string;
}

export interface UserAccount {
  role: 'receptionist' | 'doctor' | 'pharmacy';
  email: string;
  name: string;
  password: string;
}

// Shared State Structure
interface MeshState {
  clinicStatus: 'Online' | 'Offline';
  queue: QueueItem[];
  documents: MedicalDoc[];
  invoices: Invoice[];
  notifications: NotificationItem[];
  broadcastDelay: BroadcastDelay | null;
  
  // Extended Collections
  appointments: AppointmentItem[];
  claims: ClaimItem[];
  labBookings: LabBookingItem[];
  patients: PatientProfileItem[];
  settings: ClinicSettings;
  stocks: StockItem[];
  whoMedicines: WHOMedicineItem[];
  billingCatalog: BillingItem[];
  accounts: UserAccount[];
}

// Initial Mock Datasets
const defaultQueue: QueueItem[] = [
  {
    token: 'A-101',
    name: 'Rahul Kumar',
    age: '34',
    gender: 'Male',
    doctor: 'Dr. Sarah Jenkins',
    status: 'WAITING',
    waitTime: 10,
    priority: 'URGENT',
    time: '10:15 AM',
    type: 'Walk-In Consultation'
  },
  {
    token: 'A-102',
    name: 'Priya Sharma',
    age: '28',
    gender: 'Female',
    doctor: 'Dr. Sarah Jenkins',
    status: 'WAITING',
    waitTime: 20,
    priority: 'NORMAL',
    time: '10:30 AM',
    type: 'Follow-Up'
  },
  {
    token: 'A-103',
    name: 'Amit Patel',
    age: '45',
    gender: 'Male',
    doctor: 'Dr. Sarah Jenkins',
    status: 'WAITING',
    waitTime: 30,
    priority: 'NORMAL',
    time: '10:45 AM',
    type: 'New Consultation'
  }
];
const defaultDocs: MedicalDoc[] = [];
const defaultInvoices: Invoice[] = [];
const defaultNotifications: NotificationItem[] = [];
const defaultAppointments: AppointmentItem[] = [];
const defaultClaims: ClaimItem[] = [];
const defaultLabBookings: LabBookingItem[] = [];
const defaultPatients: PatientProfileItem[] = [
  {
    id: 'P101',
    mrn: 'MRN-8801',
    name: 'Rahul Kumar',
    age: 34,
    gender: 'Male',
    phone: '+91 9876543210',
    blood: 'O+',
    status: 'Active',
    lastVisit: '2026-07-20',
    insurance: true
  },
  {
    id: 'P102',
    mrn: 'MRN-8802',
    name: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    phone: '+91 9876543211',
    blood: 'B+',
    status: 'Active',
    lastVisit: '2026-07-15',
    insurance: false
  },
  {
    id: 'P103',
    mrn: 'MRN-8803',
    name: 'Amit Patel',
    age: 45,
    gender: 'Male',
    phone: '+91 9876543212',
    blood: 'A+',
    status: 'Active',
    lastVisit: '2026-07-22',
    insurance: true
  }
];

const defaultSettings: ClinicSettings = {
  notificationsEnabled: true,
  smsTemplatesEnabled: true,
  clinicAddress: '12, Green Park Avenue, Metro Hub',
  clinicPhone: '+91 9988221100',
};

const defaultStocks: StockItem[] = [
  { id: 'STK001', name: 'Tab. Paracetamol 650mg', qty: 450, min: 100, batch: 'BAT-2026A', expiryDays: 90, outOfStock: false },
  { id: 'STK002', name: 'Tab. Telmisartan 40mg', qty: 85, min: 100, batch: 'BAT-2026B', expiryDays: 30, outOfStock: false },
  { id: 'STK003', name: 'Tab. Amlodipine 5mg', qty: 210, min: 50, batch: 'BAT-2026C', expiryDays: 60, outOfStock: false },
  { id: 'STK004', name: 'Syp. Ascoril DX 100ml', qty: 15, min: 20, batch: 'BAT-2026D', expiryDays: 30, outOfStock: false },
  { id: 'STK005', name: 'Tab. Vitamin C 500mg', qty: 620, min: 100, batch: 'BAT-2026E', expiryDays: 90, outOfStock: false },
  { id: 'STK006', name: 'Tab. Amoxicillin 500mg', qty: 140, min: 50, batch: 'BAT-2026F', expiryDays: 60, outOfStock: false },
];

const defaultBillingCatalog: BillingItem[] = [
  { id: 'BC001', name: 'First Consultation', price: 500, category: 'Consultation Fees' },
  { id: 'BC002', name: 'Follow-Up Consultation', price: 300, category: 'Consultation Fees' },
  { id: 'BC003', name: 'Emergency Consultation', price: 800, category: 'Consultation Fees' },
  { id: 'BC004', name: 'Wound Dressing', price: 250, category: 'Clinic Procedures' },
  { id: 'BC005', name: 'ECG (Electrocardiogram)', price: 350, category: 'In-House Diagnostics' },
  { id: 'BC006', name: 'Blood Test (CBC)', price: 400, category: 'In-House Diagnostics' },
  { id: 'BC007', name: 'X-Ray Chest', price: 600, category: 'In-House Diagnostics' },
];

const defaultAccounts: UserAccount[] = [
  { role: 'receptionist', email: 'receptionist@clinic.com', name: 'Reception Front Desk', password: '123' },
  { role: 'doctor', email: 'doctor@clinic.com', name: 'Dr. Sarah Jenkins', password: '123' },
  { role: 'pharmacy', email: 'pharmacy@clinic.com', name: 'Pharmacy Counter', password: '123' },
];

const defaultWhoMedicines: WHOMedicineItem[] = [
  // Analgesics & Pain Management
  { atcCode: 'N02BE01', genericName: 'Paracetamol (Acetaminophen)', category: 'Analgesics & Antipyretics', dosageForm: 'Tablet / Oral Liquid', typicalStrength: '500mg / 650mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'First-line non-opioid analgesic and antipyretic for pain and fever.' },
  { atcCode: 'M01AE01', genericName: 'Ibuprofen', category: 'Anti-inflammatory & Anti-rheumatic', dosageForm: 'Tablet / Oral Suspension', typicalStrength: '200mg / 400mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'NSAID for pain, fever, and acute inflammation.' },
  { atcCode: 'M01AB05', genericName: 'Diclofenac Sodium', category: 'NSAIDs (Analgesics)', dosageForm: 'Tablet / Injection / Gel', typicalStrength: '50mg / 75mg', route: 'Oral / IM / Topical', whoEssentialGroup: 'Core', description: 'Potent non-steroidal anti-inflammatory drug.' },
  { atcCode: 'M01AE02', genericName: 'Naproxen', category: 'NSAIDs (Analgesics)', dosageForm: 'Tablet', typicalStrength: '250mg / 500mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Long-acting NSAID for osteoarthritis and acute pain.' },
  { atcCode: 'N02AJ13', genericName: 'Tramadol Hydrochloride', category: 'Analgesics (Opioids)', dosageForm: 'Capsule / Injection', typicalStrength: '50mg / 100mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Central acting synthetic opioid analgesic for moderate-severe pain.' },
  { atcCode: 'N02AA01', genericName: 'Morphine Sulfate', category: 'Analgesics (Severe Pain)', dosageForm: 'Tablet / Injection', typicalStrength: '10mg / 30mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Gold standard opioid for severe acute and cancer pain.' },
  
  // Antibacterials & Antimicrobials
  { atcCode: 'J01CA04', genericName: 'Amoxicillin', category: 'Antibacterials (Penicillins)', dosageForm: 'Capsule / Oral Suspension', typicalStrength: '250mg / 500mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Broad-spectrum antibiotic for respiratory and ENT infections.' },
  { atcCode: 'J01CR02', genericName: 'Amoxicillin + Clavulanate (Augmentin)', category: 'Antibacterials (Penicillin + Inhibitor)', dosageForm: 'Tablet / Oral Suspension', typicalStrength: '500mg+125mg / 875mg+125mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Combination antibiotic for beta-lactamase producing infections.' },
  { atcCode: 'J01FA10', genericName: 'Azithromycin', category: 'Antibacterials (Macrolides)', dosageForm: 'Tablet / Oral Suspension', typicalStrength: '250mg / 500mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Macrolide antibiotic for community pneumonia and RTI.' },
  { atcCode: 'J01MA02', genericName: 'Ciprofloxacin', category: 'Antibacterials (Fluoroquinolones)', dosageForm: 'Tablet / IV Infusion', typicalStrength: '250mg / 500mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Fluoroquinolone for urinary and GI infections.' },
  { atcCode: 'J01MA12', genericName: 'Levofloxacin', category: 'Antibacterials (Fluoroquinolones)', dosageForm: 'Tablet / IV Infusion', typicalStrength: '250mg / 500mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Respiratory fluoroquinolone for severe bacterial pneumonia.' },
  { atcCode: 'J01DD04', genericName: 'Ceftriaxone', category: 'Antibacterials (Cephalosporins 3rd Gen)', dosageForm: 'Injection (IV/IM)', typicalStrength: '1g / 2g', route: 'IV / IM', whoEssentialGroup: 'Core', description: 'Parenteral 3rd generation cephalosporin for severe systemic infections.' },
  { atcCode: 'J01DD08', genericName: 'Cefixime', category: 'Antibacterials (Oral Cephalosporins)', dosageForm: 'Tablet / Syrup', typicalStrength: '100mg / 200mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Oral 3rd gen cephalosporin for typhoid and urinary tract infections.' },
  { atcCode: 'J01AA02', genericName: 'Doxycycline', category: 'Antibacterials (Tetracyclines)', dosageForm: 'Capsule / Tablet', typicalStrength: '100mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Tetracycline antibiotic for malaria prophylaxis and atypical pneumonia.' },
  { atcCode: 'J01XD01', genericName: 'Metronidazole', category: 'Antiprotozoals & Antibacterials', dosageForm: 'Tablet / IV Infusion', typicalStrength: '200mg / 400mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Nitroimidazole for amoebiasis, giardiasis, and anaerobic infections.' },
  { atcCode: 'J02AC01', genericName: 'Fluconazole', category: 'Antifungals (Systemic)', dosageForm: 'Capsule / IV Infusion', typicalStrength: '50mg / 150mg / 200mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Triazole antifungal for candidiasis and systemic fungal infections.' },

  // Cardiovascular & Antihypertensives
  { atcCode: 'C09CA07', genericName: 'Telmisartan', category: 'Cardiovascular (ARBs)', dosageForm: 'Tablet', typicalStrength: '20mg / 40mg / 80mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Angiotensin II receptor blocker for essential hypertension.' },
  { atcCode: 'C08CA01', genericName: 'Amlodipine', category: 'Cardiovascular (Calcium Channel Blockers)', dosageForm: 'Tablet', typicalStrength: '2.5mg / 5mg / 10mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Calcium channel blocker for hypertension and angina.' },
  { atcCode: 'C09AA02', genericName: 'Enalapril Maleate', category: 'Cardiovascular (ACE Inhibitors)', dosageForm: 'Tablet', typicalStrength: '2.5mg / 5mg / 10mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'ACE inhibitor for hypertension and heart failure management.' },
  { atcCode: 'C09AA05', genericName: 'Lisinopril', category: 'Cardiovascular (ACE Inhibitors)', dosageForm: 'Tablet', typicalStrength: '5mg / 10mg / 20mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'First-line ACE inhibitor for hypertension and post-MI cardiac care.' },
  { atcCode: 'C07AB03', genericName: 'Atenolol', category: 'Cardiovascular (Beta Blockers)', dosageForm: 'Tablet', typicalStrength: '25mg / 50mg / 100mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Cardioselectve beta blocker for hypertension and arrhythmias.' },
  { atcCode: 'C07AB02', genericName: 'Metoprolol Succinate', category: 'Cardiovascular (Beta Blockers)', dosageForm: 'Extended Release Tablet', typicalStrength: '25mg / 50mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Beta blocker for chronic heart failure and ischemic heart disease.' },
  { atcCode: 'C03CA01', genericName: 'Furosemide (Lasix)', category: 'Diuretics (Loop Diuretics)', dosageForm: 'Tablet / Injection', typicalStrength: '40mg / 20mg IV', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Loop diuretic for pulmonary edema and congestive heart failure.' },
  { atcCode: 'C03AA03', genericName: 'Hydrochlorothiazide', category: 'Diuretics (Thiazides)', dosageForm: 'Tablet', typicalStrength: '12.5mg / 25mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Thiazide diuretic for essential hypertension.' },
  { atcCode: 'C10AA05', genericName: 'Atorvastatin', category: 'Lipid Lowering (Statins)', dosageForm: 'Tablet', typicalStrength: '10mg / 20mg / 40mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'HMG-CoA reductase inhibitor for hypercholesterolemia and CAD.' },
  { atcCode: 'C10AA07', genericName: 'Rosuvastatin', category: 'Lipid Lowering (Statins)', dosageForm: 'Tablet', typicalStrength: '5mg / 10mg / 20mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Potent statin for aggressive LDL cholesterol reduction.' },
  { atcCode: 'B01AC04', genericName: 'Clopidogrel', category: 'Antiplatelet Agents', dosageForm: 'Tablet', typicalStrength: '75mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'P2Y12 inhibitor antiplatelet for stroke and MI prevention.' },
  { atcCode: 'B01AC06', genericName: 'Aspirin (Acetylsalicylic Acid)', category: 'Antiplatelet & Analgesics', dosageForm: 'Ecotrin / Soluble Tablet', typicalStrength: '75mg / 150mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Low dose antiplatelet for cardiovascular protection.' },

  // Antidiabetics & Endocrine
  { atcCode: 'A10BA02', genericName: 'Metformin Hydrochloride', category: 'Antidiabetics (Biguanides)', dosageForm: 'Tablet / ER Tablet', typicalStrength: '500mg / 850mg / 1000mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'First-line oral antidiabetic for Type 2 diabetes mellitus.' },
  { atcCode: 'A10BB12', genericName: 'Glimepiride', category: 'Antidiabetics (Sulfonylureas)', dosageForm: 'Tablet', typicalStrength: '1mg / 2mg / 3mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Second generation sulfonylurea for glycemic control.' },
  { atcCode: 'A10BH01', genericName: 'Sitagliptin', category: 'Antidiabetics (DPP-4 Inhibitors)', dosageForm: 'Tablet', typicalStrength: '50mg / 100mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'DPP-4 inhibitor for postprandial glucose regulation.' },
  { atcCode: 'A10BK01', genericName: 'Empagliflozin', category: 'Antidiabetics (SGLT2 Inhibitors)', dosageForm: 'Tablet', typicalStrength: '10mg / 25mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'SGLT2 inhibitor with proven cardiovascular & renal protection.' },
  { atcCode: 'A10AB01', genericName: 'Human Insulin (Regular)', category: 'Insulins (Short-Acting)', dosageForm: 'Injection Vial / Pen', typicalStrength: '100 IU/ml', route: 'Subcutaneous / IV', whoEssentialGroup: 'Core', description: 'Short-acting human insulin for glycemic management and DKA.' },
  { atcCode: 'H03AA01', genericName: 'Levothyroxine Sodium', category: 'Thyroid Hormones', dosageForm: 'Tablet', typicalStrength: '25mcg / 50mcg / 100mcg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Synthetic thyroid hormone for hypothyroidism.' },

  // Gastrointestinal & Antiemetics
  { atcCode: 'A02BC01', genericName: 'Omeprazole', category: 'Gastrointestinal (PPIs)', dosageForm: 'Capsule', typicalStrength: '20mg / 40mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Proton pump inhibitor for GERD, gastritis and peptic ulcer disease.' },
  { atcCode: 'A02BC02', genericName: 'Pantoprazole', category: 'Gastrointestinal (PPIs)', dosageForm: 'Tablet / IV Injection', typicalStrength: '40mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Acid reducer for acid reflux, ulcers, and stress gastritis.' },
  { atcCode: 'A04AA01', genericName: 'Ondansetron', category: 'Antiemetics (5-HT3 Antagonists)', dosageForm: 'Tablet / Orally Disintegrating / IV', typicalStrength: '4mg / 8mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Serotonin antagonist for acute nausea and vomiting.' },
  { atcCode: 'A03FA03', genericName: 'Domperidone', category: 'Prokinetics & Antiemetics', dosageForm: 'Tablet / Suspension', typicalStrength: '10mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Dopamine antagonist for dyspepsia and nausea.' },
  { atcCode: 'A07CA01', genericName: 'Oral Rehydration Salts (ORS)', category: 'Electrolyte & Rehydration', dosageForm: 'Powder Sachet', typicalStrength: 'WHO Formula (20.5g)', route: 'Oral', whoEssentialGroup: 'Core', description: 'Essential oral electrolyte replacement for dehydration from diarrhea.' },

  // Respiratory & Allergy
  { atcCode: 'R03AC02', genericName: 'Salbutamol (Albuterol)', category: 'Respiratory (Beta-2 Agonists)', dosageForm: 'Inhaler / Nebuliser Solution', typicalStrength: '100mcg/dose', route: 'Inhalation', whoEssentialGroup: 'Core', description: 'Short-acting beta-2 agonist for acute bronchospasm and asthma relief.' },
  { atcCode: 'R03BA02', genericName: 'Budesonide', category: 'Inhaled Corticosteroids', dosageForm: 'Inhaler / Respules', typicalStrength: '100mcg / 200mcg / 0.5mg', route: 'Inhalation', whoEssentialGroup: 'Core', description: 'Inhaled corticosteroid for maintenance treatment of asthma & COPD.' },
  { atcCode: 'R03DC03', genericName: 'Montelukast Sodium', category: 'Leukotriene Receptor Antagonists', dosageForm: 'Tablet / Chewable', typicalStrength: '5mg / 10mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Leukotriene receptor antagonist for allergic rhinitis and asthma.' },
  { atcCode: 'R06AX27', genericName: 'Levocetirizine', category: 'Antihistamines (Systemic)', dosageForm: 'Tablet / Syrup', typicalStrength: '5mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Non-sedating H1 antagonist for allergic rhinitis and urticaria.' },
  { atcCode: 'R06AE07', genericName: 'Cetirizine Hydrochloride', category: 'Antihistamines (Systemic)', dosageForm: 'Tablet / Syrup', typicalStrength: '10mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Second generation antihistamine for seasonal allergies.' },

  // Corticosteroids & Neuro-Psychiatric
  { atcCode: 'H02AB02', genericName: 'Dexamethasone', category: 'Corticosteroids (Systemic)', dosageForm: 'Tablet / Injection', typicalStrength: '0.5mg / 4mg', route: 'Oral / IV', whoEssentialGroup: 'Core', description: 'Glucocorticoid for severe inflammation, anaphylaxis & respiratory distress.' },
  { atcCode: 'H02AB06', genericName: 'Prednisolone', category: 'Corticosteroids (Systemic)', dosageForm: 'Tablet / Syrup', typicalStrength: '5mg / 10mg / 20mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Oral steroid for acute asthma exacerbations and autoimmune disorders.' },
  { atcCode: 'N05BA12', genericName: 'Alprazolam', category: 'Anxiolytics (Benzodiazepines)', dosageForm: 'Tablet', typicalStrength: '0.25mg / 0.5mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Short-acting benzodiazepine for acute panic and anxiety disorders.' },
  { atcCode: 'N03AE01', genericName: 'Clonazepam', category: 'Antiepileptics & Anxiolytics', dosageForm: 'Tablet', typicalStrength: '0.5mg / 1mg / 2mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'Benzodiazepine for seizure disorders and panic attacks.' },
  { atcCode: 'N06AB06', genericName: 'Sertraline', category: 'Antidepressants (SSRIs)', dosageForm: 'Tablet', typicalStrength: '25mg / 50mg / 100mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'SSRI antidepressant for major depressive disorder and OCD.' },
  { atcCode: 'N02BF01', genericName: 'Gabapentin', category: 'Neuropathic Pain & Antiepileptics', dosageForm: 'Capsule', typicalStrength: '100mg / 300mg', route: 'Oral', whoEssentialGroup: 'Core', description: 'GABA analog for diabetic neuropathy and post-herpetic neuralgia.' }
];

// Global Store State Initialization
let globalState: MeshState = {
  clinicStatus: 'Online',
  queue: [...defaultQueue],
  documents: [...defaultDocs],
  invoices: [...defaultInvoices],
  notifications: [...defaultNotifications],
  broadcastDelay: null,
  
  appointments: [...defaultAppointments],
  claims: [...defaultClaims],
  labBookings: [...defaultLabBookings],
  patients: [...defaultPatients],
  settings: { ...defaultSettings },
  stocks: [...defaultStocks],
  whoMedicines: [...defaultWhoMedicines],
  billingCatalog: [...defaultBillingCatalog],
  accounts: [...defaultAccounts],
};

// Safe LocalStorage De-serialization
const IS_SERVER = typeof window === 'undefined';
const LOCAL_STORAGE_KEY = 'mesh_local_store';

// Dynamic host discovery for multi-device local Wi-Fi setup
const getApiUrl = () => {
  if (!IS_SERVER) {
    const savedIp = localStorage.getItem('api_host_ip');
    if (savedIp) {
      return `http://${savedIp}:5005`;
    }
    return `http://${window.location.hostname}:5005`;
  }
  return 'http://localhost:5005';
};

if (!IS_SERVER) {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      globalState = {
        clinicStatus: parsed.clinicStatus ?? 'Online',
        queue: (parsed.queue && parsed.queue.length > 0) ? parsed.queue : defaultQueue,
        documents: parsed.documents ?? defaultDocs,
        invoices: parsed.invoices ?? defaultInvoices,
        notifications: parsed.notifications ?? defaultNotifications,
        broadcastDelay: parsed.broadcastDelay ?? null,
        appointments: parsed.appointments ?? defaultAppointments,
        claims: parsed.claims ?? defaultClaims,
        labBookings: parsed.labBookings ?? defaultLabBookings,
        patients: (parsed.patients && parsed.patients.length > 0) ? parsed.patients : defaultPatients,
        settings: parsed.settings ?? defaultSettings,
        stocks: parsed.stocks ?? defaultStocks,
        whoMedicines: (parsed.whoMedicines && parsed.whoMedicines.length > 0) ? parsed.whoMedicines : defaultWhoMedicines,
        billingCatalog: parsed.billingCatalog ?? defaultBillingCatalog,
        accounts: parsed.accounts ?? defaultAccounts,
      };
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(globalState));
    }
  } catch (e) {
    console.error('Failed to load local mesh cache', e);
  }
}

let socket: Socket | null = null;

const connectCentralSocket = () => {
  if (IS_SERVER || socket) return;
  try {
    const apiUrl = getApiUrl();
    socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    socket.on('mesh-sync-update', (remoteState: MeshState) => {
      if (remoteState && Array.isArray(remoteState.queue)) {
        globalState = remoteState;
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(globalState));
        } catch (e) {}
        listeners.forEach(l => l());
      }
    });
  } catch (e) {
    console.error('Central socket connection error:', e);
  }
};

// React State Listener Pools
const listeners = new Set<() => void>();

// Synchronize state across tabs, Central Server Socket, and HTTP
const broadcastState = () => {
  if (IS_SERVER) return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(globalState));
    const channel = new BroadcastChannel('apml_connect_mesh');
    channel.postMessage('sync');
    channel.close();
  } catch (e) {}

  // Sync to Central Backend Server real-time socket
  if (socket && socket.connected) {
    socket.emit('mesh-sync-update', globalState);
  }

  // Backup HTTP Post to Central Server
  try {
    const apiUrl = getApiUrl();
    fetch(`${apiUrl}/api/mesh-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(globalState),
    }).catch(() => {});
  } catch (e) {}

  listeners.forEach(l => l());
};

// Browser Broadcaster & Real-time Socket Listener
if (!IS_SERVER) {
  connectCentralSocket();

  try {
    const channel = new BroadcastChannel('apml_connect_mesh');
    channel.onmessage = (e) => {
      if (e.data === 'sync') {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          globalState = JSON.parse(saved);
          listeners.forEach(l => l());
        }
      }
    };
  } catch (e) {}

  // Periodic 1.5-second Real-Time Database Poll to central server
  setInterval(() => {
    try {
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/mesh-sync`)
        .then(res => res.json())
        .then((remoteState: MeshState) => {
          if (remoteState && Array.isArray(remoteState.queue)) {
            const currentStr = JSON.stringify(globalState.queue);
            const remoteStr = JSON.stringify(remoteState.queue);
            const currentPatStr = JSON.stringify(globalState.patients);
            const remotePatStr = JSON.stringify(remoteState.patients);

            if (currentStr !== remoteStr || currentPatStr !== remotePatStr) {
              globalState = remoteState;
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(globalState));
              } catch (e) {}
              listeners.forEach(l => l());
            }
          }
        })
        .catch(() => {});
    } catch (e) {}
  }, 1500);

  // Storage Fallback
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
      globalState = JSON.parse(e.newValue);
      listeners.forEach(l => l());
    }
  });
}

// MUTATOR METHODS

export const setClinicStatusSync = (status: 'Online' | 'Offline') => {
  globalState.clinicStatus = status;
  
  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: status === 'Online' ? '🟢' : '🔴',
    title: `Clinic Status Changed`,
    desc: `Clinic operations set to ${status}.`,
    time: 'Just now',
    read: false,
    category: 'system',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const setQueueSync = (newQueue: QueueItem[]) => {
  globalState.queue = newQueue;
  broadcastState();
};

export const addQueueTokenSync = (item: Partial<QueueItem>) => {
  const nextNumber = globalState.queue.length + 101;
  const tokenStr = item.token || `A-${nextNumber}`;
  const waitMinutes = globalState.queue.filter(q => q && (q.status === 'WAITING' || q.status === 'CHECKED_IN')).length * 10;
  const timeStr = item.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const statusStr = item.status || 'WAITING';
  const doctorStr = item.doctor || 'Dr. Sarah Jenkins';

  const newQueueItem: QueueItem = {
    token: tokenStr,
    name: item.name || 'Walk-In Patient',
    age: String(item.age || '30'),
    gender: item.gender || 'Male',
    doctor: doctorStr,
    status: statusStr,
    waitTime: waitMinutes,
    priority: item.priority || 'NORMAL',
    time: timeStr,
    type: item.type || 'OPD Consultation',
  };
  globalState.queue = [...globalState.queue, newQueueItem];
  
  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: '🎫',
    title: `Token ${tokenStr} Generated`,
    desc: `Patient ${newQueueItem.name} checked into OPD list.`,
    time: 'Just now',
    read: false,
    category: 'queue',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const updateQueueItemStatusSync = (token: string, status: string) => {
  globalState.queue = globalState.queue.map(q => {
    if (q.token === token) {
      return { ...q, status };
    }
    return q;
  });

  const patName = globalState.queue.find(q => q.token === token)?.name || 'Patient';
  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: status === 'IN_CONSULTATION' ? '🩺' : status === 'COMPLETED' ? '✅' : '⏳',
    title: `Queue Status Update`,
    desc: `${patName} status updated to ${status}.`,
    time: 'Just now',
    read: false,
    category: 'queue',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const addDocumentSync = (doc: Omit<MedicalDoc, 'id' | 'date'>) => {
  const newDoc: MedicalDoc = {
    ...doc,
    id: `DOC${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().split('T')[0],
  };
  globalState.documents = [newDoc, ...globalState.documents];
  
  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: '📁',
    title: `New Document Generated`,
    desc: `${doc.type} compiled for ${doc.patient}.`,
    time: 'Just now',
    read: false,
    category: 'doctor',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const addInvoiceSync = (inv: Omit<Invoice, 'id' | 'date'>) => {
  const newInv: Invoice = {
    ...inv,
    id: `INV${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
  };
  globalState.invoices = [newInv, ...globalState.invoices];
  
  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: '💳',
    title: `Invoice Issued`,
    desc: `Total bill of ₹${inv.amount} created for ${inv.patient}.`,
    time: 'Just now',
    read: false,
    category: 'billing',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const payInvoiceSync = (id: string, paymentMethod: string) => {
  let patientName = '';
  globalState.invoices = globalState.invoices.map(inv => {
    if (inv.id === id) {
      patientName = inv.patient;
      globalState.appointments = globalState.appointments.map(a => 
        a.patient === inv.patient && a.payStatus === 'UNPAID' ? { ...a, payStatus: 'PAID' } : a
      );
      return { ...inv, status: 'PAID', method: paymentMethod };
    }
    return inv;
  });

  const invAmount = globalState.invoices.find(inv => inv.id === id)?.amount || 0;
  if (patientName) {
    const newNotif: NotificationItem = {
      id: Date.now(),
      icon: '✅',
      title: `Invoice Paid`,
      desc: `₹${invAmount} received from ${patientName} via ${paymentMethod}`,
      time: 'Just now',
      read: false,
      category: 'billing',
    };
    globalState.notifications = [newNotif, ...globalState.notifications];
  }

  broadcastState();
};

export const broadcastDelaySync = (minutes: number, message: string) => {
  const delay: BroadcastDelay = {
    minutes,
    message,
    timestamp: Date.now(),
  };
  globalState.broadcastDelay = delay;

  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: '⚠️',
    title: `Doctor Broadcasted Delay`,
    desc: `Delay of ${minutes} minutes broadcasted: "${message}"`,
    time: 'Just now',
    read: false,
    category: 'system',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];

  broadcastState();
};

export const clearDelaySync = () => {
  globalState.broadcastDelay = null;
  broadcastState();
};

export const markNotificationsReadSync = () => {
  globalState.notifications = globalState.notifications.map(n => ({ ...n, read: true }));
  broadcastState();
};

export const markNotificationReadSync = (id: number) => {
  globalState.notifications = globalState.notifications.map(n => n.id === id ? { ...n, read: true } : n);
  broadcastState();
};

export const archiveNotificationSync = (id: number) => {
  globalState.notifications = globalState.notifications.filter(n => n.id !== id);
  broadcastState();
};

// MUTATORS FOR THE EXTENDED MODULES

export const addAppointmentSync = (appt: Omit<AppointmentItem, 'id' | 'token'>) => {
  const idNum = Math.floor(100 + Math.random() * 900);
  const tokenNum = `A${Math.floor(100 + Math.random() * 950)}`;
  const newAppt: AppointmentItem = {
    ...appt,
    id: `APT${idNum}`,
    token: tokenNum,
  };
  globalState.appointments = [newAppt, ...globalState.appointments];

  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: '📅',
    title: `Appointment Booked`,
    desc: `${appt.patient} scheduled with ${appt.doctor} on ${appt.date}.`,
    time: 'Just now',
    read: false,
    category: 'appointment',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const updateAppointmentStatusSync = (id: string, status: string) => {
  globalState.appointments = globalState.appointments.map(a => {
    if (a.id === id) {
      return { ...a, status };
    }
    return a;
  });
  broadcastState();
};

export const addClaimSync = (claim: Omit<ClaimItem, 'id' | 'date'>) => {
  const newClaim: ClaimItem = {
    ...claim,
    id: `CL${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().split('T')[0],
  };
  globalState.claims = [newClaim, ...globalState.claims];

  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: '🛡️',
    title: `Insurance Claim Submitted`,
    desc: `Claim of ₹${claim.amount} filed for ${claim.patient}.`,
    time: 'Just now',
    read: false,
    category: 'insurance',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const updateClaimStatusSync = (id: string, status: 'APPROVED' | 'SUBMITTED' | 'PENDING' | 'REJECTED', approvedAmount?: number) => {
  globalState.claims = globalState.claims.map(c => {
    if (c.id === id) {
      return { ...c, status, approved: approvedAmount !== undefined ? approvedAmount : c.amount };
    }
    return c;
  });
  broadcastState();
};

export const addLabBookingSync = (booking: Omit<LabBookingItem, 'id'>) => {
  const newBooking: LabBookingItem = {
    ...booking,
    id: `LT${Math.floor(100 + Math.random() * 900)}`,
  };
  globalState.labBookings = [newBooking, ...globalState.labBookings];

  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: '🧪',
    title: `Lab Test Booked`,
    desc: `${booking.test} scheduled for ${booking.patient}.`,
    time: 'Just now',
    read: false,
    category: 'lab',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const updateLabBookingStatusSync = (id: string, status: 'PENDING' | 'SAMPLE_COLLECTED' | 'COMPLETED' | 'CANCELLED') => {
  globalState.labBookings = globalState.labBookings.map(l => {
    if (l.id === id) {
      if (status === 'COMPLETED') {
        addDocumentSync({
          name: `Lab Report - ${l.test}`,
          patient: l.patient,
          type: 'Lab Report',
          format: 'PDF',
          size: '1.1 MB',
          details: { test: l.test, doctor: l.doctor, remarks: 'Normal reference range.' }
        });
      }
      return { ...l, status };
    }
    return l;
  });
  broadcastState();
};

export const addPatientProfileSync = (patient: Omit<PatientProfileItem, 'id' | 'mrn'>) => {
  const mrnVal = `MRN-2024${Math.floor(1000 + Math.random() * 9000)}`;
  const newPatient: PatientProfileItem = {
    ...patient,
    id: `P${Math.floor(100 + Math.random() * 900)}`,
    mrn: mrnVal,
  };
  globalState.patients = [newPatient, ...globalState.patients];

  const newNotif: NotificationItem = {
    id: Date.now(),
    icon: '👤',
    title: `Patient Registered`,
    desc: `${patient.name} registered with MRN ${mrnVal}.`,
    time: 'Just now',
    read: false,
    category: 'system',
  };
  globalState.notifications = [newNotif, ...globalState.notifications];
  broadcastState();
};

export const deletePatientProfileSync = (id: string) => {
  globalState.patients = globalState.patients.filter(p => p.id !== id);
  broadcastState();
};

export const updateClinicSettingsSync = (settings: ClinicSettings) => {
  globalState.settings = settings;
  broadcastState();
};

export const updateStockSync = (name: string, qty: number, outOfStock: boolean) => {
  globalState.stocks = globalState.stocks.map(s => {
    if (s.name.toLowerCase() === name.toLowerCase() || s.name.toLowerCase().includes(name.toLowerCase())) {
      return { ...s, qty, outOfStock };
    }
    return s;
  });

  if (outOfStock) {
    const newNotif: NotificationItem = {
      id: Date.now(),
      icon: '⚠️',
      title: 'Medicine Out of Stock',
      desc: `Alert: ${name} is out of stock in Pharmacy Hub.`,
      time: 'Just now',
      read: false,
      category: 'pharmacy'
    };
    globalState.notifications = [newNotif, ...globalState.notifications];
  }

  // Persist to Postgres database via API
  fetch(`${getApiUrl()}/api/pharmacy/stocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, qty, outOfStock })
  }).catch(err => console.error('Failed to persist stock update to Postgres', err));

  broadcastState();
};

// React hook that pages can use to subscribe to the synced states
export function useMeshSync() {
  const [meshState, setMeshState] = useState<MeshState>({ ...globalState });

  useEffect(() => {
    setMeshState({ ...globalState });

    // Fetch initial stocks from Postgres DB
    fetch(`${getApiUrl()}/api/pharmacy/stocks`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            qty: d.qty,
            min: d.min,
            batch: d.batch,
            expiryDays: d.expiryDays,
            outOfStock: d.outOfStock,
          }));
          globalState.stocks = formatted;
          setMeshState({ ...globalState });
          
          // Broadcast to sync other open tabs
          try {
            const channel = new BroadcastChannel('apml_connect_mesh');
            channel.postMessage({ type: 'SYNC_STATE', state: globalState });
            channel.close();
          } catch(e) {}
        }
      })
      .catch(err => console.error('Failed to load stock list from Postgres DB', err));

    const handleUpdate = () => {
      setMeshState({ ...globalState });
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const updateBillingItemPrice = (id: string, price: number) => {
    globalState.billingCatalog = globalState.billingCatalog.map(item => 
      item.id === id ? { ...item, price } : item
    );
    broadcastState();
  };

  const updateAccount = (role: 'receptionist' | 'doctor' | 'pharmacy', email: string, name: string, password?: string) => {
    globalState.accounts = globalState.accounts.map(acc => {
      if (acc.role === role) {
        return { 
          ...acc, 
          email, 
          name, 
          password: password || acc.password 
        };
      }
      return acc;
    });
    broadcastState();
  };

  const importWHOMedicineToStockSync = (whoMed: WHOMedicineItem, qty: number = 100, min: number = 20) => {
    const stockName = `Tab. ${whoMed.genericName} (${whoMed.atcCode})`;
    const existingIndex = globalState.stocks.findIndex(s => s.name === stockName || s.name.includes(whoMed.genericName));
    
    if (existingIndex >= 0) {
      globalState.stocks[existingIndex].qty += qty;
      globalState.stocks[existingIndex].outOfStock = false;
    } else {
      const newStock: StockItem = {
        id: `STK-WHO-${Date.now()}`,
        name: stockName,
        qty: qty,
        min: min,
        batch: `BAT-WHO-${whoMed.atcCode}`,
        expiryDays: 90,
        outOfStock: false
      };
      globalState.stocks.push(newStock);
    }

    // Persist to Postgres backend if online
    fetch(`${getApiUrl()}/api/pharmacy/stocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: stockName, qty, min, batch: `BAT-WHO-${whoMed.atcCode}`, expiryDays: 90, outOfStock: false })
    }).catch(err => console.error('Failed to persist imported WHO stock to Postgres', err));

    broadcastState();
  };

  return {
    ...meshState,
    setClinicStatus: setClinicStatusSync,
    setQueue: setQueueSync,
    addQueueToken: addQueueTokenSync,
    updateQueueItemStatus: updateQueueItemStatusSync,
    addDocument: addDocumentSync,
    addInvoice: addInvoiceSync,
    payInvoice: payInvoiceSync,
    triggerDelayBroadcast: broadcastDelaySync,
    clearDelay: clearDelaySync,
    markNotificationsRead: markNotificationsReadSync,
    markNotificationRead: markNotificationReadSync,
    archiveNotification: archiveNotificationSync,
    
    // Extensions
    addAppointment: addAppointmentSync,
    updateAppointmentStatus: updateAppointmentStatusSync,
    addClaim: addClaimSync,
    updateClaimStatus: updateClaimStatusSync,
    addLabBooking: addLabBookingSync,
    updateLabBookingStatus: updateLabBookingStatusSync,
    addPatientProfile: addPatientProfileSync,
    deletePatientProfile: deletePatientProfileSync,
    updateClinicSettings: updateClinicSettingsSync,
    updateStock: updateStockSync,
    importWHOMedicineToStock: importWHOMedicineToStockSync,
    updateBillingItemPrice,
    updateAccount,
  };
}

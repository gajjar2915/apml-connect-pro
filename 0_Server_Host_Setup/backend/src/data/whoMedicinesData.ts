export interface WHOMedicine {
  atcCode: string;
  genericName: string; // INN (International Nonproprietary Name)
  category: string;
  dosageForm: string;
  typicalStrength: string;
  route: string;
  whoEssentialGroup: 'Core' | 'Complementary';
  description: string;
}

export const WHO_ESSENTIAL_MEDICINES: WHOMedicine[] = [
  // Analgesics & Palliative Care
  {
    atcCode: 'N02BE01',
    genericName: 'Paracetamol (Acetaminophen)',
    category: 'Analgesics & Antipyretics',
    dosageForm: 'Tablet / Oral Liquid',
    typicalStrength: '500mg / 650mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'First-line non-opioid analgesic and antipyretic for mild-to-moderate pain and fever.'
  },
  {
    atcCode: 'M01AE01',
    genericName: 'Ibuprofen',
    category: 'Anti-inflammatory & Anti-rheumatic',
    dosageForm: 'Tablet / Oral Suspension',
    typicalStrength: '200mg / 400mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain, fever, and acute inflammation.'
  },
  {
    atcCode: 'N02AA01',
    genericName: 'Morphine',
    category: 'Analgesics (Opioid)',
    dosageForm: 'Injection / Oral Solution / Tablet',
    typicalStrength: '10mg/ml / 10mg',
    route: 'Oral / IV / SC',
    whoEssentialGroup: 'Core',
    description: 'Essential opioid for severe acute and chronic pain control and palliative care.'
  },

  // Anti-infective / Antibiotics
  {
    atcCode: 'J01CA04',
    genericName: 'Amoxicillin',
    category: 'Antibacterials (Penicillins)',
    dosageForm: 'Capsule / Oral Suspension',
    typicalStrength: '250mg / 500mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Broad-spectrum beta-lactam antibiotic for respiratory, ENT, and urinary tract infections.'
  },
  {
    atcCode: 'J01CR02',
    genericName: 'Amoxicillin + Clavulanic Acid',
    category: 'Antibacterials (Penicillin + Inhibitor)',
    dosageForm: 'Tablet / Oral Suspension',
    typicalStrength: '500mg+125mg / 875mg+125mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Beta-lactamase resistant combination antibiotic for complicated bacterial infections.'
  },
  {
    atcCode: 'J01FA10',
    genericName: 'Azithromycin',
    category: 'Antibacterials (Macrolides)',
    dosageForm: 'Tablet / Oral Suspension',
    typicalStrength: '250mg / 500mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Macrolide antibiotic for community-acquired pneumonia, chlamydia, and skin infections.'
  },
  {
    atcCode: 'J01MA02',
    genericName: 'Ciprofloxacin',
    category: 'Antibacterials (Fluoroquinolones)',
    dosageForm: 'Tablet / IV Infusion',
    typicalStrength: '250mg / 500mg',
    route: 'Oral / IV',
    whoEssentialGroup: 'Core',
    description: 'Fluoroquinolone for severe urinary, gastrointestinal, and bone infections.'
  },
  {
    atcCode: 'J01DD04',
    genericName: 'Ceftriaxone',
    category: 'Antibacterials (3rd Gen Cephalosporin)',
    dosageForm: 'Powder for Injection',
    typicalStrength: '500mg / 1g / 2g',
    route: 'IV / IM',
    whoEssentialGroup: 'Core',
    description: 'Injectable 3rd-generation cephalosporin for meningitis, sepsis, and severe infections.'
  },
  {
    atcCode: 'J01XD01',
    genericName: 'Metronidazole',
    category: 'Antiprotozoals & Antibacterials',
    dosageForm: 'Tablet / IV Infusion',
    typicalStrength: '200mg / 400mg / 500mg',
    route: 'Oral / IV',
    whoEssentialGroup: 'Core',
    description: 'Effective against anaerobic bacteria, amoebiasis, giardiasis, and trichomoniasis.'
  },
  {
    atcCode: 'J01AA02',
    genericName: 'Doxycycline',
    category: 'Antibacterials (Tetracyclines)',
    dosageForm: 'Capsule / Tablet',
    typicalStrength: '100mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Broad-spectrum tetracycline for rickettsia, Lyme disease, malaria prophylaxis, and acne.'
  },

  // Cardiovascular Medicines
  {
    atcCode: 'C09AA02',
    genericName: 'Enalapril',
    category: 'Cardiovascular (ACE Inhibitors)',
    dosageForm: 'Tablet',
    typicalStrength: '2.5mg / 5mg / 10mg / 20mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Angiotensin-converting enzyme (ACE) inhibitor for hypertension and heart failure.'
  },
  {
    atcCode: 'C09CA07',
    genericName: 'Telmisartan',
    category: 'Cardiovascular (ARBs)',
    dosageForm: 'Tablet',
    typicalStrength: '20mg / 40mg / 80mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Angiotensin II receptor blocker for essential hypertension and cardiovascular risk reduction.'
  },
  {
    atcCode: 'C08CA01',
    genericName: 'Amlodipine',
    category: 'Cardiovascular (Calcium Channel Blockers)',
    dosageForm: 'Tablet',
    typicalStrength: '2.5mg / 5mg / 10mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Dihydropyridine calcium channel blocker for hypertension and chronic stable angina.'
  },
  {
    atcCode: 'C07AB02',
    genericName: 'Metoprolol',
    category: 'Cardiovascular (Beta Blockers)',
    dosageForm: 'Extended Release Tablet',
    typicalStrength: '25mg / 50mg / 100mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Cardioselective beta-1 adrenergic blocker for hypertension, angina, and post-MI care.'
  },
  {
    atcCode: 'C10AA01',
    genericName: 'Simvastatin',
    category: 'Cardiovascular (Lipid Modifying)',
    dosageForm: 'Tablet',
    typicalStrength: '10mg / 20mg / 40mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'HMG-CoA reductase inhibitor (statin) for hypercholesterolemia and cardiovascular prevention.'
  },
  {
    atcCode: 'C10AA05',
    genericName: 'Atorvastatin',
    category: 'Cardiovascular (Lipid Modifying)',
    dosageForm: 'Tablet',
    typicalStrength: '10mg / 20mg / 40mg / 80mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Potent statin for lowering LDL cholesterol and secondary prevention of stroke/MI.'
  },
  {
    atcCode: 'B01AC06',
    genericName: 'Aspirin (Acetylsalicylic Acid)',
    category: 'Antithrombotic Agents',
    dosageForm: 'Gastro-resistant Tablet',
    typicalStrength: '75mg / 100mg / 325mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Antiplatelet drug for secondary prevention of ischemic heart disease and stroke.'
  },

  // Antidiabetics & Endocrine
  {
    atcCode: 'A10BA02',
    genericName: 'Metformin',
    category: 'Antidiabetics (Biguanides)',
    dosageForm: 'Tablet / Sustained Release',
    typicalStrength: '500mg / 850mg / 1000mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'First-line oral antidiabetic medicine for Type 2 diabetes mellitus.'
  },
  {
    atcCode: 'A10BB09',
    genericName: 'Gliclazide',
    category: 'Antidiabetics (Sulfonylureas)',
    dosageForm: 'Modified Release Tablet',
    typicalStrength: '30mg / 60mg / 80mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Second-generation sulfonylurea for glycemic control in Type 2 diabetes.'
  },
  {
    atcCode: 'A10AB01',
    genericName: 'Insulin (Human Soluble / Regular)',
    category: 'Antidiabetics (Insulins)',
    dosageForm: 'Injection Vials / Cartridge',
    typicalStrength: '100 IU/ml',
    route: 'Subcutaneous / IV',
    whoEssentialGroup: 'Core',
    description: 'Short-acting regular human insulin for glycemic management in Type 1 & 2 diabetes.'
  },
  {
    atcCode: 'H03AA01',
    genericName: 'Levothyroxine',
    category: 'Thyroid Therapy',
    dosageForm: 'Tablet',
    typicalStrength: '25mcg / 50mcg / 100mcg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Synthetic thyroid hormone T4 for treatment of primary and secondary hypothyroidism.'
  },

  // Respiratory Medicines
  {
    atcCode: 'R03AC02',
    genericName: 'Salbutamol (Albuterol)',
    category: 'Respiratory (Beta-2 Agonists)',
    dosageForm: 'Inhaler / Nebuliser Solution',
    typicalStrength: '100mcg/dose',
    route: 'Inhalation',
    whoEssentialGroup: 'Core',
    description: 'Short-acting beta-2 agonist (SABA) for acute relief of asthma bronchospasm and COPD.'
  },
  {
    atcCode: 'R03BA02',
    genericName: 'Budesonide',
    category: 'Respiratory (Inhaled Corticosteroids)',
    dosageForm: 'Inhaler / Nebuliser Suspension',
    typicalStrength: '100mcg / 200mcg / dose',
    route: 'Inhalation',
    whoEssentialGroup: 'Core',
    description: 'Inhaled corticosteroid for maintenance treatment and control of persistent asthma.'
  },
  {
    atcCode: 'R06AX13',
    genericName: 'Loratadine',
    category: 'Antihistamines (Systemic)',
    dosageForm: 'Tablet / Syrup',
    typicalStrength: '10mg / 5mg/5ml',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Non-sedating second-generation antihistamine for allergic rhinitis and urticaria.'
  },
  {
    atcCode: 'R06AX27',
    genericName: 'Levocetirizine',
    category: 'Antihistamines (Systemic)',
    dosageForm: 'Tablet / Syrup',
    typicalStrength: '5mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Potent second-generation H1 antagonist for allergic rhinitis and allergic conjunctivitis.'
  },

  // Gastrointestinal Medicines
  {
    atcCode: 'A02BC01',
    genericName: 'Omeprazole',
    category: 'Gastrointestinal (Proton Pump Inhibitors)',
    dosageForm: 'Capsule / Delayed Release',
    typicalStrength: '20mg / 40mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Proton pump inhibitor (PPI) for GERD, peptic ulcers, and H. pylori eradication.'
  },
  {
    atcCode: 'A02BC05',
    genericName: 'Esomeprazole / Pantoprazole',
    category: 'Gastrointestinal (Proton Pump Inhibitors)',
    dosageForm: 'Tablet / IV Injection',
    typicalStrength: '40mg',
    route: 'Oral / IV',
    whoEssentialGroup: 'Core',
    description: 'Proton pump inhibitor for severe erosive esophagitis and acid-peptic disorders.'
  },
  {
    atcCode: 'A04AA01',
    genericName: 'Ondansetron',
    category: 'Antiemetics (5-HT3 Antagonists)',
    dosageForm: 'Tablet / ODT / Injection',
    typicalStrength: '4mg / 8mg',
    route: 'Oral / IV / IM',
    whoEssentialGroup: 'Core',
    description: 'Selective 5-HT3 receptor antagonist for chemotherapy, post-op, and acute nausea/vomiting.'
  },
  {
    atcCode: 'A07CA01',
    genericName: 'Oral Rehydration Salts (ORS)',
    category: 'Electrolytes & Rehydration',
    dosageForm: 'Sachet Powder for Solution',
    typicalStrength: 'Standard WHO Low-Osmolarity Formula',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'WHO low-osmolarity oral rehydration solution for preventing and treating dehydration.'
  },

  // Central Nervous System & Psychiatry
  {
    atcCode: 'N06AB06',
    genericName: 'Sertraline',
    category: 'Psychiatry (SSRIs)',
    dosageForm: 'Tablet',
    typicalStrength: '50mg / 100mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Selective serotonin reuptake inhibitor (SSRI) for major depression, OCD, and panic disorders.'
  },
  {
    atcCode: 'N05BA01',
    genericName: 'Diazepam',
    category: 'Anxiolytics & Anticonvulsants',
    dosageForm: 'Tablet / Injection',
    typicalStrength: '5mg / 10mg',
    route: 'Oral / IV / Rectal',
    whoEssentialGroup: 'Core',
    description: 'Benzodiazepine for acute anxiety, muscle spasms, status epilepticus, and sedation.'
  },
  {
    atcCode: 'N03AA02',
    genericName: 'Phenobarbital',
    category: 'Antiepileptics',
    dosageForm: 'Tablet / Oral Liquid / Injection',
    typicalStrength: '30mg / 60mg',
    route: 'Oral / IV',
    whoEssentialGroup: 'Core',
    description: 'First-line anticonvulsant for generalized tonic-clonic and partial seizures in resource settings.'
  },

  // Anti-inflammatory & Corticosteroids
  {
    atcCode: 'H02AB02',
    genericName: 'Dexamethasone',
    category: 'Corticosteroids (Systemic)',
    dosageForm: 'Tablet / Injection',
    typicalStrength: '0.5mg / 4mg / 8mg',
    route: 'Oral / IV / IM',
    whoEssentialGroup: 'Core',
    description: 'High-potency glucocorticoid for severe inflammation, COVID-19 respiratory distress, and croup.'
  },
  {
    atcCode: 'H02AB06',
    genericName: 'Prednisolone',
    category: 'Corticosteroids (Systemic)',
    dosageForm: 'Tablet / Oral Liquid',
    typicalStrength: '5mg / 20mg / 40mg',
    route: 'Oral',
    whoEssentialGroup: 'Core',
    description: 'Intermediate-acting corticosteroid for asthma exacerbations, rheumatoid conditions, and allergy.'
  }
];

# APML Connect Pro - Security Architecture & HIPAA Compliance

APML Connect Pro handles sensitive Protected Health Information (PHI) and operates as a SaaS platform. This document outlines the security architecture designed to comply with HIPAA, GDPR, and SOC2 regulations.

---

## 1. Role-Based Access Control (RBAC) Matrix

Access permissions are enforced strictly at both the Next.js API/middleware level and the database level.

| Role | Tenant Admin | Patient Records (EMR) | Medical Prescriptions | Pharmacy Inventory | Lab Reports | Billing/Invoices | Telemedicine |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | Full | View/Manage (Audit) | View Only | View Only | View Only | View / Edit | No |
| **Hospital Admin** | Manage | View Only (Audit) | No | View Only | View Only | View / Edit | No |
| **Doctor** | No | Read / Write | Read / Write | View Only | Read / Write | View Only | Host Call |
| **Nurse** | No | Read / Write | View Only | View Only | Read Only | View Only | Join Call |
| **Receptionist**| No | Read Info Only | No | No | No | View / Manage | Join/Start |
| **Pharmacist** | No | No | Read Only | Manage | No | View Only | No |
| **Lab Technician**| No | No | No | No | Read / Write | View Only | No |
| **Patient** | No | Read Own | Read Own | No | Read Own | View / Pay Own| Join Call |

---

## 2. Protected Health Information (PHI) Encryption

### Encryption in Transit
- **TLS 1.3** is enforced for all API routes. Cleartext HTTP requests are automatically redirected to HTTPS at the load balancer (NGINX).
- **Secure WebSockets (WSS)** are used for WebRTC signaling.

### Encryption at Rest
- PostgreSQL databases are encrypted using AWS RDS storage encryption (AES-256).
- S3 buckets storing patient medical files (DICOM images, PDFs) use S3 Managed Keys (SSE-S3).

### Application-Level Column Encryption (Double Envelope Encryption)
Highly sensitive patient data (e.g., identity documents, Aadhaar number, specific diagnosis strings) are encrypted in Node.js before database insertion:
1. **Algorithm:** AES-256-GCM (Galois/Counter Mode) with an initialization vector (IV) and authentication tag.
2. **Key Rotation:** Keys are managed via AWS KMS / Cloud KMS and rotated automatically every 12 months.
3. **Decryption:** Only authorized roles (Doctors, Nurses, and the owning Patient) have routes that decrypt and stream these fields.

---

## 3. Two-Factor (2FA) & OTP Verification

APML Connect Pro supports robust multifactor authentication:
- **TOTP (Time-based One-time Password):** Users can link Google Authenticator / Authy. Secrets are encrypted using a service-level secret and stored in `twoFactorSecret` column.
- **SMS OTP Verification:** Handled via custom routes. The system generates a temporary 6-digit random code, saves a hashed copy to Redis with a 5-minute TTL, and sends the code to the user's phone.

---

## 4. Audit Logging Strategy (HIPAA § 164.312(b))

Every request accessing or writing medical data is logged in the `AuditLog` table. Audit logs are **read-only** and cannot be deleted or updated by any client role.

### Recorded Fields
- `userId`: Identifier of the actor.
- `action`: E.g., `READ_PATIENT_EMR`, `WRITE_PRESCRIPTION`.
- `resource`: Name of target entity (`MedicalRecord`).
- `resourceId`: UUID of the modified/viewed record.
- `details`: Structured changes (e.g., `{"changedFields": ["diagnosis"], "ipAddress": "192.168.1.50"}`).
- `timestamp`: Managed at the database level using `DEFAULT CURRENT_TIMESTAMP`.

---

## 5. Security Auditing & Backup Systems

- **WAF (Web Application Firewall):** AWS WAF limits rate spikes and protects against SQL injection/XSS.
- **SQL Sanitization:** Enforced automatically by Prisma ORM parameterized queries.
- **Automated Database Backups:** Point-In-Time-Recovery (PITR) is enabled on the PostgreSQL database with backups retained for 35 days. Backup files are automatically replicated across multiple availability zones.

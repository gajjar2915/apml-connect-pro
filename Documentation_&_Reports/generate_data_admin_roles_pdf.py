import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_data_admin_roles_pdf(pdf_path):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=25,
        bottomMargin=25
    )

    styles = getSampleStyleSheet()

    # Custom typography styles aligned with APML Connect Pro visual identity
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a')
    )

    badge_style = ParagraphStyle(
        'BadgeStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#047857')
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=14,
        textColor=colors.HexColor('#059669'),
        spaceBefore=6,
        spaceAfter=4
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11.5,
        textColor=colors.HexColor('#0f172a')
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11,
        textColor=colors.HexColor('#334155')
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=10,
        firstLineIndent=-10,
        spaceAfter=3
    )

    footer_style = ParagraphStyle(
        'FooterText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#64748b'),
        alignment=1
    )

    story = []

    # ----------------------------------------------------
    # Header Table
    # ----------------------------------------------------
    header_data = [
        [
            Paragraph("<b>APML Connect Pro</b><br/><font size=8.5 color='#64748b'>Roles & Responsibilities of the Data Administrator (DBA & Health Data Admin)</font>", title_style),
            Paragraph("<font color='#047857'><b>ENTERPRISE EMR SPECIFICATION</b></font><br/><font size=7.5 color='#64748b'>Version 2.4 | System Administration</font>", badge_style)
        ]
    ]

    header_table = Table(header_data, colWidths=[385, 167])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bbf7d0')),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # 1. Executive Summary & Definition
    # ----------------------------------------------------
    story.append(Paragraph("1. Executive Role Overview & Scope", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#10b981'), spaceAfter=4))
    story.append(Paragraph(
        "In <b>APML Connect Pro</b> (Enterprise EMR & Clinical Management Suite), the <b>Data Administrator (Database & Health Data Administrator)</b> plays a pivotal role in ensuring complete data integrity, system security, HIPAA/GDPR regulatory compliance, and seamless peer-to-peer data synchronization across clinical workstations (Reception Desk, Doctor Cabinet, Pharmacy Counter, and Mobile Apps).",
        body_style
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "The Data Administrator maintains strict oversight over database schemas (Prisma ORM & PostgreSQL/SQLite), encryption keys, user access privileges, audit logs, disaster recovery protocols, and offline-first mesh synchronization performance (`meshSync`).",
        body_style
    ))
    story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # 2. Key Responsibilities Matrix Table
    # ----------------------------------------------------
    story.append(Paragraph("2. Key Core Responsibilities Matrix", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#10b981'), spaceAfter=4))

    resp_table_data = [
        [Paragraph("<b>Domain Area</b>", h2_style), Paragraph("<b>Specific Duties & Operational Actions</b>", h2_style), Paragraph("<b>System Targets & Artifacts</b>", h2_style)],
        [
            Paragraph("<b>Database Architecture & Schema Management</b>", body_style),
            Paragraph("• Manage Prisma ORM schema migrations & model relationships.<br/>• Execute database DDL/DML updates without service downtime.<br/>• Maintain indexes, foreign keys, and query performance execution plans.", body_style),
            Paragraph("<code>schema.prisma</code><br/>PostgreSQL / SQLite<br/>Prisma Client", body_style)
        ],
        [
            Paragraph("<b>Offline Mesh Sync Oversight (`meshSync`)</b>", body_style),
            Paragraph("• Monitor WebSocket real-time data replication streams across workstations.<br/>• Resolve vector clock & timestamp merge conflicts upon node reconnect.<br/>• Validate client LocalStorage cache policies & queue token persistence.", body_style),
            Paragraph("WebSocket Gateway<br/>Local Cache Stores<br/>P2P Sync Engine", body_style)
        ],
        [
            Paragraph("<b>Security & RBAC Enforcement</b>", body_style),
            Paragraph("• Provision & audit user roles (Super Admin, Hospital Admin, Doctor, Receptionist, Pharmacist, Lab Tech).<br/>• Configure multi-tenant isolation rules & JWT token expiry.<br/>• Oversee AES-256 envelope encryption for sensitive PHI columns.", body_style),
            Paragraph("RBAC Access Matrix<br/>AWS KMS / Vault<br/>JWT Auth Middleware", body_style)
        ],
        [
            Paragraph("<b>Regulatory Audit Logging (HIPAA)</b>", body_style),
            Paragraph("• Enforce immutable append-only logging for EMR record access.<br/>• Perform weekly security access reviews & anomalous query detection.<br/>• Maintain audit log storage for statutory retention periods.", body_style),
            Paragraph("<code>AuditLog</code> Table<br/>HIPAA § 164.312(b)<br/>Security Logs", body_style)
        ],
        [
            Paragraph("<b>Backup & Disaster Recovery (DR)</b>", body_style),
            Paragraph("• Configure automated Point-In-Time-Recovery (PITR) database snapshots.<br/>• Oversee offsite multi-AZ encrypted backups for clinical files & PDFs.<br/>• Conduct periodic DR failover drills & database restore validations.", body_style),
            Paragraph("PostgreSQL PITR<br/>AWS S3 Storage<br/>Disaster Recovery Plan", body_style)
        ],
        [
            Paragraph("<b>Data Standardization & Master Records</b>", body_style),
            Paragraph("• Standardize ICD-10 diagnostic codes & pharmacy drug inventories.<br/>• Execute Master Patient Index (MPI) deduplication & record merging.<br/>• Manage legacy EMR data imports, ETL pipelines, and executive reporting.", body_style),
            Paragraph("MPI System<br/>Pharmacy Inventory<br/>ETL Scripts", body_style)
        ]
    ]

    resp_table = Table(resp_table_data, colWidths=[120, 262, 170])
    resp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(resp_table)
    story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # 3. Role-Based Access Privileges
    # ----------------------------------------------------
    story.append(Paragraph("3. Data Administrator Privilege & Permission Boundaries", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#10b981'), spaceAfter=4))

    story.append(Paragraph("<b>Authorized Privileges:</b>", h2_style))
    story.append(Paragraph("• <b>Full Schema & DDL Control:</b> Execute Prisma migrations, alter table structures, and create indexes.", bullet_style))
    story.append(Paragraph("• <b>User Credential & Role Management:</b> Assign role permissions, configure 2FA/TOTP parameters, and revoke compromised accounts.", bullet_style))
    story.append(Paragraph("• <b>Audit Log Inspection:</b> View system-wide access logs, audit trails, and data transfer metrics.", bullet_style))
    story.append(Paragraph("• <b>Database Restoration & Maintenance:</b> Trigger manual backups, perform table vacuums, and initiate failovers.", bullet_style))
    story.append(Spacer(1, 3))

    story.append(Paragraph("<b>Strict Compliance Boundaries (HIPAA Privacy Rule):</b>", h2_style))
    story.append(Paragraph("• <i>No Unauthorized PHI Decryption:</i> Data Administrators cannot decrypt raw patient clinical diagnosis notes or medical files without explicit audit authorization.", bullet_style))
    story.append(Paragraph("• <i>Immutable Audit Restrictions:</i> Data Administrators cannot edit, delete, or overwrite entries in the <code>AuditLog</code> table.", bullet_style))

    story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # 4. Detailed Functional Workflows
    # ----------------------------------------------------
    story.append(Paragraph("4. Daily & Weekly Operational Workflows", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#10b981'), spaceAfter=4))

    workflow_data = [
        [
            Paragraph("<b>☀️ Daily Operations</b>", h2_style),
            Paragraph("<b>📅 Weekly Operations</b>", h2_style),
            Paragraph("<b>🚨 Emergency Operations</b>", h2_style)
        ],
        [
            Paragraph("1. Check DB health, memory & connection pools.<br/>2. Verify <code>meshSync</code> WebSocket node connectivity.<br/>3. Review failed sync queues & retry logs.<br/>4. Ensure daily PITR snapshot execution.", body_style),
            Paragraph("1. Perform audit log anomaly analysis.<br/>2. Execute database index defragmentation.<br/>3. Verify S3 backup integrity & encryption keys.<br/>4. Deduplicate Master Patient Index (MPI).", body_style),
            Paragraph("1. Initiate instant database failover on server crash.<br/>2. Reconcile desynchronized peer nodes.<br/>3. Lock down accounts on suspicious access.<br/>4. Execute emergency restore from PITR point.", body_style)
        ]
    ]

    workflow_table = Table(workflow_data, colWidths=[184, 184, 184])
    workflow_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(workflow_table)
    story.append(Spacer(1, 8))

    # ----------------------------------------------------
    # Footer
    # ----------------------------------------------------
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=4))
    story.append(Paragraph("APML Connect Pro Enterprise EMR System | Confidential Specification Document | © 2026 APML HealthTech Systems", footer_style))

    doc.build(story)
    print(f"Successfully generated Data Administrator Roles PDF: {pdf_path}")

if __name__ == '__main__':
    target_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "APML_Connect_Pro_Data_Administrator_Roles.pdf")
    generate_data_admin_roles_pdf(target_path)

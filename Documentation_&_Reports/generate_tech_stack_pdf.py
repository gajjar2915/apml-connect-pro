import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_tech_stack_pdf(pdf_path):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=25,
        bottomMargin=25
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
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
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#059669'),
        spaceBefore=8,
        spaceAfter=4
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#1e293b')
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )

    story = []

    # Header Table with Title & Investor Badge
    header_data = [
        [
            Paragraph("<b>APML Connect Pro</b><br/><font size=9 color='#64748b'>Full Technology Stack & System Architecture Specification</font>", title_style),
            Paragraph("<font color='#047857'><b>CLIENT & INVESTOR EDITION</b></font><br/><font size=7.5 color='#64748b'>Version 2.4 | Enterprise EMR</font>", badge_style)
        ]
    ]

    header_table = Table(header_data, colWidths=[385, 167])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bbf7d0')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))

    # Executive Overview
    story.append(Paragraph("1. Executive Technical Overview", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10b981'), spaceAfter=5))
    story.append(Paragraph(
        "<b>APML Connect Pro</b> is a high-performance, enterprise-grade Electronic Medical Records (EMR) & Clinical Management System built with a hybrid <b>Offline-First Mesh Architecture</b>. It guarantees 100% continuous operational uptime across Reception, Doctor Consultation, and Pharmacy workstations even during total internet outages.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Tech Stack Breakdown Table
    story.append(Paragraph("2. Technology Stack Breakdown", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10b981'), spaceAfter=5))

    tech_table_data = [
        [Paragraph("<b>Layer</b>", h2_style), Paragraph("<b>Technologies Used</b>", h2_style), Paragraph("<b>Key Advantages</b>", h2_style)],
        [
            Paragraph("<b>Frontend UI Framework</b>", body_style),
            Paragraph("Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS", body_style),
            Paragraph("Server-Side Rendering (SSR), type safety, sub-millisecond route transitions", body_style)
        ],
        [
            Paragraph("<b>Design System</b>", body_style),
            Paragraph("Liquid UI (Fluid Glassmorphism, Dynamic CSS Canvas, Blur Orbs)", body_style),
            Paragraph("State-of-the-art modern visual aesthetic, light & dark theme adaptivity", body_style)
        ],
        [
            Paragraph("<b>Backend Services</b>", body_style),
            Paragraph("Node.js, Express.js REST API, WebSockets (WS), C# Native Service", body_style),
            Paragraph("Real-time bidirectional synchronization, zero-latency RPC calls", body_style)
        ],
        [
            Paragraph("<b>Database & Persistence</b>", body_style),
            Paragraph("Prisma ORM, PostgreSQL (Production) / SQLite (Local Native)", body_style),
            Paragraph("ACID compliance, schema validation, local database replication", body_style)
        ],
        [
            Paragraph("<b>Offline Mesh Sync</b>", body_style),
            Paragraph("Autonomous Peer-to-Peer `meshSync` Protocol, LocalStorage Cache", body_style),
            Paragraph("Zero cloud dependency, auto-reconciliation when server reconnects", body_style)
        ],
        [
            Paragraph("<b>Mobile & Android App</b>", body_style),
            Paragraph("Native Android Studio Java/Kotlin APK, Progressive Web App (PWA)", body_style),
            Paragraph("1-Tap home screen app installation on Android, tablet & mobile optimized", body_style)
        ],
        [
            Paragraph("<b>Security & Compliance</b>", body_style),
            Paragraph("AES-256 Local Encryption, JWT Authentication, Role-Based Control (RBAC)", body_style),
            Paragraph("HIPAA & GDPR audit readiness, isolated role permissions", body_style)
        ]
    ]

    tech_table = Table(tech_table_data, colWidths=[130, 215, 207])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 8))

    # Architecture Modules Section
    story.append(Paragraph("3. Core Workstation Modules", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10b981'), spaceAfter=5))

    modules_data = [
        [
            Paragraph("<b>🏥 Receptionist Desk (Port 3001)</b><br/>Patient registration, token generation, check-in queue management, drag-and-drop lab report uploader, billing & invoice printing.", body_style),
            Paragraph("<b>🩺 Doctor Cabinet (Port 3002)</b><br/>EHR medical records, instant patient name search, AI diagnostic suggestions, digital prescriptions & vitals tracking.", body_style),
            Paragraph("<b>💊 Pharmacy Counter (Port 3003)</b><br/>Real-time prescription queue, inventory stock management, medicine dispensing & invoice checkout.", body_style)
        ]
    ]

    modules_table = Table(modules_data, colWidths=[184, 184, 184])
    modules_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(modules_table)
    story.append(Spacer(1, 8))

    # Key Highlights for Investors & Clients
    story.append(Paragraph("4. Key Highlights for Investors & Enterprise Clients", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10b981'), spaceAfter=5))

    story.append(Paragraph("• <b>Zero Infrastructure Lock-in:</b> Can be deployed as a native local server without cloud internet or containerized with Docker.", body_style))
    story.append(Paragraph("• <b>Scalable Microservices Architecture:</b> Decoupled modular architecture allows independent scaling of individual clinical desks.", body_style))
    story.append(Paragraph("• <b>Instant ROI & Low TCO:</b> Runs efficiently on existing clinic hardware, eliminating monthly recurring cloud SaaS fees.", body_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=4))
    story.append(Paragraph("<font color='#64748b' size=7.5>Confidential Document | Prepared for APML Connect Pro Clients & Investors | © 2026 APML HealthTech Systems</font>", ParagraphStyle('Footer', parent=styles['Normal'], alignment=1)))

    doc.build(story)
    print(f"Successfully generated PDF: {pdf_path}")

if __name__ == '__main__':
    target_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "APML_Connect_Pro_Technology_Stack.pdf")
    generate_tech_stack_pdf(target_path)

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_bug_testing_roles_pdf(pdf_path):
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
        textColor=colors.HexColor('#2563eb')
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=14,
        textColor=colors.HexColor('#1d4ed8'),
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
            Paragraph("<b>APML Connect Pro</b><br/><font size=8.5 color='#64748b'>Roles & Responsibilities of Bug Tracking & QA Testing Engineer</font>", title_style),
            Paragraph("<font color='#2563eb'><b>TEAM MEMBER GUIDE</b></font><br/><font size=7.5 color='#64748b'>Version 2.4 | Quality Assurance</font>", badge_style)
        ]
    ]

    header_table = Table(header_data, colWidths=[385, 167])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bfdbfe')),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # 1. Role Purpose & Overview
    # ----------------------------------------------------
    story.append(Paragraph("1. Quality Assurance & Testing Role Purpose", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#3b82f6'), spaceAfter=4))
    story.append(Paragraph(
        "In <b>APML Connect Pro</b>, the <b>Bug Tracking & QA Testing Engineer</b> is responsible for ensuring zero-defect software quality, operational reliability across workstation modules (Reception Desk, Doctor Cabinet, Pharmacy Counter, and Mobile App), network resilience during offline mesh sync (`meshSync`), visual UI perfection, and strict HIPAA security compliance.",
        body_style
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "The QA Engineer acts as the primary quality gatekeeper before code deployments, systematically detecting, logging, triaging, and verifying bug fixes to guarantee 100% clinical operational uptime.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # 2. Key Responsibilities Matrix Table
    # ----------------------------------------------------
    story.append(Paragraph("2. Core Testing Domains & Responsibilities Matrix", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#3b82f6'), spaceAfter=4))

    resp_table_data = [
        [Paragraph("<b>Testing Domain</b>", h2_style), Paragraph("<b>QA Duties & Verification Scope</b>", h2_style), Paragraph("<b>Key Artifacts & Tools</b>", h2_style)],
        [
            Paragraph("<b>End-to-End Clinical Workstation Flow</b>", body_style),
            Paragraph("• Validate complete patient journey: Reception token check-in → Doctor EHR consultation & prescription creation → Pharmacy dispensing checkout.<br/>• Test drag-and-drop lab report upload & instant patient search bar.", body_style),
            Paragraph("Reception Desk (3001)<br/>Doctor Cabinet (3002)<br/>Pharmacy Counter (3003)", body_style)
        ],
        [
            Paragraph("<b>Offline Mesh Sync (`meshSync`) Resilience</b>", body_style),
            Paragraph("• Conduct network cut/restore tests to verify offline LocalStorage caching.<br/>• Validate peer-to-peer data sync without data loss upon server reconnection.<br/>• Test vector clock conflict resolution & WebSocket reconnection logic.", body_style),
            Paragraph("WebSocket Gateway<br/>Offline Storage Cache<br/>P2P Sync Engine", body_style)
        ],
        [
            Paragraph("<b>Liquid UI & Visual Design Testing</b>", body_style),
            Paragraph("• Inspect glassmorphism blur cards, neon halos, and dynamic canvas background.<br/>• Verify light/dark theme switching, responsive layouts across screens & mobile.<br/>• Ensure cross-browser visual consistency (Chrome, Edge, Firefox, Safari).", body_style),
            Paragraph("Liquid Design Tokens<br/>Viewport Responsiveness<br/>Cross-Browser Suite", body_style)
        ],
        [
            Paragraph("<b>Security, RBAC & HIPAA Auditing</b>", body_style),
            Paragraph("• Audit Role-Based Access Control (RBAC): Ensure unauthorized roles cannot access restricted routes.<br/>• Verify 2FA/TOTP & SMS OTP authentication flows.<br/>• Inspect <code>AuditLog</code> table entries for every patient record read/write event.", body_style),
            Paragraph("RBAC Matrix<br/>JWT Auth Middleware<br/><code>AuditLog</code> Verifier", body_style)
        ],
        [
            Paragraph("<b>Bug Lifecycle Management & Triage</b>", body_style),
            Paragraph("• Reproduce reported defects with explicit step-by-step reproduction notes.<br/>• Classify bugs by Severity (Critical, High, Medium, Low) & Priority.<br/>• Capture network payloads, browser console logs, and backend error stack traces.", body_style),
            Paragraph("Issue Tracker / Jira<br/>DevTools Console<br/>Payload Inspector", body_style)
        ],
        [
            Paragraph("<b>API & Backend Regression Testing</b>", body_style),
            Paragraph("• Test Node.js REST API endpoints (Port 5005) for status codes & error handling.<br/>• Validate Prisma ORM schema query responses & SQL parameter sanitization.<br/>• Run regression suites before production build deployment.", body_style),
            Paragraph("Postman / ThunderClient<br/>Jest / Supertest Suite<br/>Backend REST API", body_style)
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
    # 3. Bug Classification & Defect Severity Framework
    # ----------------------------------------------------
    story.append(Paragraph("3. Defect Severity & Classification Standard", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#3b82f6'), spaceAfter=4))

    severity_data = [
        [Paragraph("<b>Severity Level</b>", h2_style), Paragraph("<b>Definition & Impact</b>", h2_style), Paragraph("<b>Required SLA Response</b>", h2_style)],
        [
            Paragraph("<font color='#dc2626'><b>P1 - CRITICAL</b></font>", body_style),
            Paragraph("System crash, data corruption, workstation outage, mesh sync failure, or HIPAA security breach. Prevents core clinical operations.", body_style),
            Paragraph("<b>Immediate (Fix within 2 Hours)</b><br/>Block release build.", body_style)
        ],
        [
            Paragraph("<font color='#ea580c'><b>P2 - HIGH</b></font>", body_style),
            Paragraph("Major functional failure without immediate workaround (e.g., lab uploader crash, prescription saving failure).", body_style),
            Paragraph("<b>Fix within 24 Hours</b><br/>Must fix before release.", body_style)
        ],
        [
            Paragraph("<font color='#d97706'><b>P3 - MEDIUM</b></font>", body_style),
            Paragraph("Minor functional bug with an available workaround (e.g., filter glitch in pharmacy inventory, minor search delays).", body_style),
            Paragraph("<b>Fix within Next Sprint</b><br/>Scheduled sprint item.", body_style)
        ],
        [
            Paragraph("<font color='#2563eb'><b>P4 - LOW</b></font>", body_style),
            Paragraph("Cosmetic UI defects, alignment issues, typo in labels, or minor animation stutters.", body_style),
            Paragraph("<b>Backlog Item</b><br/>Fix during UI polish phase.", body_style)
        ]
    ]

    severity_table = Table(severity_data, colWidths=[110, 290, 152])
    severity_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(severity_table)
    story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # 4. Standard Bug Reporting Protocol
    # ----------------------------------------------------
    story.append(Paragraph("4. Standardized Bug Reporting Template & Checklist", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#3b82f6'), spaceAfter=4))

    story.append(Paragraph("<b>When filing a bug report, the QA team member MUST include:</b>", h2_style))
    story.append(Paragraph("• <b>Clear Title:</b> E.g., <i>[Doctor Cabinet] Patient search fails to render lab PDF when clicked in dark mode.</i>", bullet_style))
    story.append(Paragraph("• <b>Environment Specs:</b> OS (Windows 11/Android), Browser & version, Resolution, Workstation Port (3001/3002/3003/5005).", bullet_style))
    story.append(Paragraph("• <b>Step-by-Step Reproduction:</b> Exact numbered actions required to trigger the defect reliably.", bullet_style))
    story.append(Paragraph("• <b>Expected vs. Actual Result:</b> Clear statement of what should happen versus what actually occurred.", bullet_style))
    story.append(Paragraph("• <b>Evidence & Logs:</b> DevTools Console logs, Network payload screenshots/JSON, and backend terminal error trace.", bullet_style))

    story.append(Spacer(1, 6))

    # ----------------------------------------------------
    # 5. Weekly QA Execution Routine
    # ----------------------------------------------------
    story.append(Paragraph("5. Daily & Release Testing Cadence", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#3b82f6'), spaceAfter=4))

    cadence_data = [
        [
            Paragraph("<b>☀️ Daily Testing Tasks</b>", h2_style),
            Paragraph("<b>🚀 Pre-Release Testing</b>", h2_style),
            Paragraph("<b>🔄 Post-Fix Verification</b>", h2_style)
        ],
        [
            Paragraph("1. Smoke test all 3 workstation logins.<br/>2. Execute manual test cases for new features.<br/>3. Log newly discovered bugs.<br/>4. Verify developer bug fixes.", body_style),
            Paragraph("1. Run full regression test suite.<br/>2. Perform offline network disconnection simulation.<br/>3. Verify mobile APK installation on Android.<br/>4. Sign off on release quality build.", body_style),
            Paragraph("1. Re-test target issue in identical environment.<br/>2. Conduct side-effect regression check.<br/>3. Close defect ticket with evidence.<br/>4. Update test case repo.", body_style)
        ]
    ]

    cadence_table = Table(cadence_data, colWidths=[184, 184, 184])
    cadence_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(cadence_table)
    story.append(Spacer(1, 8))

    # ----------------------------------------------------
    # Footer
    # ----------------------------------------------------
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=4))
    story.append(Paragraph("APML Connect Pro Enterprise EMR System | Quality Assurance Specification Document | © 2026 APML HealthTech Systems", footer_style))

    doc.build(story)
    print(f"Successfully generated Bug Tracking & Testing Roles PDF: {pdf_path}")

if __name__ == '__main__':
    target_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "APML_Connect_Pro_Bug_Tracking_and_Testing_Roles.pdf")
    generate_bug_testing_roles_pdf(target_path)

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_installation_pdf(pdf_path):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b')
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#047857'),
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceBefore=3,
        spaceAfter=3
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=15,
        spaceBefore=2,
        spaceAfter=2
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#10b981'),
        backColor=colors.HexColor('#0f172a'),
        borderColor=colors.HexColor('#1e293b'),
        borderWidth=1,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155')
    )

    elements = []

    # Title & Subtitle Header
    elements.append(Paragraph("<b>+ APML Connect Pro</b>", title_style))
    elements.append(Paragraph("Complete Installation, Multi-Terminal Setup & Operations Manual", subtitle_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#10b981'), spaceAfter=12))

    # Phase 1
    elements.append(Paragraph("Phase 1: System Requirements & Prerequisites", h1_style))
    elements.append(Paragraph("<b>1. Central Host Server PC:</b> Windows 10/11 (64-bit), 8 GB RAM minimum (16 GB recommended), 10 GB disk space.", bullet_style))
    elements.append(Paragraph("<b>2. Client Workstation Devices:</b> Any Windows PC, laptop, iPad, tablet, or smartphone on local Wi-Fi.", bullet_style))
    elements.append(Paragraph("<b>3. Required Software:</b> Docker Desktop for Windows (WSL 2 backend enabled).", bullet_style))
    
    elements.append(Paragraph("Installing & Verifying Docker Desktop:", h2_style))
    elements.append(Paragraph("• Download Docker Desktop from <u>https://www.docker.com/products/docker-desktop/</u>", bullet_style))
    elements.append(Paragraph("• Run installer and ensure <b>'Use WSL 2 instead of Hyper-V'</b> is selected.", bullet_style))
    elements.append(Paragraph("• Restart computer when prompted, then launch Docker Desktop.", bullet_style))
    elements.append(Paragraph("• Verify that the whale icon in system tray turns <b>solid green</b>.", bullet_style))

    # Phase 2
    elements.append(Paragraph("Phase 2: Windows Firewall Configuration (Wi-Fi Access)", h1_style))
    elements.append(Paragraph("Required to allow laptops, tablets, and mobile devices on local Wi-Fi to connect to the host server:", body_style))
    elements.append(Paragraph("1. Open Start Menu & Search for <b>'Windows Defender Firewall with Advanced Security'</b>.", bullet_style))
    elements.append(Paragraph("2. Click <b>Inbound Rules</b> (left pane) &rarr; Click <b>New Rule...</b> (right pane).", bullet_style))
    elements.append(Paragraph("3. Select <b>Port</b> &rarr; TCP &rarr; Enter Ports: <code>3001, 3002, 3003, 5005</code>", bullet_style))
    elements.append(Paragraph("4. Select <b>Allow the connection</b> &rarr; Check Domain, Private, Public &rarr; Name: <b>APML Connect Pro Server</b>.", bullet_style))

    # Phase 3
    elements.append(Paragraph("Phase 3: Central Server Launch & Container Stack", h1_style))
    elements.append(Paragraph("Open PowerShell / Command Prompt in the server folder and run:", body_style))
    elements.append(Paragraph("cd d:\\parvg\\OneDrive\\Desktop\\reception\\0_Server_Host_Setup<br/>docker compose up -d --build", code_style))

    # Container Table
    table_data = [
        [Paragraph("Container Name", table_header_style), Paragraph("Component", table_header_style), Paragraph("Port / URL", table_header_style)],
        [Paragraph("apml-connect-receptionist", table_cell_style), Paragraph("Reception Desk Front-End", table_cell_style), Paragraph("http://localhost:3001", table_cell_style)],
        [Paragraph("apml-connect-doctor", table_cell_style), Paragraph("Doctor Cabinet EMR", table_cell_style), Paragraph("http://localhost:3002", table_cell_style)],
        [Paragraph("apml-connect-pharmacy", table_cell_style), Paragraph("Pharmacy Counter", table_cell_style), Paragraph("http://localhost:3003", table_cell_style)],
        [Paragraph("apml-connect-backend", table_cell_style), Paragraph("Node.js API & WebSockets", table_cell_style), Paragraph("http://localhost:5005", table_cell_style)],
        [Paragraph("apml-connect-db", table_cell_style), Paragraph("PostgreSQL 15 Database", table_cell_style), Paragraph("Port 5432", table_cell_style)],
        [Paragraph("apml-connect-redis", table_cell_style), Paragraph("Redis 7 Memory Cache", table_cell_style), Paragraph("Port 6379", table_cell_style)],
    ]
    t = Table(table_data, colWidths=[160, 180, 180])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t)

    # Phase 4
    elements.append(Paragraph("Phase 4: Client Terminal Launch & Local Wi-Fi Connections", h1_style))
    elements.append(Paragraph("<b>1. Server Host Launchers:</b> Double-click desktop launchers (<code>Launch Doctor Cabinet.exe</code>, <code>Launch Receptionist.exe</code>, <code>Launch Pharmacy Counter.exe</code>).", bullet_style))
    elements.append(Paragraph("<b>2. Connecting Laptops / iPads over Wi-Fi:</b> Find server IP using <code>ipconfig</code> (e.g. <code>192.168.1.5</code>). Open client browser to:", bullet_style))
    elements.append(Paragraph("• Doctor Cabinet: <code>http://&lt;SERVER_IP&gt;:3002/dashboard/doctor</code><br/>• Reception Desk: <code>http://&lt;SERVER_IP&gt;:3001/dashboard/reception</code><br/>• Pharmacy Counter: <code>http://&lt;SERVER_IP&gt;:3003/dashboard/pharmacy</code>", bullet_style))

    # Phase 5
    elements.append(Paragraph("Phase 5: Default Account Credentials", h1_style))
    cred_data = [
        [Paragraph("Role / Workstation", table_header_style), Paragraph("Default Login Email", table_header_style), Paragraph("Default Password", table_header_style)],
        [Paragraph("Doctor Cabinet EMR", table_cell_style), Paragraph("doctor@clinic.com", table_cell_style), Paragraph("123", table_cell_style)],
        [Paragraph("Reception Front Desk", table_cell_style), Paragraph("receptionist@clinic.com", table_cell_style), Paragraph("123", table_cell_style)],
        [Paragraph("Pharmacy Counter", table_cell_style), Paragraph("pharmacy@clinic.com", table_cell_style), Paragraph("123", table_cell_style)],
    ]
    t_cred = Table(cred_data, colWidths=[180, 180, 160])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_cred)

    # Phase 6
    elements.append(Paragraph("Phase 6: Daily Maintenance Commands", h1_style))
    elements.append(Paragraph("• <b>Start Server:</b> <code>docker compose up -d</code>", bullet_style))
    elements.append(Paragraph("• <b>Stop Server:</b> <code>docker compose stop</code>", bullet_style))
    elements.append(Paragraph("• <b>View Container Logs:</b> <code>docker compose logs -f</code>", bullet_style))
    elements.append(Paragraph("• <b>Hard Refresh Browser Cache:</b> Press <code>Ctrl + Shift + R</code>", bullet_style))

    elements.append(Spacer(1, 14))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=8))
    elements.append(Paragraph("APML Connect Pro &copy; 2026 SaaS Healthcare Platform &middot; Confidential Installation Guide", subtitle_style))

    doc.build(elements)

if __name__ == '__main__':
    receptionist_pdf = r"d:\parvg\OneDrive\Desktop\reception\1_Receptionist_Setup\APML_Connect_Pro_Installation_Guide.pdf"
    root_pdf = r"d:\parvg\OneDrive\Desktop\reception\APML_Connect_Pro_Installation_Guide.pdf"
    
    generate_installation_pdf(receptionist_pdf)
    generate_installation_pdf(root_pdf)
    print("PDFs generated successfully!")

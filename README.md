# CyberHawk - Defensive Security Analysis Platform

A professional-grade defensive security analysis platform designed for security teams to analyze, visualize, and assess network scan results. CyberHawk ingests authorized scan data from tools like Nmap and provides comprehensive risk assessment, trend analysis, and security insights.

**Live Demo:** https://updated-network-security-pj-rtms.vercel.app

---

## Purpose

CyberHawk addresses the challenge of managing and analyzing network security scan data at scale. Security teams often conduct regular network assessments but lack centralized tools to track changes over time, identify trends, and prioritize remediation efforts. This platform bridges that gap by providing:

- Centralized repository for scan results with historical tracking
- Automated risk assessment to prioritize security findings
- Trend analysis to identify emerging vulnerabilities
- Visual dashboards for executive reporting and team collaboration
- Compliance documentation for security audits

The platform is built for security professionals who need to transform raw scan data into actionable intelligence while maintaining a clear audit trail of network security posture over time.

---

## Overview

CyberHawk operates as a defensive security analysis platform that processes and visualizes network scan results. The platform does not perform active scanning or reconnaissance. Instead, it analyzes scan data generated from authorized security assessments to provide actionable insights and risk metrics.

### Key Features

- Secure Nmap XML file upload and parsing with XXE protection
- Automated risk scoring based on port exposure and service detection
- Historical scan comparison and trend analysis
- Interactive dashboard with real-time security metrics
- Session-based scan management and tracking
- Security incident classification and management

---

## Technology Stack

**Frontend**
- React 18 with modern hooks architecture
- Ant Design component library for professional UI
- Recharts for data visualization
- Axios for API communication

**Backend**
- FastAPI Python framework
- PostgreSQL database with AsyncPG driver
- Pydantic for data validation
- Rate limiting and input sanitization

**Security**
- Hardened XML parsing to prevent injection attacks
- File validation with size limits (10MB max)
- Rate limiting (10 uploads per hour)
- CORS protection with restricted origins

**Deployment**
- Docker containerization
- Nginx reverse proxy
- Vercel frontend hosting
- Railway backend deployment support

---

## Quick Start

### View Live Demo

Visit the deployed application at https://updated-network-security-pj-rtms.vercel.app

The demo includes simulated data for demonstration purposes.

### Run Locally

```bash
git clone https://github.com/acastil7IT/CyberHawk-Project.git
cd CyberHawk-Project/frontend
npm install
npm start
```

Access the application at http://localhost:3000

### Full Stack Deployment

```bash
docker compose up -d
```

Services will be available at:
- Web Interface: http://localhost:3000
- API Gateway: http://localhost:8001
- API Documentation: http://localhost:8001/docs

---

## Usage Workflow

### Step 1: Generate Scan Data

Conduct authorized network scans using Nmap on systems you own or have permission to test. The platform supports standard Nmap XML output formats.

**Example scan commands:**

```bash
# Basic network discovery and service detection
nmap -sS -sV -O -oX network_scan.xml 192.168.1.0/24

# Comprehensive single host analysis
nmap -sS -sV -sC -p- -oX host_scan.xml target.example.com

# Vulnerability assessment scan
nmap -sV --script vuln -oX vuln_scan.xml 192.168.1.100

# Fast scan of common ports
nmap -sS -sV --top-ports 1000 -oX quick_scan.xml 10.0.0.0/24
```

**Authorization Requirements:** Ensure you have written authorization before scanning any network. Unauthorized scanning may violate laws and organizational policies.

### Step 2: Upload and Process

1. Access the platform dashboard
2. Click "Upload Nmap Scan" button
3. Select or drag-and-drop your XML scan file
4. Add contextual notes (optional but recommended):
   - Scan purpose and scope
   - Authorization details
   - Expected findings or concerns
5. Submit for processing

The platform validates the file format, parses the XML data, and generates risk scores automatically.

### Step 3: Review Analysis

**Dashboard View**
- Total hosts discovered and scan session count
- High-risk host identification
- Security incident summary
- Recent activity timeline

**Scan Sessions**
- Complete history of uploaded scans
- Session metadata including timestamps and file details
- Quick comparison between scan sessions
- Export capabilities for reporting

**Session Details**
- Individual host information with IP and hostname
- Complete port inventory with service versions
- Risk score breakdown and contributing factors
- Operating system fingerprinting results

**Incident Management**
- Automatically generated security findings
- Severity-based prioritization (Critical, High, Medium, Low)
- Status tracking (Open, Acknowledged, Resolved)
- Assignment and workflow management

### Step 4: Track and Compare

Use the comparison features to monitor security posture changes:

- Identify newly discovered hosts or services
- Track closed vulnerabilities and remediation progress
- Monitor risk score trends over time
- Generate compliance reports for audits

### Best Practices

- Conduct regular scans (weekly or monthly) to establish baseline trends
- Document scan context in notes for future reference
- Review and acknowledge incidents promptly
- Use consistent scan parameters for accurate comparisons
- Archive scan files externally for long-term retention

---

## Risk Assessment

CyberHawk calculates risk scores on a 0-10 scale based on multiple factors:

**High-Risk Services**
- Remote access protocols: SSH (22), Telnet (23), RDP (3389)
- File sharing: SMB (445), FTP (21)
- Database services: MySQL (3306), PostgreSQL (5432), MSSQL (1433)
- Management protocols: SNMP (161), WMI (135)

**Risk Levels**
- Critical (9-10): Immediate attention required
- High (7-8): Priority remediation needed
- Medium (4-6): Monitor and plan remediation
- Low (1-3): Routine maintenance

---

## Project Structure

```
CyberHawk/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── ScanUpload.js
│   │   │   ├── Incidents.js
│   │   │   └── LiveAlerts.js
│   │   └── services/
│   │       └── mockApi.js
│   └── package.json
├── services/
│   ├── api-gateway/
│   │   ├── main.py
│   │   └── requirements.txt
│   └── network-discovery/
│       └── network_discovery.py
├── database/
│   ├── init.sql
│   └── sample_data.sql
├── docs/
│   ├── KALI_LINUX_INTEGRATION.md
│   ├── DEPLOYMENT.md
│   └── TECHNICAL_ARCHITECTURE.md
├── docker-compose.yml
└── vercel.json
```

---

## Database Schema

**scan_sessions**
- Stores scan metadata, timestamps, and summary statistics
- Tracks upload source and scan parameters

**scan_hosts**
- Contains discovered host information
- Includes risk scores and OS fingerprinting data

**scan_ports**
- Records open ports and detected services
- Flags high-risk services for review

**security_incidents**
- Automatically generated security findings
- Severity classification and status tracking

**risk_rules**
- Configurable risk assessment criteria
- Port-based and service-based scoring rules

---

## Configuration

### Environment Variables

```bash
DATABASE_URL=postgresql://cyberhawk:secure123@localhost:5433/cyberhawk_db
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
MAX_UPLOAD_SIZE=10485760
RATE_LIMIT_UPLOADS=10
```

### Supported Scan Formats

CyberHawk processes Nmap XML output containing:
- Host discovery results with IP addresses and hostnames
- Port scan results with service detection
- Operating system fingerprinting
- Service version information
- Script scan results

---

## Deployment

### Vercel Deployment

The application is configured for deployment on Vercel:

1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Configure build settings:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `frontend/build`
4. Deploy

See VERCEL_DEPLOYMENT.md for detailed instructions.

### Docker Deployment

```bash
docker compose up -d
```

All services will start with proper networking and volume configuration.

---

## Documentation

- **KALI_LINUX_INTEGRATION.md** - Complete scanning workflow guide
- **DEPLOYMENT.md** - Production deployment instructions
- **TECHNICAL_ARCHITECTURE.md** - System design documentation
- **API Documentation** - Available at /docs endpoint when backend is running

---

## Legal and Compliance

This platform is designed for authorized security analysis only.

**Acceptable Use:**
- Analyzing scans of networks you own or manage
- Authorized penetration testing engagements
- Security compliance assessments
- Internal security monitoring programs
- Educational and research purposes with proper authorization

**Requirements:**
- Obtain written authorization before conducting any network scans
- Comply with all applicable local and international laws
- Follow responsible disclosure practices for discovered vulnerabilities
- Document all security testing activities

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear descriptions
4. Push to your branch
5. Submit a pull request

Ensure all code follows security best practices and includes appropriate documentation.

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Links

- **Repository:** https://github.com/acastil7IT/CyberHawk-Project
- **Live Demo:** https://updated-network-security-pj-rtms.vercel.app
- **Issues:** https://github.com/acastil7IT/CyberHawk-Project/issues

**Author:** Alejandro Castillo

---

Built for security professionals who need reliable defensive analysis tools.

# CyberHawk - Defensive Security Analysis Platform

<div align="center">

![CyberHawk Logo](https://img.shields.io/badge/CyberHawk-v2.0-0ea5e9?style=for-the-badge&logo=shield&logoColor=white)
[![Security](https://img.shields.io/badge/Security-Defensive%20Analysis-10b981?style=for-the-badge)](https://github.com/acastil7IT/CyberHawk-Project)
[![Live Demo](https://img.shields.io/badge/Demo-Live-0ea5e9?style=for-the-badge)](https://updated-network-security-pj-rtms.vercel.app)

**Professional-grade defensive security analysis and network scan visualization platform**

[🚀 Live Demo](https://updated-network-security-pj-rtms.vercel.app) • [📚 Documentation](docs/) • [🔧 Kali Integration](docs/KALI_LINUX_INTEGRATION.md)

</div>

---

## 🛡️ Overview

CyberHawk is a **defensive security analysis platform** designed for security professionals to analyze, visualize, and assess network scan results. The platform ingests authorized scan data from tools like Nmap and provides comprehensive risk assessment, trend analysis, and security insights.

### Key Principles

✅ **Defensive Analysis Only** - No active scanning or reconnaissance  
✅ **Authorized Data** - Processes scan results from authorized networks only  
✅ **Risk Assessment** - Automated vulnerability and exposure analysis  
✅ **Portfolio Ready** - Professional UI suitable for demonstrations  

**⚠️ Important**: CyberHawk does **NOT** perform active scanning. It operates as a read-only analysis platform for authorized security assessments.

---

## ✨ Features

### 🔍 Scan Analysis
- **Nmap XML Upload** - Secure file upload with XXE protection
- **Risk Scoring** - Automated risk assessment based on port exposure
- **Host Discovery** - Network asset identification and classification
- **Service Detection** - Version identification and vulnerability mapping
- **Trend Analysis** - Compare scan results over time

### 📊 Visualization
- **Interactive Dashboard** - Real-time security metrics and statistics
- **Risk Distribution** - Visual representation of network security posture
- **Session History** - Track and compare multiple scan sessions
- **Incident Management** - Security finding classification and tracking
- **Professional UI** - Modern, responsive design with Ant Design

### 🔒 Security
- **Input Validation** - Hardened XML parsing prevents injection attacks
- **Rate Limiting** - Upload throttling (10 uploads/hour)
- **File Validation** - XML only, 10MB max size
- **CORS Protection** - Restricted cross-origin access
- **Demo Mode** - Safe simulated data for public demonstrations

---

## 🚀 Quick Start

### Option 1: View Live Demo (Fastest)

Visit the live demo: **[https://updated-network-security-pj-rtms.vercel.app](https://updated-network-security-pj-rtms.vercel.app)**

- ✅ No installation required
- ✅ Simulated demo data included
- ✅ Full feature access
- ✅ Portfolio-ready presentation

### Option 2: Run Locally (Frontend Only)

```bash
# Clone the repository
git clone https://github.com/acastil7IT/CyberHawk-Project.git
cd CyberHawk-Project

# Install and start frontend
cd frontend
npm install
npm start

# Access at http://localhost:3000
# Uses mock data (same as live demo)
```

### Option 3: Full Stack with Docker

```bash
# Start all services
docker compose up -d

# Access the platform
# Web Interface: http://localhost:3000
# API Gateway: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

---

## 📖 How to Use

### 1. Generate Scan Data (Kali Linux)

```bash
# Basic network scan
nmap -sS -sV -O -oX network_scan.xml 192.168.1.0/24

# Comprehensive host scan
nmap -sS -sV -sC -p- -oX host_scan.xml target.example.com

# Service detection with scripts
nmap -sV --script vuln -oX vuln_scan.xml 192.168.1.100
```

**⚠️ Legal Notice**: Only scan networks you own or are explicitly authorized to test.

### 2. Upload to CyberHawk

1. Click **"Upload Nmap Scan"** button
2. Drag and drop your XML file or click to browse
3. Add optional notes about the scan
4. Review automated risk assessment

### 3. Analyze Results

- **Dashboard** - View overall security posture
- **Scan Sessions** - Browse historical scans
- **Session Details** - Drill down into specific hosts and ports
- **Incidents** - Review security findings and recommendations

---

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern JavaScript framework
- **Ant Design** - Professional UI components
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **FastAPI** - High-performance Python API
- **PostgreSQL** - Relational database
- **AsyncPG** - Async database driver
- **Pydantic** - Data validation

### Deployment
- **Vercel** - Frontend hosting (CDN)
- **Docker** - Containerization
- **Nginx** - Reverse proxy

---

## 📁 Project Structure

```
CyberHawk/
├── frontend/                    # React.js Application
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── Dashboard.js    # Main dashboard
│   │   │   ├── ScanUpload.js   # Upload interface
│   │   │   ├── Incidents.js    # Incident management
│   │   │   └── LiveAlerts.js   # Alert monitoring
│   │   └── services/
│   │       └── mockApi.js      # Demo data service
│   └── package.json
│
├── services/                    # Backend Services
│   ├── api-gateway/            # FastAPI Gateway
│   │   ├── main.py             # API endpoints
│   │   └── requirements.txt
│   └── network-discovery/      # Scan processing
│
├── database/                    # PostgreSQL
│   ├── init.sql                # Schema
│   └── sample_data.sql         # Demo data
│
├── docs/                       # Documentation
│   ├── KALI_LINUX_INTEGRATION.md
│   ├── DEPLOYMENT.md
│   └── TECHNICAL_ARCHITECTURE.md
│
├── docker-compose.yml          # Container orchestration
├── vercel.json                 # Vercel config
└── README.md                   # This file
```

---

## 🌐 Deploy to Vercel

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Update for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import from GitHub: `acastil7IT/CyberHawk-Project`
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/build`
5. Click **"Deploy"**

### Step 3: Configure Environment (Optional)

If deploying with backend:

```bash
# Add environment variables in Vercel dashboard
REACT_APP_API_URL=https://your-backend-url.com
```

### Step 4: Access Your Deployment

Your app will be live at: `https://your-project-name.vercel.app`

---

## 📊 Risk Assessment

### Automated Scoring

CyberHawk calculates risk scores (0-10) based on:

- **High-Risk Ports**: SSH (22), Telnet (23), RDP (3389), SMB (445)
- **Database Services**: MySQL (3306), PostgreSQL (5432), MSSQL (1433)
- **Management Protocols**: SNMP (161), WMI (135)
- **Service Exposure**: Number and types of open services

### Risk Levels

| Score | Level | Action |
|-------|-------|--------|
| 9-10 | 🔴 **CRITICAL** | Immediate attention required |
| 7-8 | 🟠 **HIGH** | High priority remediation |
| 4-6 | 🟡 **MEDIUM** | Moderate risk, monitor closely |
| 1-3 | 🟢 **LOW** | Low risk, routine maintenance |

---

## 🔧 Configuration

### Environment Variables

```bash
# Backend Configuration (if running full stack)
DATABASE_URL=postgresql://cyberhawk:secure123@localhost:5433/cyberhawk_db
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
MAX_UPLOAD_SIZE=10485760  # 10MB
RATE_LIMIT_UPLOADS=10     # Per hour
```

### Database Schema

- **scan_sessions** - Scan metadata and statistics
- **scan_hosts** - Discovered hosts with risk scores
- **scan_ports** - Port and service information
- **security_incidents** - Risk-based findings
- **risk_rules** - Configurable assessment criteria

---

## 📚 Documentation

- **[Kali Linux Integration](docs/KALI_LINUX_INTEGRATION.md)** - Complete scanning workflow
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)** - System design
- **[API Documentation](http://localhost:8001/docs)** - Interactive API reference (when backend running)

---

## ⚖️ Legal & Ethical Use

### ✅ Acceptable Use
- Analyzing scans of networks you own
- Authorized penetration testing
- Security compliance assessments
- Internal security monitoring
- Educational and research purposes

### ❌ Prohibited Use
- Scanning networks without permission
- Unauthorized reconnaissance
- Malicious security testing
- Violation of applicable laws

### Compliance
- Obtain written authorization before scanning
- Follow responsible disclosure practices
- Comply with local and international laws
- Document all security testing activities

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/enhancement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/enhancement`)
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Demo**: https://updated-network-security-pj-rtms.vercel.app
- **Repository**: https://github.com/acastil7IT/CyberHawk-Project
- **Issues**: https://github.com/acastil7IT/CyberHawk-Project/issues
- **Author**: Alejandro Castillo ([@acastil7IT](https://github.com/acastil7IT))

---

<div align="center">

**CyberHawk - Empowering Defensive Security Analysis**

*Built with ❤️ for the cybersecurity community*

[![GitHub stars](https://img.shields.io/github/stars/acastil7IT/CyberHawk-Project?style=social)](https://github.com/acastil7IT/CyberHawk-Project/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/acastil7IT/CyberHawk-Project?style=social)](https://github.com/acastil7IT/CyberHawk-Project/network/members)

</div>

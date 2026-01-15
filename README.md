# CyberHawk - Defensive Security Analysis Platform

<div align="center">

![CyberHawk Logo](https://img.shields.io/badge/CyberHawk-v2.0-blue?style=for-the-badge&logo=shield&logoColor=white)
[![Security](https://img.shields.io/badge/Security-Defensive%20Analysis-green?style=for-the-badge)](https://github.com/acastil7IT/CyberHawk-Project)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)](https://updated-network-security-pj-rtms.vercel.app)

**Professional-grade defensive security analysis and scan result visualization platform**

[Live Demo](https://updated-network-security-pj-rtms.vercel.app) • [Documentation](docs/) • [Kali Integration](docs/KALI_LINUX_INTEGRATION.md)

</div>

## 🛡️ Overview

CyberHawk is a **defensive security analysis platform** designed for security teams to analyze, compare, and assess network scan results. The platform ingests authorized scan data generated from tools like Nmap and provides comprehensive risk assessment, trend analysis, and security insights.

**Important**: CyberHawk does **NOT** perform active scanning or reconnaissance. It operates as a read-only analysis platform that processes scan results from authorized network assessments.

## 🎯 Core Capabilities

### Defensive Analysis Features
- **Scan Result Ingestion** - Upload and process Nmap XML scan results
- **Risk Assessment** - Automated risk scoring based on open ports and services
- **Trend Analysis** - Compare scan results over time to identify changes
- **Security Insights** - Identify high-risk hosts and vulnerable services
- **Compliance Reporting** - Generate reports for security frameworks

### Supported Scan Types
- **Host Discovery** - Network asset identification and classification
- **Port Scanning** - TCP/UDP port enumeration and service detection
- **Service Detection** - Version identification and vulnerability mapping
- **OS Fingerprinting** - Operating system identification and accuracy scoring

## 🏗️ Technology Stack

### Frontend Technologies
- **React.js 18** - Modern JavaScript framework with hooks
- **Ant Design** - Professional UI component library
- **Recharts** - Data visualization and charting
- **Axios** - HTTP client for API communication

### Backend Technologies
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Robust relational database with JSON support
- **AsyncPG** - Asynchronous PostgreSQL driver
- **Pydantic** - Data validation and serialization

### Security Features
- **Input Validation** - Hardened XML parsing with XXE protection
- **Rate Limiting** - Upload throttling and abuse prevention
- **CORS Protection** - Restricted cross-origin access
- **File Validation** - Size limits and type checking

### Infrastructure
- **Docker** - Containerized deployment
- **Nginx** - Reverse proxy and static file serving
- **Vercel** - Frontend hosting and CDN
- **Railway** - Backend deployment platform

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/acastil7IT/CyberHawk-Project.git
cd CyberHawk-Project

# Start all services
docker compose up -d

# Access the platform
# Web Interface: http://localhost:3000
# API Gateway: http://localhost:8001
```

### Option 2: Development Setup

```bash
# Backend setup
cd services/api-gateway
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001

# Frontend setup (new terminal)
cd frontend
npm install
npm start

# Database setup (new terminal)
docker run -d --name cyberhawk-db \
  -e POSTGRES_DB=cyberhawk_db \
  -e POSTGRES_USER=cyberhawk \
  -e POSTGRES_PASSWORD=secure123 \
  -p 5433:5432 \
  postgres:13-alpine
```

## 📊 Platform Usage

### 1. Generate Authorized Scan Data

Using Kali Linux or any system with Nmap:

```bash
# Basic network scan
nmap -sS -sV -O -oX network_scan.xml 192.168.1.0/24

# Comprehensive host scan
nmap -sS -sV -sC -p- -oX host_scan.xml target.example.com

# Service detection scan
nmap -sV --script vuln -oX vuln_scan.xml 192.168.1.100
```

**⚠️ Legal Notice**: Only scan networks you own or are explicitly authorized to test.

### 2. Upload and Analyze Results

1. **Access CyberHawk** - Navigate to the Scan Upload section
2. **Upload XML File** - Drag and drop your Nmap XML results
3. **Add Context** - Include notes about the scan purpose and scope
4. **Review Analysis** - Examine risk scores, host details, and recommendations

### 3. Monitor and Compare

- **Track Changes** - Compare scan results over time
- **Risk Trends** - Monitor risk score changes and new vulnerabilities
- **Asset Inventory** - Maintain up-to-date network asset database
- **Compliance** - Generate reports for security audits

## 🔒 Security Model

### Defensive Approach
- **No Active Scanning** - Platform never initiates network scans
- **Read-Only Analysis** - Processes existing scan data only
- **Authorized Data Only** - Designed for legitimate security assessments
- **Privacy Focused** - No external data transmission

### Data Protection
- **Input Sanitization** - Hardened XML parsing prevents injection attacks
- **Rate Limiting** - Prevents abuse and resource exhaustion
- **Access Controls** - Authentication required for all operations
- **Audit Logging** - Comprehensive activity logging

## 📁 Project Structure

```
CyberHawk/
├── frontend/                 # React.js web application
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── Dashboard.js # Main security dashboard
│   │   │   ├── ScanUpload.js # Scan result upload interface
│   │   │   └── Incidents.js # Security incident management
│   │   └── services/        # API integration
├── services/
│   ├── api-gateway/         # FastAPI backend service
│   │   ├── main.py         # API endpoints and business logic
│   │   └── requirements.txt # Python dependencies
├── database/
│   ├── init.sql            # Database schema
│   └── sample_data.sql     # Demo data for testing
├── docs/
│   ├── KALI_LINUX_INTEGRATION.md # Kali Linux scanning guide
│   ├── DEPLOYMENT.md       # Deployment instructions
│   └── TECHNICAL_ARCHITECTURE.md # Technical documentation
└── docker-compose.yml      # Container orchestration
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://cyberhawk:secure123@localhost:5433/cyberhawk_db

# API Configuration
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# Security Settings
MAX_UPLOAD_SIZE=10485760  # 10MB
RATE_LIMIT_UPLOADS=10     # Per hour
```

### Database Schema

The platform uses a normalized PostgreSQL schema:

- **scan_sessions** - Uploaded scan metadata and statistics
- **scan_hosts** - Discovered network hosts with risk scores
- **scan_ports** - Open ports and service information
- **security_incidents** - Risk-based security findings
- **risk_rules** - Configurable risk assessment criteria

## 📈 Risk Assessment

### Automated Risk Scoring

CyberHawk calculates risk scores based on:

- **High-Risk Ports**: SSH (22), Telnet (23), RDP (3389), SMB (445)
- **Database Services**: MySQL (3306), PostgreSQL (5432), MSSQL (1433)
- **Management Protocols**: SNMP (161), WMI (135)
- **Service Exposure**: Number and types of open services
- **Known Vulnerabilities**: Service version analysis

### Risk Levels

- **CRITICAL (9-10)**: Immediate attention required
- **HIGH (7-8)**: High priority remediation
- **MEDIUM (4-6)**: Moderate risk, monitor closely
- **LOW (1-3)**: Low risk, routine maintenance

## 🔍 Supported Scan Formats

### Nmap XML Output

CyberHawk supports comprehensive Nmap XML files containing:

- Host discovery results with IP addresses and hostnames
- Port scan results with service detection
- Operating system fingerprinting
- Service version information
- Script scan results and vulnerability data

### Example Compatible Commands

```bash
# Host and service discovery
nmap -sS -sV -O -oX comprehensive.xml 192.168.1.0/24

# Vulnerability scanning
nmap -sV --script vuln -oX vulnerability.xml target

# Full port scan with OS detection
nmap -sS -p- -O -oX full_scan.xml target
```

## 📚 Documentation

- **[Kali Linux Integration Guide](docs/KALI_LINUX_INTEGRATION.md)** - Complete scanning workflow
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)** - System design and components
- **[API Documentation](http://localhost:8001/docs)** - Interactive API reference

## 🤝 Contributing

We welcome contributions to improve CyberHawk's defensive analysis capabilities:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/enhancement`)
3. **Commit changes** (`git commit -am 'Add new analysis feature'`)
4. **Push to branch** (`git push origin feature/enhancement`)
5. **Create Pull Request**

### Development Guidelines

- Follow secure coding practices
- Maintain defensive security focus
- Add comprehensive tests
- Update documentation
- Ensure compliance with security standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚖️ Legal and Ethical Use

**IMPORTANT**: CyberHawk is designed for legitimate security analysis of authorized networks only.

### Acceptable Use
- ✅ Analyzing scans of networks you own
- ✅ Authorized penetration testing
- ✅ Security compliance assessments
- ✅ Internal security monitoring
- ✅ Educational and research purposes

### Prohibited Use
- ❌ Scanning networks without permission
- ❌ Unauthorized reconnaissance
- ❌ Malicious security testing
- ❌ Violation of applicable laws
- ❌ Breach of service agreements

### Compliance Requirements
- Obtain written authorization before scanning
- Follow responsible disclosure practices
- Comply with local and international laws
- Respect network owners' policies
- Document all security testing activities

## 🆘 Support

### Getting Help
- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions
- **Security**: Report security issues privately

### Community Resources
- [Nmap Documentation](https://nmap.org/docs.html)
- [Kali Linux Resources](https://www.kali.org/docs/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

**CyberHawk - Empowering Defensive Security Analysis**

*Built with ❤️ for the cybersecurity community*

# Install dependencies and start
npm install
npm start

# Access at http://localhost:3000
# Uses mock data (same as live demo)
```

#### Option 3: Live Demo (No Installation)
Visit: [https://updated-network-security-pj-rtms.vercel.app](https://updated-network-security-pj-rtms.vercel.app)

## Project Structure

```
CyberHawk/
├── frontend/                    # React.js Frontend Application
│   ├── src/
│   │   ├── components/         # React components (.js files)
│   │   │   ├── Dashboard.js    # Main security dashboard
│   │   │   ├── Incidents.js    # Incident management interface
│   │   │   ├── NetworkTraffic.js # Traffic monitoring display
│   │   │   ├── LiveAlerts.js   # Real-time threat alerts
│   │   │   └── AdvancedScanning.js # Security tools interface
│   │   ├── services/           # API service layers
│   │   │   └── mockApi.js      # Mock data for cloud deployment
│   │   └── App.js              # Main React application
│   ├── public/                 # Static assets and HTML
│   ├── package.json            # Node.js dependencies
│   └── Dockerfile              # Frontend container configuration
│
├── services/                    # Python Backend Microservices
│   ├── api-gateway/            # FastAPI main gateway
│   │   └── main.py             # API routes and endpoints
│   ├── threat-detector/        # Security analysis engine
│   │   ├── main.py             # Threat detection service
│   │   └── real_time_detector.py # ML-based threat analysis
│   ├── traffic-analyzer/       # Network traffic processing
│   │   └── main.py             # Packet analysis service
│   ├── network-discovery/      # Asset discovery service
│   │   └── network_discovery.py # Network scanning logic
│   └── security-tools/         # Security tool integrations
│       └── advanced_scanner.py # Nmap/Nikto integration
│
├── database/                    # PostgreSQL Database
│   ├── init.sql                # Database schema creation
│   └── sample_data.sql         # Demo data for testing
│
├── docs/                       # Project Documentation
│   ├── PROJECT_SUMMARY.md      # Technical overview
│   ├── TECHNICAL_ARCHITECTURE.md # Detailed architecture
│   ├── DEPLOYMENT.md           # Deployment instructions
│   └── HOW_IT_WORKS.md         # User guide
│
├── demos/                      # Python Demo Scripts
│   ├── comprehensive_attack_demo.py # Full attack simulation
│   ├── traffic_injector.py     # Network traffic generator
│   └── README.md               # Demo documentation
│
├── scripts/                    # Automation Scripts
│   ├── deploy.sh               # Production deployment
│   ├── setup.sh                # Initial setup automation
│   └── update_ui_live.sh       # Live update script
│
├── nginx/                      # Web Server Configuration
│   ├── nginx.conf              # Development configuration
│   └── nginx.prod.conf         # Production configuration
│
├── docker-compose.yml          # Multi-service orchestration
├── docker-compose.prod.yml     # Production Docker setup
├── Dockerfile.railway          # Railway deployment config
├── vercel.json                 # Vercel deployment config
├── railway.json                # Railway platform config
└── .env.example                # Environment variables template
```

## Security Features

### Threat Intelligence
- **Real-time Monitoring** - Continuous network surveillance
- **Incident Classification** - Automated threat categorization
- **Risk Assessment** - Dynamic risk scoring and prioritization
- **Response Workflows** - Guided incident response procedures

### Network Analysis
- **Traffic Monitoring** - Deep packet inspection and analysis
- **Device Discovery** - Automated network asset identification
- **Vulnerability Scanning** - Integrated security assessment tools
- **Anomaly Detection** - ML-powered behavioral analysis

### Professional Tools
- **Nmap Integration** - Network discovery and port scanning
- **Wireshark Analysis** - Packet capture and protocol analysis
- **Nikto Scanning** - Web vulnerability assessment
- **Custom Security Tools** - Extensible tool framework

## Demo & Testing

### Python Demo Scripts
```bash
# Run comprehensive attack simulation
python3 demos/comprehensive_attack_demo.py

# Generate network traffic patterns  
python3 demos/traffic_injector.py
```

**Demo Script Details:**
- `comprehensive_attack_demo.py` - Full security testing suite with port scans, brute force, and vulnerability tests
- `traffic_injector.py` - Network traffic simulation for testing monitoring capabilities
- All scripts include realistic attack patterns and safety measures

### Web Interface Testing
1. Navigate to **Security & Discovery** → **Attack Simulation** tab
2. Choose simulation type:
   - **Comprehensive Attack Demo** - Full attack simulation
   - **Port Scan Simulation** - Network reconnaissance testing
   - **Brute Force Simulation** - Login attack simulation
3. Monitor results in **Live Threats** and **Network Monitor** sections
4. View incident details in **Command Center** dashboard

### API Testing
```bash
# Health check
curl http://localhost:8001/health

# Get incidents
curl http://localhost:8001/api/incidents

# Get network traffic
curl http://localhost:8001/api/traffic

# Get live alerts
curl http://localhost:8001/api/alerts
```

## Configuration

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional)
nano .env
```

**Key Configuration Files:**
- `.env` - Environment variables (database, API keys)
- `docker-compose.yml` - Service orchestration
- `frontend/package.json` - Node.js dependencies
- `requirements.txt` - Python dependencies (in service folders)

### Database Configuration
- **PostgreSQL 13+** with automated schema setup
- **Sample data** included for testing and demonstration
- **Backup/restore** capabilities built-in
- **Connection**: `postgresql://admin:password@localhost:5432/securenet`

### Security Settings
- **JWT authentication** for API access
- **Rate limiting** and request validation
- **CORS configuration** for cross-origin requests
- **SSL/TLS** ready for production deployment

## Monitoring & Analytics

### Dashboard Features
- **Command Center** - Executive security overview
- **Threat Intelligence** - Detailed incident analysis
- **Network Monitor** - Real-time traffic visualization
- **Live Threats** - Active threat monitoring
- **Security Tools** - Integrated scanning capabilities
- **Asset Discovery** - Network device management

### Reporting
- Automated threat reports
- Compliance dashboards
- Performance metrics
- Security posture assessment

## Deployment

### Local Development
```bash
# Start development environment
docker compose up -d

# View logs
docker compose logs -f
```

### Production Deployment
```bash
# Deploy to production
./scripts/deploy.sh

# Health check
curl http://localhost:8001/health
```

### Cloud Platforms
- **Vercel** - Frontend deployment
- **Railway** - Full-stack deployment
- **AWS/GCP/Azure** - Enterprise deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **Live Demo**: https://updated-network-security-pj-rtms.vercel.app
- **Repository**: https://github.com/acastil7IT/CyberHawk-Project
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/acastil7IT/CyberHawk-Project/issues)

---

<div align="center">

**Built with care for cybersecurity professionals**

[![GitHub stars](https://img.shields.io/github/stars/acastil7IT/CyberHawk-Project?style=social)](https://github.com/acastil7IT/CyberHawk-Project/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/acastil7IT/CyberHawk-Project?style=social)](https://github.com/acastil7IT/CyberHawk-Project/network/members)

</div>
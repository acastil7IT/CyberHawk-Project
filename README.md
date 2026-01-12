# CyberHawk - Intelligent Threat Hunting Platform

<div align="center">

![CyberHawk Logo](https://img.shields.io/badge/CyberHawk-v3.0-blue?style=for-the-badge&logo=shield&logoColor=white)
[![Security](https://img.shields.io/badge/Security-Enterprise-red?style=for-the-badge)](https://github.com/acastil7IT/Updated-Network-Security-PJ)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)](https://updated-network-security-pj-rtms.vercel.app)

**Professional-grade cybersecurity monitoring and threat detection platform**

[Live Demo](https://updated-network-security-pj-rtms.vercel.app) • [Documentation](docs/) • [Security Features](#features)

</div>

## Overview

CyberHawk is an enterprise-grade cybersecurity platform that provides real-time network monitoring, threat detection, and incident response capabilities. Built with modern web technologies and professional security tools integration.

## Technology Stack

### Frontend Technologies
- **React.js** - Modern JavaScript framework for building user interfaces
- **Ant Design** - Professional UI component library for enterprise applications
- **CSS3** - Custom styling with responsive design and dark theme
- **Axios** - HTTP client for API communication
- **JavaScript ES6+** - Modern JavaScript features and syntax

### Backend Technologies
- **Python 3.8+** - Primary backend programming language
- **FastAPI** - High-performance web framework for building APIs
- **PostgreSQL** - Robust relational database for data persistence
- **SQLAlchemy** - Python SQL toolkit and Object-Relational Mapping
- **Uvicorn** - Lightning-fast ASGI server implementation

### Security & Networking Tools
- **Nmap** - Network discovery and security auditing
- **Wireshark** - Network protocol analyzer
- **Nikto** - Web server scanner for vulnerabilities
- **Scapy** - Python packet manipulation library
- **Custom Security Scripts** - Tailored threat detection algorithms

### Infrastructure & DevOps
- **Docker** - Containerization platform for consistent deployments
- **Docker Compose** - Multi-container application orchestration
- **Nginx** - High-performance web server and reverse proxy
- **Redis** - In-memory data structure store for caching
- **Shell Scripts** - Automation and deployment scripts

### Cloud & Deployment
- **Vercel** - Frontend hosting and serverless deployment
- **Railway** - Full-stack application deployment platform
- **GitHub Actions** - CI/CD pipeline automation (ready)
- **Environment Variables** - Secure configuration management

### Development Tools
- **Git** - Version control system
- **ESLint** - JavaScript code linting and formatting
- **Python Virtual Environments** - Isolated dependency management
- **npm/yarn** - JavaScript package management

### Key Features

- **Real-time Threat Detection** - Advanced monitoring with ML-powered analysis
- **Professional Dashboard** - Clean, intuitive security operations center
- **Network Discovery** - Automated asset discovery and monitoring
- **Live Alerts** - Instant threat notifications and response
- **Security Tools Integration** - Nmap, Wireshark, Nikto, and more
- **Incident Management** - Complete threat lifecycle tracking

## Quick Start

### Prerequisites
- **Docker** (v20.10+) & **Docker Compose** (v2.0+)
- **Git** for version control
- **Node.js** (v16+) and **npm** (for frontend-only setup)
- **Python** (v3.8+) for running demo scripts

### Installation Options

#### Option 1: Full Docker Deployment (Recommended)
```bash
# Clone the repository
git clone https://github.com/acastil7IT/Updated-Network-Security-PJ.git
cd Updated-Network-Security-PJ

# Start all services with Docker
docker compose up -d

# Access the platform
# Web Interface: http://localhost:3000
# API Gateway: http://localhost:8001
# Database: localhost:5432
```

#### Option 2: Frontend Only (Quick Test)
```bash
# Clone and navigate to frontend
git clone https://github.com/acastil7IT/Updated-Network-Security-PJ.git
cd Updated-Network-Security-PJ/frontend

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
- **Repository**: https://github.com/acastil7IT/Updated-Network-Security-PJ
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/acastil7IT/Updated-Network-Security-PJ/issues)

---

<div align="center">

**Built with care for cybersecurity professionals**

[![GitHub stars](https://img.shields.io/github/stars/acastil7IT/Updated-Network-Security-PJ?style=social)](https://github.com/acastil7IT/Updated-Network-Security-PJ/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/acastil7IT/Updated-Network-Security-PJ?style=social)](https://github.com/acastil7IT/Updated-Network-Security-PJ/network/members)

</div>
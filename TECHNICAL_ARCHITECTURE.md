# CyberHawk - Technical Architecture Documentation

## 🏗️ System Overview

CyberHawk is a microservices-based cybersecurity platform built with modern web technologies. It demonstrates enterprise-grade security monitoring, threat detection, and incident response capabilities.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Components](#frontend-components)
3. [Backend Services](#backend-services)
4. [Database Schema](#database-schema)
5. [Data Flow](#data-flow)
6. [Security Features](#security-features)
7. [Deployment Architecture](#deployment-architecture)
8. [File Structure](#file-structure)

---

## 🎯 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   FastAPI       │    │   PostgreSQL    │
│   (Port 3000)   │◄──►│   Gateway       │◄──►│   Database      │
│                 │    │   (Port 8001)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         └──────────────┤   Cache/Queue   │──────────────┘
                        │   (Port 6379)   │
                        └─────────────────┘
                                 │
                    ┌─────────────────────────────┐
                    │     Microservices Layer     │
                    │                             │
                    │  ┌─────────────────────┐   │
                    │  │ Network Discovery   │   │
                    │  │ Threat Detector     │   │
                    │  │ Traffic Analyzer    │   │
                    │  │ Security Tools      │   │
                    │  └─────────────────────┘   │
                    └─────────────────────────────┘
```

### Core Technologies
- **Frontend**: React 18, Ant Design, Recharts
- **Backend**: FastAPI (Python), AsyncPG, Redis
- **Database**: PostgreSQL 15
- **Infrastructure**: Docker, Docker Compose, NGINX
- **Security Tools**: Nmap, Wireshark, Nikto integration

---

## 🎨 Frontend Components

### Main Application (`frontend/src/App.js`)
```javascript
// Main application router and layout
const App = () => {
  return (
    <Router>
      <Layout className="securenet-layout">
        <Sider>           // Sidebar navigation
        <Header>          // Top header bar
        <Content>         // Main content area
          <Routes>        // Page routing
```

**Key Features:**
- Single Page Application (SPA) with React Router
- Ant Design component library for professional UI
- Responsive layout with collapsible sidebar
- Professional cybersecurity theme

### Component Architecture

#### 1. Dashboard (`frontend/src/components/Dashboard.js`)
```javascript
// Real-time security metrics and overview
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [networkDevices, setNetworkDevices] = useState([]);
  
  // Fetches data every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
  }, []);
```

**Responsibilities:**
- Display security statistics (threats, incidents, packets)
- Show network asset discovery results
- Real-time data updates
- System health monitoring

#### 2. Network Discovery (`frontend/src/components/NetworkDiscovery.js`)
```javascript
// Network device scanning and management
const NetworkDiscovery = () => {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  
  // API call with fallback to mock data
  const fetchDevices = async () => {
    try {
      const response = await axios.get('/api/network/devices');
      setDevices(response.data.devices);
    } catch (error) {
      // Fallback to mock data for cloud deployment
      setDevices(mockNetworkDevices);
    }
  };
```

**Features:**
- Real-time network device discovery
- Device classification and risk assessment
- Mock data fallback for cloud deployment
- Interactive device details modal

#### 3. Advanced Scanning (`frontend/src/components/AdvancedScanning.js`)
```javascript
// Security scanning tools interface
const AdvancedScanning = () => {
  const [scanResults, setScanResults] = useState([]);
  const [scanType, setScanType] = useState('comprehensive');
  
  // Simulates security scans with realistic results
  const startAdvancedScan = async () => {
    setScanning(true);
    // Progress simulation
    const progressInterval = setInterval(() => {
      setScanProgress(prev => prev + 10);
    }, 500);
```

**Capabilities:**
- Multiple scan types (Nmap, Nikto, Vulnerability scans)
- Real-time progress tracking
- Scan result analysis and reporting
- Integration with security tools

### Mock API Service (`frontend/src/services/mockApi.js`)
```javascript
// Provides realistic demo data for cloud deployment
export const mockApi = {
  getDashboardStats: () => Promise.resolve(mockStats),
  getIncidents: (params) => Promise.resolve(filteredIncidents),
  getTraffic: (params) => Promise.resolve(filteredTraffic),
  // ... other mock endpoints
};
```

**Purpose:**
- Safe demo data for public deployment
- Realistic cybersecurity scenarios
- No sensitive information exposed
- Maintains full functionality

---

## ⚙️ Backend Services

### API Gateway (`services/api-gateway/main.py`)
```python
# FastAPI application with async database connections
app = FastAPI(title="CyberHawk API Gateway")

@app.on_event("startup")
async def startup():
    # Create database connection pool
    db_pool = await asyncpg.create_pool(db_url, min_size=2, max_size=20)
    
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    # Aggregate security metrics from database
    async with db_pool.acquire() as conn:
        incidents = await conn.fetch("SELECT * FROM security_incidents")
        # ... process and return stats
```

**Features:**
- Async/await for high performance
- Connection pooling for scalability
- JWT authentication (ready for production)
- CORS configuration for frontend integration

### Network Discovery Service (`services/network-discovery/network_discovery.py`)
```python
# Continuous network scanning service
import nmap
import asyncio
import asyncpg

class NetworkDiscovery:
    def __init__(self):
        self.nm = nmap.PortScanner()
        
    async def scan_network(self, network_range="192.168.1.0/24"):
        # Perform network scan
        scan_result = self.nm.scan(network_range, arguments='-sn')
        
        # Process and store results
        for host in scan_result['scan']:
            device_info = await self.identify_device(host)
            await self.store_device(device_info)
```

**Capabilities:**
- Automated network scanning every 5 minutes
- Device fingerprinting and classification
- MAC address vendor identification
- Risk assessment scoring

### Threat Detection Engine (`services/threat-detector/main.py`)
```python
# ML-based threat detection
from sklearn.ensemble import IsolationForest
import pandas as pd

class ThreatDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1)
        
    async def analyze_traffic(self, traffic_data):
        # Feature extraction
        features = self.extract_features(traffic_data)
        
        # Anomaly detection
        anomaly_scores = self.model.decision_function(features)
        
        # Generate alerts for suspicious activity
        for score, packet in zip(anomaly_scores, traffic_data):
            if score < -0.5:  # Threshold for anomaly
                await self.create_alert(packet, score)
```

**Features:**
- Machine learning anomaly detection
- Real-time traffic analysis
- Automated alert generation
- Adaptive learning from new data

---

## 🗄️ Database Schema

### Core Tables (`database/init.sql`)

#### Security Incidents
```sql
CREATE TABLE security_incidents (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20) NOT NULL,           -- LOW, MEDIUM, HIGH, CRITICAL
    incident_type VARCHAR(50) NOT NULL,      -- PORT_SCAN, BRUTE_FORCE, etc.
    source_ip INET NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'OPEN',       -- OPEN, ACKNOWLEDGED, RESOLVED
    assigned_to VARCHAR(100),
    resolved_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_incidents_status ON security_incidents(status);
CREATE INDEX idx_incidents_created ON security_incidents(created_at);
```

#### Network Traffic
```sql
CREATE TABLE network_traffic (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_ip INET NOT NULL,
    dest_ip INET NOT NULL,
    source_port INTEGER,
    dest_port INTEGER,
    protocol VARCHAR(10),
    packet_size INTEGER,
    flags VARCHAR(20)
);

-- Optimized for time-series queries
CREATE INDEX idx_traffic_timestamp ON network_traffic(timestamp DESC);
CREATE INDEX idx_traffic_source_ip ON network_traffic(source_ip);
```

#### Network Devices
```sql
CREATE TABLE network_devices (
    id SERIAL PRIMARY KEY,
    ip_address INET UNIQUE NOT NULL,
    mac_address MACADDR,
    hostname VARCHAR(255),
    device_type VARCHAR(100),
    vendor VARCHAR(100),
    os_fingerprint VARCHAR(200),
    is_online BOOLEAN DEFAULT true,
    risk_score INTEGER DEFAULT 0,
    open_ports INTEGER[],
    first_discovered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Data Flow

### 1. Network Discovery Flow
```
Network Scan → Device Detection → Database Storage → Frontend Display
     ↓              ↓                    ↓               ↓
   Nmap         Classification      PostgreSQL      React Component
  Scanner      (Device Type,         INSERT         State Update
              Vendor, Risk)
```

### 2. Threat Detection Flow
```
Traffic Capture → Analysis → Alert Generation → Incident Creation
      ↓             ↓            ↓                 ↓
   Packet        ML Model    Redis Queue      Database Insert
  Analyzer      (Anomaly)   (Real-time)      (Persistence)
```

### 3. Frontend Data Flow
```
User Action → API Request → Database Query → Response → UI Update
     ↓            ↓             ↓             ↓          ↓
  Click Scan   HTTP POST    SELECT/INSERT   JSON      setState()
```

---

## 🔒 Security Features

### Authentication & Authorization
```python
# JWT token validation
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
```

### Input Validation
```python
# Pydantic models for request validation
from pydantic import BaseModel, validator

class ScanRequest(BaseModel):
    target: str
    scan_type: str
    
    @validator('target')
    def validate_target(cls, v):
        # Prevent scanning unauthorized targets
        if not is_authorized_target(v):
            raise ValueError('Unauthorized scan target')
        return v
```

### SQL Injection Prevention
```python
# Parameterized queries with AsyncPG
async def get_incidents(severity: str = None):
    query = "SELECT * FROM security_incidents WHERE 1=1"
    params = []
    
    if severity:
        query += " AND severity = $1"
        params.append(severity)
    
    return await conn.fetch(query, *params)
```

---

## 🚀 Deployment Architecture

### Docker Compose Structure
```yaml
# docker-compose.yml - Multi-service orchestration
services:
  postgres:      # Database layer
  redis:         # Caching/Queue layer  
  api-gateway:   # API layer
  dashboard:     # Frontend layer
  nginx:         # Reverse proxy layer
  
  # Security services
  threat-detector:
  network-discovery:
  traffic-analyzer:
```

### Production Deployment
```bash
# Multi-stage Docker build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
```

### Cloud Deployment Options
1. **Railway**: Full-stack with database
2. **Vercel**: Frontend-only with mock data
3. **AWS ECS**: Container orchestration
4. **Kubernetes**: Scalable microservices

---

## 📁 File Structure

```
cyberhawk/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Dashboard.js    # Main dashboard
│   │   │   ├── NetworkDiscovery.js  # Device scanning
│   │   │   ├── AdvancedScanning.js  # Security tools
│   │   │   ├── Incidents.js    # Incident management
│   │   │   ├── NetworkTraffic.js    # Traffic analysis
│   │   │   └── LiveAlerts.js   # Real-time alerts
│   │   ├── services/
│   │   │   └── mockApi.js      # Demo data service
│   │   ├── App.js              # Main application
│   │   ├── App.css             # Professional styling
│   │   └── index.js            # React entry point
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── package.json            # Dependencies
│   └── Dockerfile              # Container build
│
├── services/                    # Backend microservices
│   ├── api-gateway/
│   │   ├── main.py             # FastAPI application
│   │   ├── requirements.txt    # Python dependencies
│   │   └── Dockerfile          # Container build
│   ├── network-discovery/
│   │   ├── network_discovery.py # Network scanning
│   │   └── requirements.txt
│   ├── threat-detector/
│   │   ├── main.py             # Threat analysis
│   │   ├── real_time_detector.py
│   │   └── requirements.txt
│   ├── traffic-analyzer/
│   │   ├── main.py             # Packet analysis
│   │   └── requirements.txt
│   └── security-tools/
│       ├── advanced_scanner.py # Security tools
│       └── requirements.txt
│
├── database/
│   ├── init.sql                # Database schema
│   └── sample_data.sql         # Demo data
│
├── nginx/
│   └── nginx.conf              # Reverse proxy config
│
├── docker-compose.yml          # Service orchestration
├── setup.sh                    # Automated setup
├── deploy.sh                   # Deployment script
├── README.md                   # Project documentation
└── TECHNICAL_ARCHITECTURE.md   # This file
```

---

## 🔧 Key Design Patterns

### 1. Microservices Architecture
- **Separation of Concerns**: Each service has a single responsibility
- **Independent Scaling**: Services can be scaled individually
- **Technology Diversity**: Different services can use optimal technologies

### 2. API Gateway Pattern
- **Single Entry Point**: All frontend requests go through one gateway
- **Cross-Cutting Concerns**: Authentication, logging, rate limiting
- **Service Discovery**: Gateway routes requests to appropriate services

### 3. CQRS (Command Query Responsibility Segregation)
- **Read Models**: Optimized for dashboard queries
- **Write Models**: Optimized for incident creation
- **Event Sourcing**: Audit trail for security events

### 4. Circuit Breaker Pattern
```python
# Graceful degradation when services are unavailable
async def fetch_with_fallback(api_call, fallback_data):
    try:
        return await api_call()
    except Exception:
        return fallback_data  # Mock data for demo
```

---

## 📊 Performance Considerations

### Database Optimization
- **Indexing Strategy**: Time-based indexes for traffic data
- **Connection Pooling**: Async connection management
- **Query Optimization**: Efficient aggregation queries

### Frontend Performance
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large data tables

### Caching Strategy
- **Redis**: Session data and frequently accessed metrics
- **Browser Cache**: Static assets and API responses
- **CDN**: Global content delivery (production)

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Component testing with React Testing Library
test('Dashboard displays security metrics', () => {
  render(<Dashboard />);
  expect(screen.getByText('Total Threats')).toBeInTheDocument();
});
```

### Integration Tests
```python
# API endpoint testing
async def test_get_incidents():
    response = await client.get("/api/incidents")
    assert response.status_code == 200
    assert len(response.json()) > 0
```

### Security Tests
- **Penetration Testing**: Automated security scans
- **Input Validation**: SQL injection prevention
- **Authentication**: JWT token validation

---

## 🎯 Interview Talking Points

### Technical Depth
1. **Microservices**: Explain service decomposition strategy
2. **Database Design**: Discuss indexing and query optimization
3. **Security**: Demonstrate threat modeling approach
4. **Performance**: Show caching and optimization techniques
5. **DevOps**: Explain containerization and deployment

### Business Value
1. **Scalability**: How the architecture supports growth
2. **Maintainability**: Code organization and testing
3. **Security**: Real-world cybersecurity applications
4. **User Experience**: Professional UI/UX design

### Problem Solving
1. **Mock Data Strategy**: Handling cloud deployment limitations
2. **Error Handling**: Graceful degradation patterns
3. **Real-time Updates**: WebSocket vs polling trade-offs
4. **Cross-Origin Issues**: CORS configuration

---

This documentation demonstrates enterprise-level software architecture, cybersecurity expertise, and full-stack development skills - perfect for technical interviews and code reviews! 🚀
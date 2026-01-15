#!/usr/bin/env python3
"""
CyberHawk Defensive Security Analysis API Gateway
REST API for scan result ingestion and security analysis
"""

import hashlib
import json
import os
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

import asyncpg
import structlog
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# FastAPI app
app = FastAPI(
    title="CyberHawk Defensive Security Analysis API",
    description="Network Security Analysis and Scan Result Ingestion API",
    version="2.0.0"
)

# CORS middleware - restrict to deployed frontend domain in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://updated-network-security-pj-rtms.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Global connections
db_pool = None

# Pydantic models
class DashboardStats(BaseModel):
    total_sessions: int
    total_hosts: int
    total_incidents: int
    critical_incidents: int
    high_risk_hosts: int
    recent_sessions: List[dict]

# Rate limiting (simple in-memory implementation)
upload_attempts = {}
MAX_UPLOADS_PER_HOUR = 10

def check_rate_limit(client_ip: str) -> bool:
    """Simple rate limiting for file uploads"""
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    
    if client_ip not in upload_attempts:
        upload_attempts[client_ip] = []
    
    # Clean old attempts
    upload_attempts[client_ip] = [
        attempt for attempt in upload_attempts[client_ip] 
        if attempt > hour_ago
    ]
    
    if len(upload_attempts[client_ip]) >= MAX_UPLOADS_PER_HOUR:
        return False
    
    upload_attempts[client_ip].append(now)
    return True

# Startup/shutdown events
@app.on_event("startup")
async def startup():
    global db_pool
    
    try:
        # Database connection
        db_url = os.getenv('DATABASE_URL', 'postgresql://cyberhawk:secure123@localhost:5433/cyberhawk_db')
        db_pool = await asyncpg.create_pool(db_url, min_size=2, max_size=20)
        
        logger.info("CyberHawk API Gateway started successfully")
        
    except Exception as e:
        logger.error("Failed to start API Gateway", error=str(e))
        raise

@app.on_event("shutdown")
async def shutdown():
    global db_pool
    if db_pool:
        await db_pool.close()

# Authentication (simplified for demo)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, validate JWT token here
    return {"username": "security_analyst", "role": "analyst"}

# Utility functions
def calculate_host_risk_score(ports: List[Dict]) -> tuple[int, str]:
    """Calculate risk score for a host based on open ports"""
    total_score = 0
    high_risk_ports = 0
    
    # High-risk port mappings
    high_risk_port_scores = {
        22: 7, 23: 9, 21: 6, 445: 8, 3389: 8, 135: 6, 
        161: 7, 1433: 7, 3306: 6, 5432: 6
    }
    
    for port in ports:
        port_num = port.get('port_number', 0)
        if port_num in high_risk_port_scores:
            score = high_risk_port_scores[port_num]
            total_score += score
            if score >= 7:
                high_risk_ports += 1
        else:
            total_score += 2  # Base score for any open port
    
    # Normalize score (0-10 scale)
    normalized_score = min(10, total_score // max(1, len(ports)))
    
    if normalized_score >= 8:
        risk_level = "CRITICAL"
    elif normalized_score >= 6:
        risk_level = "HIGH"
    elif normalized_score >= 4:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return normalized_score, risk_level

def parse_nmap_xml(xml_content: str) -> Dict[str, Any]:
    """Parse Nmap XML scan results with security hardening"""
    try:
        # Disable external entity processing to prevent XXE attacks
        parser = ET.XMLParser()
        parser.entity = {}  # Disable entity processing
        
        root = ET.fromstring(xml_content, parser)
        
        scan_info = {
            'hosts': [],
            'scan_args': root.get('args', ''),
            'start_time': root.get('startstr', ''),
            'version': root.get('version', '')
        }
        
        for host in root.findall('.//host'):
            # Skip hosts that are down
            status = host.find('status')
            if status is None or status.get('state') != 'up':
                continue
                
            host_info = {
                'ip_address': '',
                'hostname': None,
                'mac_address': None,
                'vendor': None,
                'os_name': None,
                'os_accuracy': None,
                'ports': []
            }
            
            # Get IP address
            address = host.find('.//address[@addrtype="ipv4"]')
            if address is not None:
                host_info['ip_address'] = address.get('addr')
            
            # Get MAC address and vendor
            mac_address = host.find('.//address[@addrtype="mac"]')
            if mac_address is not None:
                host_info['mac_address'] = mac_address.get('addr')
                host_info['vendor'] = mac_address.get('vendor')
            
            # Get hostname
            hostname = host.find('.//hostname')
            if hostname is not None:
                host_info['hostname'] = hostname.get('name')
            
            # Get OS information
            os_match = host.find('.//osmatch')
            if os_match is not None:
                host_info['os_name'] = os_match.get('name')
                host_info['os_accuracy'] = int(os_match.get('accuracy', 0))
            
            # Get open ports
            ports = host.find('.//ports')
            if ports is not None:
                for port in ports.findall('port'):
                    state = port.find('state')
                    if state is not None and state.get('state') == 'open':
                        service = port.find('service')
                        port_info = {
                            'port_number': int(port.get('portid')),
                            'protocol': port.get('protocol'),
                            'port_state': state.get('state'),
                            'service_name': service.get('name') if service is not None else None,
                            'service_version': service.get('version') if service is not None else None,
                            'service_product': service.get('product') if service is not None else None
                        }
                        host_info['ports'].append(port_info)
            
            if host_info['ip_address']:  # Only add hosts with valid IP
                scan_info['hosts'].append(host_info)
        
        return scan_info
        
    except ET.ParseError as e:
        raise HTTPException(status_code=400, detail=f"Invalid XML format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing XML: {str(e)}")

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "CyberHawk Defensive Security Analysis API", 
        "version": "2.0.0",
        "mode": "Defensive Analysis Platform"
    }

@app.get("/health")
async def health_check():
    try:
        # Check database
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        
        return {"status": "healthy", "timestamp": datetime.now()}
        
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(user=Depends(get_current_user)):
    """Get dashboard statistics"""
    try:
        async with db_pool.acquire() as conn:
            # Get session count
            total_sessions = await conn.fetchval("SELECT COUNT(*) FROM scan_sessions")
            
            # Get host count
            total_hosts = await conn.fetchval("SELECT COUNT(*) FROM scan_hosts")
            
            # Get incident counts
            total_incidents = await conn.fetchval("SELECT COUNT(*) FROM security_incidents")
            critical_incidents = await conn.fetchval(
                "SELECT COUNT(*) FROM security_incidents WHERE severity = 'CRITICAL'"
            )
            
            # Get high risk hosts
            high_risk_hosts = await conn.fetchval(
                "SELECT COUNT(*) FROM scan_hosts WHERE risk_level IN ('HIGH', 'CRITICAL')"
            )
            
            # Get recent sessions
            recent_sessions_rows = await conn.fetch("""
                SELECT session_id, filename, created_at, total_hosts, high_risk_ports
                FROM scan_sessions 
                ORDER BY created_at DESC 
                LIMIT 5
            """)
            
            recent_sessions = [
                {
                    "session_id": row['session_id'],
                    "filename": row['filename'],
                    "created_at": row['created_at'].isoformat(),
                    "total_hosts": row['total_hosts'],
                    "high_risk_ports": row['high_risk_ports']
                }
                for row in recent_sessions_rows
            ]
            
            return DashboardStats(
                total_sessions=total_sessions or 0,
                total_hosts=total_hosts or 0,
                total_incidents=total_incidents or 0,
                critical_incidents=critical_incidents or 0,
                high_risk_hosts=high_risk_hosts or 0,
                recent_sessions=recent_sessions
            )
            
    except Exception as e:
        logger.error("Failed to get dashboard stats", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard statistics")

@app.post("/api/scan/upload")
async def upload_scan_results(
    file: UploadFile = File(...),
    notes: str = Form(""),
    user=Depends(get_current_user)
):
    """Upload and process Nmap XML scan results"""
    
    # Rate limiting
    client_ip = "demo_client"  # In production, get real client IP
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded. Maximum 10 uploads per hour."
        )
    
    # Validate file
    if not file.filename.endswith('.xml'):
        raise HTTPException(status_code=400, detail="Only XML files are supported")
    
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    try:
        # Read and validate file content
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        xml_content = content.decode('utf-8')
        file_hash = hashlib.sha256(content).hexdigest()
        
        # Check for duplicate uploads
        async with db_pool.acquire() as conn:
            existing = await conn.fetchval(
                "SELECT session_id FROM scan_sessions WHERE file_hash = $1", 
                file_hash
            )
            if existing:
                raise HTTPException(
                    status_code=409, 
                    detail=f"File already uploaded in session {existing}"
                )
        
        # Parse XML
        scan_data = parse_nmap_xml(xml_content)
        
        # Generate session ID
        session_id = f"scan-{uuid.uuid4().hex[:12]}"
        
        # Calculate statistics
        total_hosts = len(scan_data['hosts'])
        total_open_ports = sum(len(host['ports']) for host in scan_data['hosts'])
        
        # Store scan session
        async with db_pool.acquire() as conn:
            async with conn.transaction():
                # Insert scan session
                await conn.execute("""
                    INSERT INTO scan_sessions 
                    (session_id, filename, file_hash, total_hosts, total_open_ports, 
                     scan_command, notes, scan_start_time)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """, session_id, file.filename, file_hash, total_hosts, total_open_ports,
                    scan_data.get('scan_args'), notes, datetime.now())
                
                high_risk_count = 0
                
                # Process each host
                for host_data in scan_data['hosts']:
                    # Calculate risk score
                    risk_score, risk_level = calculate_host_risk_score(host_data['ports'])
                    
                    if risk_level in ['HIGH', 'CRITICAL']:
                        high_risk_count += 1
                    
                    # Insert host
                    host_id = await conn.fetchval("""
                        INSERT INTO scan_hosts 
                        (session_id, ip_address, hostname, mac_address, vendor, 
                         os_name, os_accuracy, risk_score, risk_level)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        RETURNING id
                    """, session_id, host_data['ip_address'], host_data.get('hostname'),
                        host_data.get('mac_address'), host_data.get('vendor'),
                        host_data.get('os_name'), host_data.get('os_accuracy'),
                        risk_score, risk_level)
                    
                    # Insert ports
                    for port_data in host_data['ports']:
                        # Check if port is high risk
                        is_high_risk = port_data['port_number'] in [22, 23, 21, 445, 3389, 135, 161, 1433, 3306, 5432]
                        
                        await conn.execute("""
                            INSERT INTO scan_ports 
                            (host_id, session_id, port_number, protocol, port_state, 
                             service_name, service_version, is_high_risk)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        """, host_id, session_id, port_data['port_number'], 
                            port_data['protocol'], port_data['port_state'],
                            port_data.get('service_name'), port_data.get('service_version'),
                            is_high_risk)
                
                # Update high risk port count
                await conn.execute(
                    "UPDATE scan_sessions SET high_risk_ports = $1 WHERE session_id = $2",
                    high_risk_count, session_id
                )
        
        logger.info("Scan results uploaded successfully", 
                   session_id=session_id, hosts=total_hosts, ports=total_open_ports)
        
        return {
            "message": "Scan results uploaded successfully",
            "session_id": session_id,
            "total_hosts": total_hosts,
            "total_open_ports": total_open_ports,
            "high_risk_hosts": high_risk_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to process scan upload", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to process scan results")

@app.get("/api/scan/sessions")
async def get_scan_sessions(user=Depends(get_current_user)):
    """Get all scan sessions"""
    try:
        async with db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM scan_sessions 
                ORDER BY created_at DESC
            """)
            
            return {
                "sessions": [
                    {
                        "id": row['id'],
                        "session_id": row['session_id'],
                        "created_at": row['created_at'].isoformat(),
                        "filename": row['filename'],
                        "total_hosts": row['total_hosts'],
                        "total_open_ports": row['total_open_ports'],
                        "high_risk_ports": row['high_risk_ports'],
                        "scan_command": row['scan_command'],
                        "notes": row['notes']
                    }
                    for row in rows
                ]
            }
            
    except Exception as e:
        logger.error("Failed to get scan sessions", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve scan sessions")

@app.get("/api/incidents")
async def get_incidents(user=Depends(get_current_user)):
    """Get security incidents"""
    try:
        async with db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM security_incidents 
                ORDER BY created_at DESC
            """)
            
            return {
                "incidents": [
                    {
                        "id": row['id'],
                        "created_at": row['created_at'].isoformat(),
                        "severity": row['severity'],
                        "incident_type": row['incident_type'],
                        "source_ip": row['source_ip'],
                        "description": row['description'],
                        "status": row['status'],
                        "session_id": row['session_id']
                    }
                    for row in rows
                ]
            }
            
    except Exception as e:
        logger.error("Failed to get incidents", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve incidents")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
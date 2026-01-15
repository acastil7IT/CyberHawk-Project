-- CyberHawk Defensive Security Analysis Platform Database Schema

-- Scan sessions for tracking uploaded scan results
CREATE TABLE scan_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    filename VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    scan_type VARCHAR(50) DEFAULT 'nmap_xml',
    total_hosts INTEGER DEFAULT 0,
    total_open_ports INTEGER DEFAULT 0,
    high_risk_ports INTEGER DEFAULT 0,
    scan_command TEXT,
    scan_args TEXT,
    scan_start_time TIMESTAMP,
    scan_end_time TIMESTAMP,
    notes TEXT
);

-- Discovered hosts from scan results
CREATE TABLE scan_hosts (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) REFERENCES scan_sessions(session_id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    hostname VARCHAR(255),
    mac_address VARCHAR(17),
    vendor VARCHAR(255),
    os_name VARCHAR(255),
    os_accuracy INTEGER,
    host_state VARCHAR(20) DEFAULT 'up',
    risk_score INTEGER DEFAULT 0,
    risk_level VARCHAR(10) DEFAULT 'LOW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Open ports discovered on hosts
CREATE TABLE scan_ports (
    id SERIAL PRIMARY KEY,
    host_id INTEGER REFERENCES scan_hosts(id) ON DELETE CASCADE,
    session_id VARCHAR(100) REFERENCES scan_sessions(session_id) ON DELETE CASCADE,
    port_number INTEGER NOT NULL,
    protocol VARCHAR(10) NOT NULL,
    port_state VARCHAR(20) DEFAULT 'open',
    service_name VARCHAR(100),
    service_version VARCHAR(255),
    service_product VARCHAR(255),
    is_high_risk BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk assessment rules for ports and services
CREATE TABLE risk_rules (
    id SERIAL PRIMARY KEY,
    port_number INTEGER,
    protocol VARCHAR(10),
    service_name VARCHAR(100),
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(10) NOT NULL,
    description TEXT,
    remediation_advice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Security incidents (simplified for defensive analysis)
CREATE TABLE security_incidents (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    incident_type VARCHAR(50),
    source_ip INET,
    description TEXT,
    status VARCHAR(20) DEFAULT 'OPEN',
    assigned_to VARCHAR(100),
    resolved_at TIMESTAMP,
    session_id VARCHAR(100) REFERENCES scan_sessions(session_id)
);

-- System alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES security_incidents(id),
    alert_type VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP
);

-- Network devices inventory
CREATE TABLE network_devices (
    id SERIAL PRIMARY KEY,
    ip_address INET UNIQUE NOT NULL,
    mac_address VARCHAR(17),
    hostname VARCHAR(255),
    device_type VARCHAR(50),
    vendor VARCHAR(255),
    os_fingerprint VARCHAR(100),
    open_ports TEXT[], -- Array of open ports
    services JSONB, -- Services running on open ports
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_discovered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT TRUE,
    risk_score INTEGER DEFAULT 0,
    device_info JSONB -- Additional device information
);

-- Create indexes for performance
CREATE INDEX idx_traffic_timestamp ON network_traffic(timestamp);
CREATE INDEX idx_traffic_source_ip ON network_traffic(source_ip);
CREATE INDEX idx_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_incidents_status ON security_incidents(status);
CREATE INDEX idx_devices_ip ON network_devices(ip_address);

-- Insert sample threat signatures
INSERT INTO threat_signatures (name, pattern, severity, description) VALUES
('Port Scan Detection', 'SYN_FLOOD', 'MEDIUM', 'Multiple SYN packets to different ports'),
('SQL Injection Attempt', 'UNION.*SELECT', 'HIGH', 'Potential SQL injection in HTTP payload'),
('Brute Force Login', 'FAILED_LOGIN_BURST', 'HIGH', 'Multiple failed login attempts'),
('Malware Communication', 'SUSPICIOUS_DNS', 'CRITICAL', 'Communication with known malware domains'),
('Data Exfiltration', 'LARGE_UPLOAD', 'HIGH', 'Unusually large data upload detected');
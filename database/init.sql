-- SecureNet Monitor Database Schema

-- Network traffic logs
CREATE TABLE network_traffic (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_ip INET NOT NULL,
    dest_ip INET NOT NULL,
    source_port INTEGER,
    dest_port INTEGER,
    protocol VARCHAR(10),
    packet_size INTEGER,
    flags VARCHAR(20),
    payload_hash VARCHAR(64)
);

-- Security incidents
CREATE TABLE security_incidents (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    incident_type VARCHAR(50),
    source_ip INET,
    description TEXT,
    status VARCHAR(20) DEFAULT 'OPEN',
    assigned_to VARCHAR(100),
    resolved_at TIMESTAMP
);

-- Threat signatures
CREATE TABLE threat_signatures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pattern TEXT NOT NULL,
    severity VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
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
    os_fingerprint VARCHAR(100),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_score INTEGER DEFAULT 0
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
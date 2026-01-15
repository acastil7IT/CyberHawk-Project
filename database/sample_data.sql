-- CyberHawk Sample Data for Defensive Security Analysis

-- Insert risk assessment rules for common ports
INSERT INTO risk_rules (port_number, protocol, service_name, risk_score, risk_level, description, remediation_advice) VALUES
(22, 'tcp', 'ssh', 7, 'HIGH', 'SSH service exposed - potential brute force target', 'Use key-based authentication, disable root login, change default port'),
(23, 'tcp', 'telnet', 9, 'CRITICAL', 'Unencrypted Telnet service - credentials sent in plaintext', 'Disable Telnet, use SSH instead'),
(21, 'tcp', 'ftp', 6, 'MEDIUM', 'FTP service - potential data exposure', 'Use SFTP/FTPS, disable anonymous access'),
(80, 'tcp', 'http', 4, 'MEDIUM', 'HTTP web service - potential web vulnerabilities', 'Implement HTTPS, regular security updates'),
(443, 'tcp', 'https', 2, 'LOW', 'HTTPS web service - encrypted but still requires monitoring', 'Keep SSL certificates updated, monitor for vulnerabilities'),
(445, 'tcp', 'microsoft-ds', 8, 'HIGH', 'SMB service - potential lateral movement vector', 'Disable if not needed, use SMB signing, latest patches'),
(3389, 'tcp', 'ms-wbt-server', 8, 'HIGH', 'RDP service - brute force and exploit target', 'Use VPN access, enable NLA, strong passwords'),
(135, 'tcp', 'msrpc', 6, 'MEDIUM', 'Microsoft RPC - potential privilege escalation', 'Firewall restrictions, latest Windows updates'),
(139, 'tcp', 'netbios-ssn', 5, 'MEDIUM', 'NetBIOS session service', 'Disable if not needed, firewall restrictions'),
(53, 'udp', 'domain', 3, 'LOW', 'DNS service', 'Secure DNS configuration, prevent DNS amplification'),
(161, 'udp', 'snmp', 7, 'HIGH', 'SNMP service - often uses default community strings', 'Use SNMPv3, change default community strings'),
(1433, 'tcp', 'ms-sql-s', 7, 'HIGH', 'Microsoft SQL Server', 'Strong authentication, encryption, firewall rules'),
(3306, 'tcp', 'mysql', 6, 'MEDIUM', 'MySQL database service', 'Strong passwords, bind to localhost only, encryption'),
(5432, 'tcp', 'postgresql', 6, 'MEDIUM', 'PostgreSQL database service', 'Strong authentication, SSL connections, access controls');

-- Sample scan session for demo
INSERT INTO scan_sessions (session_id, filename, file_hash, total_hosts, total_open_ports, high_risk_ports, scan_command, notes) VALUES
('demo-session-001', 'network_scan_demo.xml', 'abc123def456', 5, 23, 8, 'nmap -sS -sV -O 192.168.1.0/24', 'Demo scan session for portfolio showcase - simulated data only');

-- Sample discovered hosts
INSERT INTO scan_hosts (session_id, ip_address, hostname, mac_address, vendor, os_name, os_accuracy, risk_score, risk_level) VALUES
('demo-session-001', '192.168.1.1', 'router.local', '00:1B:44:11:3A:B7', 'Netgear Inc.', 'Linux 3.x', 95, 6, 'MEDIUM'),
('demo-session-001', '192.168.1.100', 'workstation-01', '00:50:56:C0:00:08', 'Dell Inc.', 'Microsoft Windows 10', 98, 8, 'HIGH'),
('demo-session-001', '192.168.1.150', 'server-01', '00:15:5D:FF:FF:FF', 'HP Enterprise', 'Linux 4.x', 92, 7, 'HIGH'),
('demo-session-001', '192.168.1.200', 'printer-hp', '00:26:37:12:34:56', 'HP Inc.', 'HP JetDirect', 85, 4, 'MEDIUM'),
('demo-session-001', '192.168.1.75', 'iot-camera', '8C:85:90:12:34:56', 'Hikvision', 'Embedded Linux', 78, 9, 'CRITICAL');

-- Sample open ports for the hosts
INSERT INTO scan_ports (host_id, session_id, port_number, protocol, port_state, service_name, service_version, is_high_risk) VALUES
-- Router (192.168.1.1)
(1, 'demo-session-001', 22, 'tcp', 'open', 'ssh', 'OpenSSH 7.4', true),
(1, 'demo-session-001', 53, 'udp', 'open', 'domain', 'dnsmasq 2.76', false),
(1, 'demo-session-001', 80, 'tcp', 'open', 'http', 'nginx 1.14.0', false),
(1, 'demo-session-001', 443, 'tcp', 'open', 'https', 'nginx 1.14.0', false),

-- Workstation (192.168.1.100) 
(2, 'demo-session-001', 135, 'tcp', 'open', 'msrpc', 'Microsoft Windows RPC', false),
(2, 'demo-session-001', 139, 'tcp', 'open', 'netbios-ssn', 'Microsoft Windows netbios-ssn', false),
(2, 'demo-session-001', 445, 'tcp', 'open', 'microsoft-ds', 'Windows 10 microsoft-ds', true),
(2, 'demo-session-001', 3389, 'tcp', 'open', 'ms-wbt-server', 'Microsoft Terminal Services', true),

-- Server (192.168.1.150)
(3, 'demo-session-001', 22, 'tcp', 'open', 'ssh', 'OpenSSH 8.2p1', true),
(3, 'demo-session-001', 80, 'tcp', 'open', 'http', 'Apache httpd 2.4.41', false),
(3, 'demo-session-001', 443, 'tcp', 'open', 'https', 'Apache httpd 2.4.41', false),
(3, 'demo-session-001', 3306, 'tcp', 'open', 'mysql', 'MySQL 8.0.25', true),

-- Printer (192.168.1.200)
(4, 'demo-session-001', 80, 'tcp', 'open', 'http', 'HP HTTP Server', false),
(4, 'demo-session-001', 161, 'udp', 'open', 'snmp', 'HP SNMP Agent', true),
(4, 'demo-session-001', 515, 'tcp', 'open', 'printer', 'HP JetDirect', false),

-- IoT Camera (192.168.1.75) - High risk device
(5, 'demo-session-001', 23, 'tcp', 'open', 'telnet', 'Linux telnetd', true),
(5, 'demo-session-001', 80, 'tcp', 'open', 'http', 'Hikvision Webserver', false),
(5, 'demo-session-001', 554, 'tcp', 'open', 'rtsp', 'RTSP/1.0', false),
(5, 'demo-session-001', 8000, 'tcp', 'open', 'http-alt', 'Hikvision IP Camera', true);

-- Sample security incidents based on scan results
INSERT INTO security_incidents (severity, incident_type, source_ip, description, status, session_id) VALUES
('CRITICAL', 'Insecure Service', '192.168.1.75', 'IoT camera with Telnet service enabled - credentials transmitted in plaintext', 'OPEN', 'demo-session-001'),
('HIGH', 'Exposed Database', '192.168.1.150', 'MySQL database service accessible from network', 'OPEN', 'demo-session-001'),
('HIGH', 'RDP Exposure', '192.168.1.100', 'Remote Desktop Protocol exposed to network - brute force risk', 'OPEN', 'demo-session-001'),
('MEDIUM', 'SNMP Default Config', '192.168.1.200', 'SNMP service detected - verify community string security', 'ACKNOWLEDGED', 'demo-session-001'),
('MEDIUM', 'SSH Exposure', '192.168.1.1', 'SSH service on router - ensure key-based authentication', 'RESOLVED', 'demo-session-001');
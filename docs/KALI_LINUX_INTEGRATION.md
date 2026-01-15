# CyberHawk Kali Linux Integration Guide

## Overview

CyberHawk is a **defensive security analysis platform** that ingests and analyzes network scan results. It does **NOT** perform live scanning or active reconnaissance. This guide explains how to use Kali Linux to generate authorized scan data for analysis in CyberHawk.

## ⚠️ Legal and Ethical Requirements

**CRITICAL: Only scan networks you own or are explicitly authorized to test.**

- Obtain written permission before scanning any network
- Comply with all applicable laws and regulations
- Follow responsible disclosure practices
- Document authorization and scope clearly
- Respect network owners' policies and procedures

## Kali Linux Setup

### Prerequisites

1. **Kali Linux VM or Physical System**
   - Download from: https://www.kali.org/get-kali/
   - Minimum 2GB RAM, 20GB storage
   - Network access to target environment

2. **Required Tools** (pre-installed in Kali)
   - Nmap (network scanner)
   - Masscan (high-speed port scanner)
   - Zmap (internet-wide scanner)

3. **Network Access**
   - Authorized access to target network
   - Appropriate network positioning
   - Firewall/IDS considerations

## Supported Scan Types

CyberHawk currently supports **Nmap XML output** for the following scan types:

### 1. Host Discovery Scans

```bash
# Basic host discovery
nmap -sn -oX host_discovery.xml 192.168.1.0/24

# Host discovery with OS detection
nmap -sn -O -oX host_discovery_os.xml 10.0.0.0/16

# ARP scan for local network
nmap -PR -sn -oX arp_scan.xml 192.168.1.0/24
```

### 2. Port Scanning

```bash
# TCP SYN scan (stealth)
nmap -sS -p- -oX tcp_syn_scan.xml 192.168.1.100

# TCP connect scan (more reliable)
nmap -sT -p 1-65535 -oX tcp_connect_scan.xml target.example.com

# UDP scan (top ports)
nmap -sU --top-ports 1000 -oX udp_scan.xml 192.168.1.0/24

# Combined TCP/UDP scan
nmap -sS -sU -p T:1-65535,U:53,67,68,123,135,137,138,139,161,162,445,500,514,520,631,1434,1900,4500,49152 -oX combined_scan.xml 192.168.1.100
```

### 3. Service Detection

```bash
# Service version detection
nmap -sV -oX service_detection.xml 192.168.1.100

# Service detection with scripts
nmap -sV -sC -oX service_scripts.xml 192.168.1.100

# Aggressive service detection
nmap -sV --version-intensity 9 -oX aggressive_service.xml 192.168.1.100
```

### 4. OS Detection

```bash
# OS fingerprinting
nmap -O -oX os_detection.xml 192.168.1.100

# OS detection with version scanning
nmap -O -sV -oX os_version_scan.xml 192.168.1.100

# Aggressive OS detection
nmap -O --osscan-guess -oX aggressive_os.xml 192.168.1.100
```

### 5. Comprehensive Scans

```bash
# Full comprehensive scan
nmap -sS -sV -O -sC -p- -oX comprehensive_scan.xml 192.168.1.100

# Network-wide comprehensive scan
nmap -sS -sV -O -p 1-1000 -oX network_comprehensive.xml 192.168.1.0/24

# Vulnerability detection scan
nmap -sV --script vuln -oX vulnerability_scan.xml 192.168.1.100
```

## Scan Best Practices

### Timing and Performance

```bash
# Slow and stealthy (avoid detection)
nmap -T1 -sS -p 80,443,22,21,25,53,110,143,993,995 -oX stealth_scan.xml target

# Normal timing (balanced)
nmap -T3 -sS -sV -p- -oX normal_scan.xml target

# Fast scan (aggressive timing)
nmap -T4 -sS -sV --top-ports 1000 -oX fast_scan.xml target

# Very fast (may miss results)
nmap -T5 -sS --top-ports 100 -oX very_fast_scan.xml target
```

### Evasion Techniques

```bash
# Fragment packets
nmap -f -sS -oX fragmented_scan.xml target

# Decoy scanning
nmap -D RND:10 -sS -oX decoy_scan.xml target

# Source port spoofing
nmap --source-port 53 -sS -oX source_port_scan.xml target

# Randomize host order
nmap --randomize-hosts -sS -oX randomized_scan.xml 192.168.1.0/24
```

## Example Scanning Workflows

### 1. Internal Network Assessment

```bash
#!/bin/bash
# Internal network comprehensive assessment

NETWORK="192.168.1.0/24"
OUTPUT_DIR="./scans/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "Starting internal network assessment..."

# Phase 1: Host discovery
echo "Phase 1: Host Discovery"
nmap -sn -oX "$OUTPUT_DIR/01_host_discovery.xml" "$NETWORK"

# Phase 2: Port scanning
echo "Phase 2: Port Scanning"
nmap -sS --top-ports 1000 -oX "$OUTPUT_DIR/02_port_scan.xml" "$NETWORK"

# Phase 3: Service detection
echo "Phase 3: Service Detection"
nmap -sV -sC -oX "$OUTPUT_DIR/03_service_detection.xml" "$NETWORK"

# Phase 4: OS detection
echo "Phase 4: OS Detection"
nmap -O -oX "$OUTPUT_DIR/04_os_detection.xml" "$NETWORK"

# Phase 5: Vulnerability scanning
echo "Phase 5: Vulnerability Scanning"
nmap -sV --script vuln -oX "$OUTPUT_DIR/05_vulnerability_scan.xml" "$NETWORK"

echo "Assessment complete. Upload XML files to CyberHawk for analysis."
```

### 2. Single Host Deep Scan

```bash
#!/bin/bash
# Deep scan of a single host

TARGET="$1"
if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target_ip_or_hostname>"
    exit 1
fi

OUTPUT_DIR="./scans/host_$(echo $TARGET | tr '.' '_')_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "Starting deep scan of $TARGET..."

# Comprehensive scan
nmap -sS -sV -O -sC -p- --script vuln \
     -oX "$OUTPUT_DIR/deep_scan_$TARGET.xml" \
     "$TARGET"

echo "Deep scan complete. Upload $OUTPUT_DIR/deep_scan_$TARGET.xml to CyberHawk."
```

### 3. Scheduled Monitoring Scan

```bash
#!/bin/bash
# Scheduled monitoring scan for change detection

NETWORK="192.168.1.0/24"
OUTPUT_DIR="./monitoring/$(date +%Y%m%d)"
mkdir -p "$OUTPUT_DIR"

# Quick monitoring scan
nmap -sS -sV --top-ports 100 \
     -oX "$OUTPUT_DIR/monitoring_$(date +%H%M%S).xml" \
     "$NETWORK"

# Upload to CyberHawk for trend analysis
echo "Monitoring scan complete. Upload to CyberHawk for comparison with previous scans."
```

## XML Output Validation

Before uploading to CyberHawk, validate your XML files:

```bash
# Check XML syntax
xmllint --noout scan_results.xml

# Verify Nmap XML structure
grep -q "<nmaprun" scan_results.xml && echo "Valid Nmap XML" || echo "Invalid XML"

# Check for hosts found
grep -c "<host>" scan_results.xml
```

## Security Considerations

### Network Impact

- **Bandwidth Usage**: Large scans can consume significant bandwidth
- **System Load**: Intensive scans may impact target system performance
- **Detection Risk**: Scans may trigger security alerts and monitoring systems
- **Service Disruption**: Aggressive scans could potentially disrupt services

### Scan Timing

- **Business Hours**: Avoid scanning during critical business operations
- **Maintenance Windows**: Schedule intensive scans during maintenance periods
- **Rate Limiting**: Use appropriate timing templates (-T0 to -T5)
- **Parallel Limits**: Control concurrent scan processes

### Data Protection

- **Secure Storage**: Encrypt scan results containing sensitive network information
- **Access Control**: Limit access to scan data and results
- **Data Retention**: Establish policies for scan data retention and disposal
- **Transport Security**: Use secure methods to transfer scan files

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Run with sudo for raw socket access
   sudo nmap -sS -oX scan.xml target
   ```

2. **No Results Found**
   ```bash
   # Check connectivity first
   ping target
   # Try TCP connect scan instead of SYN
   nmap -sT -oX scan.xml target
   ```

3. **Firewall Blocking**
   ```bash
   # Try different scan techniques
   nmap -sA -oX ack_scan.xml target  # ACK scan
   nmap -sF -oX fin_scan.xml target  # FIN scan
   ```

4. **Large Network Timeouts**
   ```bash
   # Increase timeouts and reduce parallelism
   nmap --host-timeout 300s --max-parallelism 10 -oX scan.xml network
   ```

### XML File Issues

- **Empty Files**: Check scan completed successfully
- **Corrupted XML**: Verify file integrity and re-run scan
- **Large Files**: Split large networks into smaller subnets
- **Encoding Issues**: Ensure UTF-8 encoding

## Integration with CyberHawk

### Upload Process

1. **Generate XML**: Use Nmap with `-oX` flag
2. **Validate File**: Check XML syntax and content
3. **Access CyberHawk**: Navigate to Scan Upload section
4. **Upload File**: Drag and drop or select XML file
5. **Add Notes**: Include scan context and authorization details
6. **Analyze Results**: Review discovered hosts, ports, and risk assessments

### Supported Data Elements

CyberHawk extracts the following from Nmap XML:

- **Host Information**: IP addresses, hostnames, MAC addresses
- **Operating Systems**: OS detection results and accuracy
- **Open Ports**: Port numbers, protocols, states
- **Services**: Service names, versions, products
- **Vendor Information**: Hardware vendor identification
- **Scan Metadata**: Scan arguments, timing, version

### Risk Assessment

CyberHawk automatically calculates risk scores based on:

- **High-Risk Ports**: SSH (22), Telnet (23), RDP (3389), SMB (445)
- **Database Services**: MySQL (3306), PostgreSQL (5432), MSSQL (1433)
- **Management Protocols**: SNMP (161), WMI (135)
- **Service Versions**: Known vulnerable versions
- **Port Exposure**: Number and types of open ports

## Compliance and Documentation

### Scan Documentation

Maintain records of:

- **Authorization**: Written permission and scope
- **Scan Details**: Commands used, timing, source systems
- **Results**: Findings, risk levels, recommendations
- **Remediation**: Actions taken based on findings

### Reporting

CyberHawk provides:

- **Executive Summaries**: High-level risk overview
- **Technical Details**: Port-by-port analysis
- **Trend Analysis**: Changes over time
- **Compliance Mapping**: Alignment with security frameworks

## Support and Resources

### Documentation
- [Nmap Official Documentation](https://nmap.org/docs.html)
- [Kali Linux Documentation](https://www.kali.org/docs/)
- [CyberHawk User Guide](./USER_GUIDE.md)

### Community Resources
- [Nmap Scripting Engine](https://nmap.org/nsedoc/)
- [Kali Linux Forums](https://forums.kali.org/)
- [Security Testing Methodologies](https://owasp.org/www-project-web-security-testing-guide/)

---

**Remember**: CyberHawk is a defensive analysis platform. All scanning must be performed on authorized networks only. The platform analyzes scan results but does not perform any active scanning or reconnaissance activities.
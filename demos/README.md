# CyberHawk Attack Simulation Demos

This folder contains essential simulation scripts for testing CyberHawk's security monitoring capabilities.

## 🎯 Available Simulations

### 1. **comprehensive_attack_demo.py** (Main Demo)
**The primary attack simulation script** - includes all major attack types:
- API brute force attacks
- Port scanning simulation
- Web vulnerability testing
- Network reconnaissance
- DoS attack simulation

**Usage:**
```bash
python3 demos/comprehensive_attack_demo.py
```

### 2. **traffic_injector.py**
Generates realistic network traffic patterns for testing traffic analysis.

**Usage:**
```bash
python3 demos/traffic_injector.py
```

### 3. **device_discovery_demo.py**
Tests network device discovery and asset identification capabilities.

**Usage:**
```bash
python3 demos/device_discovery_demo.py
```

### 4. **clear_mock_incidents.py**
Utility script to clean up test data and reset the system.

**Usage:**
```bash
python3 demos/clear_mock_incidents.py
```

## 🚀 Quick Start

For a complete security demonstration, run:
```bash
python3 demos/comprehensive_attack_demo.py
```

Then monitor the results in:
- **Live Threats** section for real-time alerts
- **Network Monitor** for traffic analysis
- **Command Center** for overall system status

## ⚠️ Important Notes

- Only use these scripts on systems you own or have permission to test
- All simulations are designed for demonstration purposes
- Scripts generate realistic but safe attack patterns
- Results are logged in the CyberHawk monitoring system

## 🔧 Requirements

- Python 3.7+
- CyberHawk platform running (docker compose up -d)
- Network access to localhost services
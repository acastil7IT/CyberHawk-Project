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
- Results work with both local Docker deployment and cloud deployment

## 🔧 Requirements

- Python 3.7+
- No external dependencies required
- Works with standalone frontend or full Docker deployment
#!/usr/bin/env python3
"""
Clear Mock Incidents Script
Removes pre-populated mock incidents to show only real attack simulation results
"""

import subprocess
import sys

def clear_mock_incidents():
    """Clear mock incidents from database"""
    print("🗑️  Clearing Mock Incidents from CyberHawk Database")
    print("=" * 60)
    
    try:
        # SQL to clear mock incidents but keep real attack incidents
        sql_commands = """
-- Clear alerts first (foreign key constraint)
DELETE FROM alerts WHERE incident_id IN (
    SELECT id FROM security_incidents WHERE 
        source_ip IN ('10.0.0.25', '10.0.0.75', '172.16.0.20', '192.168.1.107') OR
        description LIKE '%Unusual traffic pattern detected during off-hours%' OR
        description LIKE '%Access to Windows RPC port%' OR
        description LIKE '%Anomalous network behavior detected%' OR
        (incident_type = 'BRUTE_FORCE_ATTEMPT' AND source_ip = '172.16.0.20') OR
        (incident_type = 'SUSPICIOUS_PORT_ACCESS' AND source_ip = '10.0.0.75') OR
        (incident_type = 'UNUSUAL_TRAFFIC' AND source_ip = '10.0.0.25') OR
        (incident_type = 'NETWORK_ANOMALY' AND source_ip = '192.168.1.107')
);

-- Clear old mock incidents (keep only real attack incidents)
DELETE FROM security_incidents WHERE 
    source_ip IN ('10.0.0.25', '10.0.0.75', '172.16.0.20', '192.168.1.107') OR
    description LIKE '%Unusual traffic pattern detected during off-hours%' OR
    description LIKE '%Access to Windows RPC port%' OR
    description LIKE '%Anomalous network behavior detected%' OR
    (incident_type = 'BRUTE_FORCE_ATTEMPT' AND source_ip = '172.16.0.20') OR
    (incident_type = 'SUSPICIOUS_PORT_ACCESS' AND source_ip = '10.0.0.75') OR
    (incident_type = 'UNUSUAL_TRAFFIC' AND source_ip = '10.0.0.25') OR
    (incident_type = 'NETWORK_ANOMALY' AND source_ip = '192.168.1.107');

-- Clear corresponding mock network traffic
DELETE FROM network_traffic WHERE 
    source_ip IN ('10.0.0.25', '10.0.0.75', '172.16.0.20', '192.168.1.107');

-- Show remaining incidents
SELECT COUNT(*) as remaining_incidents FROM security_incidents;
"""
        
        result = subprocess.run([
            "docker", "exec", "-i", "kironetworkproject-postgres-1",
            "psql", "-U", "admin", "-d", "securenet", "-c", sql_commands
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Mock incidents cleared successfully!")
            print("📊 Database now ready for real attack simulation results")
            print("\n" + result.stdout)
            return True
        else:
            print(f"❌ Failed to clear mock incidents: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Database operation timed out")
        return False
    except Exception as e:
        print(f"❌ Error clearing mock incidents: {e}")
        return False

def main():
    """Main function"""
    print("🚨 CyberHawk Mock Data Cleanup")
    print("=" * 60)
    print("This script will remove pre-populated mock incidents")
    print("so you can see only real attack simulation results.")
    print("=" * 60)
    
    response = input("\nProceed with cleanup? (y/N): ").lower().strip()
    
    if response == 'y' or response == 'yes':
        success = clear_mock_incidents()
        
        if success:
            print("\n✅ Cleanup Complete!")
            print("🎯 Now run: python3 comprehensive_attack_demo.py")
            print("📊 The Operations Center will show only real attack incidents")
        else:
            print("\n❌ Cleanup Failed!")
            sys.exit(1)
    else:
        print("\n⏹️  Cleanup cancelled")

if __name__ == "__main__":
    main()
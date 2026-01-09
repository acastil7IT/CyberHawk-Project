#!/usr/bin/env python3
"""
SecureNet Real Attack Generator
Generates actual network traffic that triggers threat detection
"""

import socket
import threading
import time
import random
import subprocess
import requests
from datetime import datetime

class RealAttackGenerator:
    def __init__(self):
        self.target_host = "localhost"
        self.attack_results = []
        
    def port_scan_attack(self, target_ports=None):
        """Generate real port scanning traffic"""
        if target_ports is None:
            target_ports = [22, 23, 80, 135, 443, 445, 1433, 3389, 5432, 8001]
            
        print(f"🔍 Starting REAL Port Scan Attack on {self.target_host}")
        print(f"🎯 Target Ports: {target_ports}")
        print("=" * 60)
        
        open_ports = []
        closed_ports = []
        
        for port in target_ports:
            try:
                print(f"📡 Scanning port {port}... ", end="", flush=True)
                
                # Create actual network connection
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)  # 1 second timeout
                
                result = sock.connect_ex((self.target_host, port))
                
                if result == 0:
                    print("🟢 OPEN")
                    open_ports.append(port)
                else:
                    print("🔴 CLOSED")
                    closed_ports.append(port)
                    
                sock.close()
                time.sleep(0.2)  # Small delay between scans
                
            except Exception as e:
                print(f"❌ ERROR: {e}")
                closed_ports.append(port)
        
        print("\n📊 Scan Results:")
        print(f"   🟢 Open Ports: {open_ports}")
        print(f"   🔴 Closed Ports: {closed_ports}")
        
        return {
            "attack_type": "PORT_SCAN",
            "open_ports": open_ports,
            "closed_ports": closed_ports,
            "total_scanned": len(target_ports)
        }
    
    def brute_force_attack(self, target_port=8001, attempts=15):
        """Generate real brute force attack against API endpoints"""
        print(f"\n🔐 Starting REAL Brute Force Attack")
        print(f"🎯 Target: {self.target_host}:{target_port}")
        print(f"🔢 Attempts: {attempts}")
        print("=" * 60)
        
        # Common credentials for brute force
        credentials = [
            ("admin", "admin"), ("admin", "password"), ("admin", "123456"),
            ("root", "root"), ("root", "password"), ("root", "toor"),
            ("user", "user"), ("user", "password"), ("user", "123456"),
            ("administrator", "administrator"), ("administrator", "password"),
            ("test", "test"), ("guest", "guest"), ("demo", "demo"),
            ("security", "security"), ("analyst", "analyst")
        ]
        
        failed_attempts = 0
        successful_attempts = 0
        
        # Target multiple endpoints that require authentication
        endpoints = [
            "/api/dashboard/stats",
            "/api/incidents", 
            "/api/traffic",
            "/api/alerts/live",
            "/admin",
            "/login"
        ]
        
        for i in range(attempts):
            username, password = random.choice(credentials)
            endpoint = random.choice(endpoints)
            
            try:
                print(f"🔑 Attempt {i+1}: {username}:{password} -> {endpoint} ... ", end="", flush=True)
                
                # Try different attack methods
                if endpoint.startswith("/api/"):
                    # API endpoint with Bearer token attempt
                    headers = {"Authorization": f"Bearer {password}"}
                    response = requests.get(
                        f"http://{self.target_host}:{target_port}{endpoint}",
                        headers=headers,
                        timeout=2
                    )
                else:
                    # Basic auth attempt
                    response = requests.get(
                        f"http://{self.target_host}:{target_port}{endpoint}",
                        auth=(username, password),
                        timeout=2
                    )
                
                if response.status_code == 401 or response.status_code == 403:
                    print("❌ FAILED (Unauthorized)")
                    failed_attempts += 1
                elif response.status_code == 404:
                    print("❌ FAILED (Not Found)")
                    failed_attempts += 1
                elif response.status_code == 200:
                    print("⚠️  SUCCESS (Potential breach!)")
                    successful_attempts += 1
                else:
                    print(f"❓ UNKNOWN ({response.status_code})")
                    failed_attempts += 1
                    
            except requests.exceptions.RequestException as e:
                print("❌ FAILED (Connection error)")
                failed_attempts += 1
            
            time.sleep(random.uniform(0.3, 0.8))  # Variable delay to simulate human behavior
        
        print(f"\n📊 Brute Force Results:")
        print(f"   ❌ Failed Attempts: {failed_attempts}")
        print(f"   ✅ Successful Attempts: {successful_attempts}")
        print(f"   📈 Success Rate: {(successful_attempts / attempts) * 100:.1f}%")
        
        # This attack pattern should trigger threat detection
        if failed_attempts >= 10:
            print("🚨 THREAT PATTERN: Multiple failed authentication attempts detected!")
        
        return {
            "attack_type": "BRUTE_FORCE",
            "failed_attempts": failed_attempts,
            "successful_attempts": successful_attempts,
            "target_port": target_port,
            "endpoints_targeted": len(endpoints)
        }
    
    def dos_attack(self, target_port=8001, duration=15):
        """Generate Denial of Service attack traffic against API endpoints"""
        print(f"\n💥 Starting REAL DoS Attack")
        print(f"🎯 Target: {self.target_host}:{target_port}")
        print(f"⏱️  Duration: {duration} seconds")
        print("=" * 60)
        
        start_time = time.time()
        request_count = 0
        error_count = 0
        
        # Target multiple endpoints to overwhelm the server
        endpoints = [
            "/health",
            "/api/dashboard/stats", 
            "/api/incidents",
            "/api/traffic",
            "/api/alerts/live",
            "/api/network/devices"
        ]
        
        def send_flood_requests():
            nonlocal request_count, error_count
            while time.time() - start_time < duration:
                try:
                    endpoint = random.choice(endpoints)
                    
                    # Send requests with invalid/malformed data to stress the server
                    headers = {
                        "Authorization": "Bearer invalid_token_" + str(random.randint(1000, 9999)),
                        "User-Agent": "AttackBot/1.0",
                        "X-Forwarded-For": f"192.168.{random.randint(1,254)}.{random.randint(1,254)}"
                    }
                    
                    response = requests.get(
                        f"http://{self.target_host}:{target_port}{endpoint}",
                        headers=headers,
                        timeout=1
                    )
                    request_count += 1
                    
                    if request_count % 25 == 0:
                        print(f"📡 Sent {request_count} requests... (Status: {response.status_code})")
                        
                except requests.exceptions.RequestException:
                    error_count += 1
                except Exception:
                    error_count += 1
                
                # No delay - flood as fast as possible
        
        # Launch multiple threads for concurrent flood
        threads = []
        thread_count = 8  # More aggressive than before
        
        print(f"🚀 Launching {thread_count} attack threads...")
        
        for i in range(thread_count):
            thread = threading.Thread(target=send_flood_requests)
            thread.start()
            threads.append(thread)
        
        # Monitor progress
        while time.time() - start_time < duration:
            time.sleep(2)
            elapsed = time.time() - start_time
            current_rps = request_count / elapsed if elapsed > 0 else 0
            print(f"⚡ Attack Progress: {elapsed:.1f}s | {request_count} requests | {current_rps:.1f} RPS")
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        actual_duration = time.time() - start_time
        rps = request_count / actual_duration if actual_duration > 0 else 0
        
        print(f"\n📊 DoS Attack Results:")
        print(f"   📡 Total Requests: {request_count}")
        print(f"   ❌ Failed Requests: {error_count}")
        print(f"   ⏱️  Actual Duration: {actual_duration:.1f}s")
        print(f"   📈 Requests/Second: {rps:.1f}")
        print(f"   🎯 Endpoints Targeted: {len(endpoints)}")
        
        # This should definitely trigger DoS detection
        if rps > 50:
            print("🚨 HIGH TRAFFIC PATTERN: DoS attack signature detected!")
        
        return {
            "attack_type": "DOS_ATTACK",
            "total_requests": request_count,
            "error_requests": error_count,
            "duration": actual_duration,
            "rps": rps,
            "endpoints_hit": len(endpoints)
        }
    
    def vulnerability_scan(self):
        """Scan for common vulnerabilities and test vulnerable endpoints"""
        print(f"\n🔍 Starting REAL Vulnerability Scan")
        print("=" * 60)
        
        # Test both API endpoints and vulnerable test app
        test_targets = [
            # API Gateway endpoints
            {"url": f"http://{self.target_host}:8001", "paths": [
                "/admin", "/login", "/api/users", "/config", "/backup", 
                "/.env", "/database", "/phpmyadmin", "/wp-admin", 
                "/api/v1/users", "/swagger", "/docs", "/debug"
            ]},
            # Vulnerable test application (if running)
            {"url": f"http://{self.target_host}:8080", "paths": [
                "/", "/admin.php", "/login.php", "/config.php",
                "/?id=1'", "/?name=<script>alert('xss')</script>",
                "/?file=../../../etc/passwd", "/backup/", "/uploads/"
            ]}
        ]
        
        found_endpoints = []
        vulnerabilities = []
        
        for target in test_targets:
            base_url = target["url"]
            paths = target["paths"]
            
            print(f"\n🎯 Scanning {base_url}...")
            
            for path in paths:
                try:
                    print(f"🔍 Testing {path}... ", end="", flush=True)
                    
                    response = requests.get(
                        f"{base_url}{path}",
                        timeout=3,
                        allow_redirects=False
                    )
                    
                    if response.status_code == 200:
                        print(f"🟢 FOUND ({response.status_code})")
                        found_endpoints.append((base_url, path, response.status_code))
                        
                        # Check for specific vulnerability indicators
                        content = response.text.lower()
                        if "sql" in content and "error" in content:
                            vulnerabilities.append(f"SQL Error in {path}")
                        if "script" in content and "alert" in content:
                            vulnerabilities.append(f"XSS Vulnerability in {path}")
                        if "root:" in content or "/etc/passwd" in content:
                            vulnerabilities.append(f"Directory Traversal in {path}")
                            
                    elif response.status_code == 403:
                        print(f"🟡 FORBIDDEN ({response.status_code})")
                        found_endpoints.append((base_url, path, response.status_code))
                    elif response.status_code == 401:
                        print(f"🟡 AUTH REQUIRED ({response.status_code})")
                        found_endpoints.append((base_url, path, response.status_code))
                    elif response.status_code == 500:
                        print(f"🔴 SERVER ERROR ({response.status_code})")
                        found_endpoints.append((base_url, path, response.status_code))
                        vulnerabilities.append(f"Server Error in {path} - Potential vulnerability")
                    else:
                        print("🔴 NOT FOUND")
                        
                except requests.exceptions.RequestException:
                    print("❌ ERROR")
                
                time.sleep(0.2)  # Small delay between requests
        
        print(f"\n📊 Vulnerability Scan Results:")
        if found_endpoints:
            print("   🟡 Found Endpoints:")
            for base_url, path, status in found_endpoints:
                print(f"      {base_url}{path} (HTTP {status})")
        else:
            print("   🟢 No obvious endpoints found")
            
        if vulnerabilities:
            print("   🚨 Potential Vulnerabilities:")
            for vuln in vulnerabilities:
                print(f"      ⚠️  {vuln}")
        else:
            print("   🛡️  No obvious vulnerabilities detected")
        
        return {
            "attack_type": "VULN_SCAN",
            "found_endpoints": found_endpoints,
            "vulnerabilities": vulnerabilities,
            "targets_scanned": len(test_targets)
        }

def main():
    """Main attack simulation"""
    print("🚨 SecureNet REAL Attack Generator")
    print("=" * 80)
    print("⚠️  WARNING: This generates actual network traffic!")
    print("   Only use in controlled environments for testing.")
    print("=" * 80)
    print()
    
    generator = RealAttackGenerator()
    
    print("🎬 Starting Real Attack Sequence...")
    print("📊 Monitor your dashboard at: http://localhost:3000")
    print()
    
    # Execute attacks in sequence
    results = []
    
    try:
        # 1. Port Scan
        result1 = generator.port_scan_attack()
        results.append(result1)
        time.sleep(2)
        
        # 2. Brute Force
        result2 = generator.brute_force_attack(attempts=15)
        results.append(result2)
        time.sleep(2)
        
        # 3. Vulnerability Scan
        result3 = generator.vulnerability_scan()
        results.append(result3)
        time.sleep(2)
        
        # 4. DoS Attack (short duration)
        result4 = generator.dos_attack(duration=5)
        results.append(result4)
        
    except KeyboardInterrupt:
        print("\n⚠️  Attack sequence interrupted by user")
    
    print("\n" + "=" * 80)
    print("✅ REAL ATTACK SEQUENCE COMPLETE!")
    print("=" * 80)
    print()
    print("📊 Attack Summary:")
    for i, result in enumerate(results, 1):
        print(f"   {i}. {result['attack_type']}: Executed")
    
    print()
    print("🔍 Next Steps:")
    print("   1. Check your SecureNet Dashboard for new incidents")
    print("   2. Look for traffic from your local IP in Network Traffic")
    print("   3. Monitor Live Alerts for real-time detections")
    print("   4. Practice incident response on the detected threats")
    print()
    print("🛡️  Your platform should now show REAL attack data!")

if __name__ == "__main__":
    main()
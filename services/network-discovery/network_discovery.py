#!/usr/bin/env python3
"""
Network Discovery Service
Continuously scans the local network to discover and monitor devices
"""

import asyncio
import asyncpg
import json
import logging
import nmap
import netifaces
import os
import re
import subprocess
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class NetworkDiscovery:
    def __init__(self):
        self.db_pool = None
        self.nm = nmap.PortScanner()
        self.scan_interval = 300  # 5 minutes
        self.quick_scan_interval = 60  # 1 minute for online status
        
    async def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            db_url = os.getenv('DATABASE_URL', 'postgresql://admin:secure123@postgres:5432/securenet')
            self.db_pool = await asyncpg.create_pool(db_url, min_size=2, max_size=10)
            logger.info("Connected to database")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def get_local_networks(self) -> List[str]:
        """Get local network ranges to scan"""
        networks = []
        try:
            # Get all network interfaces
            interfaces = netifaces.interfaces()
            
            for interface in interfaces:
                addrs = netifaces.ifaddresses(interface)
                
                # Check for IPv4 addresses
                if netifaces.AF_INET in addrs:
                    for addr_info in addrs[netifaces.AF_INET]:
                        ip = addr_info.get('addr')
                        netmask = addr_info.get('netmask')
                        
                        if ip and netmask and not ip.startswith('127.'):
                            # Calculate network range
                            network = self.calculate_network(ip, netmask)
                            if network:
                                networks.append(network)
                                
        except Exception as e:
            logger.error(f"Error getting local networks: {e}")
            # Fallback to common ranges
            networks = ['192.168.1.0/24', '192.168.0.0/24', '10.0.0.0/24']
            
        logger.info(f"Scanning networks: {networks}")
        return networks

    def calculate_network(self, ip: str, netmask: str) -> Optional[str]:
        """Calculate network range from IP and netmask"""
        try:
            import ipaddress
            network = ipaddress.IPv4Network(f"{ip}/{netmask}", strict=False)
            return str(network)
        except Exception:
            return None

    async def discover_devices(self, network: str) -> List[Dict]:
        """Discover devices on the network using nmap"""
        devices = []
        
        try:
            logger.info(f"Scanning network: {network}")
            
            # Quick host discovery scan
            self.nm.scan(hosts=network, arguments='-sn -T4')
            
            for host in self.nm.all_hosts():
                if self.nm[host].state() == 'up':
                    device_info = await self.get_device_details(host)
                    if device_info:
                        devices.append(device_info)
                        
        except Exception as e:
            logger.error(f"Error scanning network {network}: {e}")
            
        return devices

    async def get_device_details(self, ip: str) -> Optional[Dict]:
        """Get detailed information about a device"""
        try:
            device_info = {
                'ip_address': ip,
                'hostname': None,
                'mac_address': None,
                'vendor': None,
                'os_fingerprint': None,
                'open_ports': [],
                'services': {},
                'device_type': 'Unknown',
                'is_online': True,
                'last_seen': datetime.now()
            }
            
            # Get hostname
            try:
                if 'hostnames' in self.nm[ip] and self.nm[ip]['hostnames']:
                    device_info['hostname'] = self.nm[ip]['hostnames'][0]['name']
            except:
                pass
                
            # Get MAC address and vendor
            try:
                if 'addresses' in self.nm[ip]:
                    if 'mac' in self.nm[ip]['addresses']:
                        device_info['mac_address'] = self.nm[ip]['addresses']['mac']
                        device_info['vendor'] = self.nm[ip]['vendor'].get(device_info['mac_address'], 'Unknown')
            except:
                pass
            
            # Perform detailed port scan on interesting devices
            if await self.should_detailed_scan(ip):
                await self.detailed_port_scan(ip, device_info)
                
            # Determine device type
            device_info['device_type'] = self.classify_device(device_info)
            
            return device_info
            
        except Exception as e:
            logger.error(f"Error getting device details for {ip}: {e}")
            return None

    async def should_detailed_scan(self, ip: str) -> bool:
        """Determine if we should do a detailed scan of this device"""
        # Skip detailed scan for some IPs to avoid being too intrusive
        skip_patterns = [
            r'^169\.254\.',  # Link-local
            r'^224\.',       # Multicast
        ]
        
        for pattern in skip_patterns:
            if re.match(pattern, ip):
                return False
                
        return True

    async def detailed_port_scan(self, ip: str, device_info: Dict):
        """Perform detailed port scan on a device"""
        try:
            # Scan common ports
            common_ports = '22,23,25,53,80,110,143,443,993,995,8080,8443'
            
            self.nm.scan(ip, common_ports, arguments='-sV -O --version-intensity 3')
            
            if ip in self.nm:
                host_info = self.nm[ip]
                
                # Get OS fingerprint
                if 'osmatch' in host_info and host_info['osmatch']:
                    device_info['os_fingerprint'] = host_info['osmatch'][0]['name']
                
                # Get open ports and services
                if 'tcp' in host_info:
                    for port, port_info in host_info['tcp'].items():
                        if port_info['state'] == 'open':
                            device_info['open_ports'].append(str(port))
                            
                            service_info = {
                                'port': port,
                                'service': port_info.get('name', 'unknown'),
                                'version': port_info.get('version', ''),
                                'product': port_info.get('product', ''),
                                'extrainfo': port_info.get('extrainfo', '')
                            }
                            device_info['services'][str(port)] = service_info
                            
        except Exception as e:
            logger.error(f"Error in detailed scan for {ip}: {e}")

    def classify_device(self, device_info: Dict) -> str:
        """Classify device type based on available information"""
        hostname = (device_info.get('hostname') or '').lower()
        vendor = (device_info.get('vendor') or '').lower()
        os_info = (device_info.get('os_fingerprint') or '').lower()
        open_ports = device_info.get('open_ports', [])
        
        # Router/Gateway detection
        if any(port in open_ports for port in ['80', '443', '8080']) and \
           any(keyword in hostname for keyword in ['router', 'gateway', 'modem']):
            return 'Router/Gateway'
            
        # Server detection
        if any(port in open_ports for port in ['22', '80', '443', '8080', '3389']):
            if 'linux' in os_info or 'ubuntu' in os_info:
                return 'Linux Server'
            elif 'windows' in os_info:
                return 'Windows Server'
            else:
                return 'Server'
                
        # Mobile device detection
        if any(keyword in vendor for keyword in ['apple', 'samsung', 'huawei', 'xiaomi']):
            return 'Mobile Device'
            
        # Computer detection
        if 'windows' in os_info:
            return 'Windows Computer'
        elif 'mac' in os_info or 'apple' in vendor:
            return 'Mac Computer'
        elif 'linux' in os_info:
            return 'Linux Computer'
            
        # IoT device detection
        if any(keyword in vendor for keyword in ['tp-link', 'netgear', 'asus', 'linksys']):
            return 'Network Device'
            
        return 'Unknown Device'

    async def save_device(self, device_info: Dict):
        """Save or update device in database"""
        try:
            async with self.db_pool.acquire() as conn:
                # Check if device exists
                existing = await conn.fetchrow(
                    "SELECT id, first_discovered FROM network_devices WHERE ip_address = $1",
                    device_info['ip_address']
                )
                
                if existing:
                    # Update existing device
                    await conn.execute("""
                        UPDATE network_devices SET
                            hostname = $2,
                            mac_address = $3,
                            vendor = $4,
                            os_fingerprint = $5,
                            open_ports = $6,
                            services = $7,
                            device_type = $8,
                            is_online = $9,
                            last_seen = $10,
                            device_info = $11
                        WHERE ip_address = $1
                    """, 
                    device_info['ip_address'],
                    device_info.get('hostname'),
                    device_info.get('mac_address'),
                    device_info.get('vendor'),
                    device_info.get('os_fingerprint'),
                    device_info.get('open_ports', []),
                    json.dumps(device_info.get('services', {})),
                    device_info.get('device_type'),
                    device_info.get('is_online', True),
                    device_info['last_seen'],
                    json.dumps({
                        'scan_timestamp': device_info['last_seen'].isoformat(),
                        'scan_method': 'nmap'
                    })
                    )
                else:
                    # Insert new device
                    await conn.execute("""
                        INSERT INTO network_devices (
                            ip_address, hostname, mac_address, vendor, os_fingerprint,
                            open_ports, services, device_type, is_online, last_seen,
                            first_discovered, device_info
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    """,
                    device_info['ip_address'],
                    device_info.get('hostname'),
                    device_info.get('mac_address'),
                    device_info.get('vendor'),
                    device_info.get('os_fingerprint'),
                    device_info.get('open_ports', []),
                    json.dumps(device_info.get('services', {})),
                    device_info.get('device_type'),
                    device_info.get('is_online', True),
                    device_info['last_seen'],
                    device_info['last_seen'],
                    json.dumps({
                        'scan_timestamp': device_info['last_seen'].isoformat(),
                        'scan_method': 'nmap'
                    })
                    )
                    
                    logger.info(f"New device discovered: {device_info['ip_address']} ({device_info.get('device_type', 'Unknown')})")
                    
        except Exception as e:
            logger.error(f"Error saving device {device_info['ip_address']}: {e}")

    async def mark_offline_devices(self):
        """Mark devices as offline if not seen recently"""
        try:
            cutoff_time = datetime.now() - timedelta(minutes=10)
            
            async with self.db_pool.acquire() as conn:
                await conn.execute("""
                    UPDATE network_devices 
                    SET is_online = FALSE 
                    WHERE last_seen < $1 AND is_online = TRUE
                """, cutoff_time)
                
        except Exception as e:
            logger.error(f"Error marking offline devices: {e}")

    async def run_discovery_cycle(self):
        """Run a complete network discovery cycle"""
        logger.info("Starting network discovery cycle")
        
        try:
            networks = self.get_local_networks()
            
            for network in networks:
                devices = await self.discover_devices(network)
                
                for device in devices:
                    await self.save_device(device)
                    
            await self.mark_offline_devices()
            
            logger.info(f"Discovery cycle completed. Found {len(devices)} devices")
            
        except Exception as e:
            logger.error(f"Error in discovery cycle: {e}")

    async def run(self):
        """Main service loop"""
        await self.connect_db()
        
        logger.info("Network Discovery Service started")
        
        while True:
            try:
                await self.run_discovery_cycle()
                await asyncio.sleep(self.scan_interval)
                
            except KeyboardInterrupt:
                logger.info("Service stopped by user")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                await asyncio.sleep(60)  # Wait before retrying

if __name__ == "__main__":
    service = NetworkDiscovery()
    asyncio.run(service.run())
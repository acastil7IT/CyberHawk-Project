#!/usr/bin/env python3
"""
SecureNet Traffic Analyzer
Real-time network packet capture and analysis service
"""

import asyncio
import logging
import os
import hashlib
from datetime import datetime
from typing import Optional

import asyncpg
import redis
import structlog
from scapy.all import sniff, IP, TCP, UDP
from pydantic import BaseModel

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

class PacketData(BaseModel):
    timestamp: datetime
    source_ip: str
    dest_ip: str
    source_port: Optional[int] = None
    dest_port: Optional[int] = None
    protocol: str
    packet_size: int
    flags: Optional[str] = None
    payload_hash: Optional[str] = None

class TrafficAnalyzer:
    def __init__(self):
        self.db_pool = None
        self.redis_client = None
        self.packet_count = 0
        
    async def init_connections(self):
        """Initialize database and Redis connections"""
        try:
            # Database connection
            db_url = os.getenv('DATABASE_URL', 'postgresql://admin:secure123@localhost:5432/securenet')
            self.db_pool = await asyncpg.create_pool(db_url, min_size=2, max_size=10)
            
            # Redis connection
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            
            logger.info("Database and Redis connections established")
            
        except Exception as e:
            logger.error("Failed to initialize connections", error=str(e))
            raise

    def extract_packet_data(self, packet) -> Optional[PacketData]:
        """Extract relevant data from network packet"""
        try:
            if not packet.haslayer(IP):
                return None
                
            ip_layer = packet[IP]
            protocol = "OTHER"
            source_port = dest_port = None
            flags = None
            
            # Extract transport layer info
            if packet.haslayer(TCP):
                tcp_layer = packet[TCP]
                protocol = "TCP"
                source_port = tcp_layer.sport
                dest_port = tcp_layer.dport
                flags = str(tcp_layer.flags)
                
            elif packet.haslayer(UDP):
                udp_layer = packet[UDP]
                protocol = "UDP"
                source_port = udp_layer.sport
                dest_port = udp_layer.dport
            
            # Create payload hash for analysis
            payload_hash = None
            if hasattr(packet, 'payload') and packet.payload:
                payload_hash = hashlib.sha256(bytes(packet.payload)).hexdigest()[:16]
            
            return PacketData(
                timestamp=datetime.now(),
                source_ip=ip_layer.src,
                dest_ip=ip_layer.dst,
                source_port=source_port,
                dest_port=dest_port,
                protocol=protocol,
                packet_size=len(packet),
                flags=flags,
                payload_hash=payload_hash
            )
            
        except Exception as e:
            logger.warning("Failed to extract packet data", error=str(e))
            return None

    async def store_packet(self, packet_data: PacketData):
        """Store packet data in database"""
        try:
            async with self.db_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO network_traffic 
                    (timestamp, source_ip, dest_ip, source_port, dest_port, 
                     protocol, packet_size, flags, payload_hash)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """, 
                packet_data.timestamp,
                packet_data.source_ip,
                packet_data.dest_ip,
                packet_data.source_port,
                packet_data.dest_port,
                packet_data.protocol,
                packet_data.packet_size,
                packet_data.flags,
                packet_data.payload_hash
                )
                
        except Exception as e:
            logger.error("Failed to store packet", error=str(e))

    async def publish_to_redis(self, packet_data: PacketData):
        """Publish packet data to Redis for real-time processing"""
        try:
            self.redis_client.lpush(
                'packet_stream', 
                packet_data.model_dump_json()
            )
            # Keep only last 1000 packets in memory
            self.redis_client.ltrim('packet_stream', 0, 999)
            
        except Exception as e:
            logger.error("Failed to publish to Redis", error=str(e))

    def packet_handler(self, packet):
        """Handle captured packets"""
        packet_data = self.extract_packet_data(packet)
        if packet_data:
            self.packet_count += 1
            
            # Run async operations
            asyncio.create_task(self.store_packet(packet_data))
            asyncio.create_task(self.publish_to_redis(packet_data))
            
            if self.packet_count % 100 == 0:
                logger.info("Packets processed", count=self.packet_count)

    async def start_capture(self, interface: str = None):
        """Start packet capture"""
        logger.info("Starting packet capture", interface=interface or "all")
        
        try:
            # Start packet capture in a separate thread
            sniff(
                iface=interface,
                prn=self.packet_handler,
                store=False,
                filter="ip"  # Only capture IP packets
            )
        except Exception as e:
            logger.error("Packet capture failed", error=str(e))
            raise

async def main():
    """Main application entry point"""
    logger.info("SecureNet Traffic Analyzer starting...")
    
    analyzer = TrafficAnalyzer()
    await analyzer.init_connections()
    
    # Start packet capture
    interface = os.getenv('CAPTURE_INTERFACE')  # None = all interfaces
    await analyzer.start_capture(interface)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Traffic analyzer stopped by user")
    except Exception as e:
        logger.error("Traffic analyzer crashed", error=str(e))
        exit(1)
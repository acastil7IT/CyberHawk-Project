#!/usr/bin/env python3
"""
SecureNet Threat Detection Engine
ML-based anomaly detection and threat identification
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

import asyncpg
import numpy as np
import pandas as pd
import redis
import structlog
from elasticsearch import AsyncElasticsearch
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

class ThreatAlert(BaseModel):
    timestamp: datetime
    threat_type: str
    severity: str
    source_ip: str
    confidence: float
    description: str
    raw_data: Dict[str, Any]

class ThreatDetector:
    def __init__(self):
        self.db_pool = None
        self.redis_client = None
        self.es_client = None
        self.anomaly_model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    async def init_connections(self):
        """Initialize all service connections"""
        try:
            # Database
            db_url = os.getenv('DATABASE_URL')
            self.db_pool = await asyncpg.create_pool(db_url, min_size=2, max_size=10)
            
            # Redis
            redis_url = os.getenv('REDIS_URL')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            
            # Elasticsearch
            es_url = os.getenv('ELASTICSEARCH_URL', 'http://localhost:9200')
            self.es_client = AsyncElasticsearch([es_url])
            
            logger.info("All connections established")
            
        except Exception as e:
            logger.error("Failed to initialize connections", error=str(e))
            raise

    async def train_anomaly_model(self):
        """Train ML model on historical network data"""
        try:
            logger.info("Training anomaly detection model...")
            
            # Fetch training data from last 7 days
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT source_ip, dest_ip, source_port, dest_port, 
                           protocol, packet_size, 
                           EXTRACT(HOUR FROM timestamp) as hour,
                           EXTRACT(DOW FROM timestamp) as day_of_week
                    FROM network_traffic 
                    WHERE timestamp > NOW() - INTERVAL '7 days'
                    LIMIT 10000
                """)
            
            if len(rows) < 100:
                logger.warning("Insufficient training data, using synthetic data")
                return await self.create_baseline_model()
            
            # Convert to DataFrame
            df = pd.DataFrame(rows)
            
            # Feature engineering
            features = self.extract_features(df)
            
            # Train model
            scaled_features = self.scaler.fit_transform(features)
            self.anomaly_model.fit(scaled_features)
            self.is_trained = True
            
            logger.info("Model training completed", samples=len(features))
            
        except Exception as e:
            logger.error("Model training failed", error=str(e))
            await self.create_baseline_model()

    async def create_baseline_model(self):
        """Create baseline model with synthetic data"""
        # Generate synthetic normal traffic patterns
        np.random.seed(42)
        synthetic_data = np.random.normal(0, 1, (1000, 6))
        
        self.scaler.fit(synthetic_data)
        self.anomaly_model.fit(synthetic_data)
        self.is_trained = True
        
        logger.info("Baseline model created with synthetic data")

    def extract_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract numerical features for ML model"""
        features = []
        
        for _, row in df.iterrows():
            feature_vector = [
                hash(row['source_ip']) % 1000,  # IP hash
                hash(row['dest_ip']) % 1000,
                row['source_port'] or 0,
                row['dest_port'] or 0,
                row['packet_size'],
                row['hour'],
                row['day_of_week']
            ]
            features.append(feature_vector)
            
        return np.array(features)

    async def detect_anomalies(self, packet_data: Dict) -> List[ThreatAlert]:
        """Detect anomalies in network traffic"""
        alerts = []
        
        try:
            if not self.is_trained:
                return alerts
            
            # Extract features from packet
            features = np.array([[
                hash(packet_data['source_ip']) % 1000,
                hash(packet_data['dest_ip']) % 1000,
                packet_data.get('source_port', 0) or 0,
                packet_data.get('dest_port', 0) or 0,
                packet_data['packet_size'],
                datetime.now().hour,
                datetime.now().weekday()
            ]])
            
            # Scale features
            scaled_features = self.scaler.transform(features)
            
            # Predict anomaly
            anomaly_score = self.anomaly_model.decision_function(scaled_features)[0]
            is_anomaly = self.anomaly_model.predict(scaled_features)[0] == -1
            
            if is_anomaly:
                confidence = abs(anomaly_score)
                severity = "HIGH" if confidence > 0.5 else "MEDIUM"
                
                alert = ThreatAlert(
                    timestamp=datetime.now(),
                    threat_type="NETWORK_ANOMALY",
                    severity=severity,
                    source_ip=packet_data['source_ip'],
                    confidence=confidence,
                    description=f"Anomalous network behavior detected (score: {anomaly_score:.3f})",
                    raw_data=packet_data
                )
                alerts.append(alert)
                
        except Exception as e:
            logger.error("Anomaly detection failed", error=str(e))
            
        return alerts

    async def detect_signature_threats(self, packet_data: Dict) -> List[ThreatAlert]:
        """Detect threats using signature-based rules"""
        alerts = []
        
        try:
            source_ip = packet_data['source_ip']
            dest_port = packet_data.get('dest_port')
            
            # Port scan detection
            if await self.detect_port_scan(source_ip):
                alerts.append(ThreatAlert(
                    timestamp=datetime.now(),
                    threat_type="PORT_SCAN",
                    severity="MEDIUM",
                    source_ip=source_ip,
                    confidence=0.8,
                    description="Port scanning activity detected",
                    raw_data=packet_data
                ))
            
            # Suspicious port access
            suspicious_ports = [22, 23, 135, 139, 445, 1433, 3389]
            if dest_port in suspicious_ports:
                alerts.append(ThreatAlert(
                    timestamp=datetime.now(),
                    threat_type="SUSPICIOUS_PORT_ACCESS",
                    severity="MEDIUM",
                    source_ip=source_ip,
                    confidence=0.6,
                    description=f"Access to suspicious port {dest_port}",
                    raw_data=packet_data
                ))
                
        except Exception as e:
            logger.error("Signature detection failed", error=str(e))
            
        return alerts

    async def detect_port_scan(self, source_ip: str) -> bool:
        """Detect port scanning behavior"""
        try:
            # Check Redis for recent port access patterns
            key = f"port_access:{source_ip}"
            recent_ports = self.redis_client.smembers(key)
            
            # If accessing more than 10 different ports in 5 minutes, flag as scan
            return len(recent_ports) > 10
            
        except Exception:
            return False

    async def store_alert(self, alert: ThreatAlert):
        """Store threat alert in database and Elasticsearch"""
        try:
            # Store in PostgreSQL
            async with self.db_pool.acquire() as conn:
                incident_id = await conn.fetchval("""
                    INSERT INTO security_incidents 
                    (severity, incident_type, source_ip, description, status)
                    VALUES ($1, $2, $3, $4, 'OPEN')
                    RETURNING id
                """, alert.severity, alert.threat_type, alert.source_ip, alert.description)
                
                await conn.execute("""
                    INSERT INTO alerts (incident_id, alert_type, message)
                    VALUES ($1, $2, $3)
                """, incident_id, alert.threat_type, alert.description)
            
            # Store in Elasticsearch for search
            await self.es_client.index(
                index="security-alerts",
                document={
                    "timestamp": alert.timestamp.isoformat(),
                    "threat_type": alert.threat_type,
                    "severity": alert.severity,
                    "source_ip": alert.source_ip,
                    "confidence": alert.confidence,
                    "description": alert.description,
                    "raw_data": alert.raw_data
                }
            )
            
            logger.info("Alert stored", threat_type=alert.threat_type, severity=alert.severity)
            
        except Exception as e:
            logger.error("Failed to store alert", error=str(e))

    async def process_packet_stream(self):
        """Process incoming packet stream from Redis"""
        logger.info("Starting packet stream processing...")
        
        while True:
            try:
                # Get packet from Redis queue
                packet_json = self.redis_client.brpop('packet_stream', timeout=1)
                
                if packet_json:
                    packet_data = json.loads(packet_json[1])
                    
                    # Run threat detection
                    anomaly_alerts = await self.detect_anomalies(packet_data)
                    signature_alerts = await self.detect_signature_threats(packet_data)
                    
                    # Store all alerts
                    for alert in anomaly_alerts + signature_alerts:
                        await self.store_alert(alert)
                        
                        # Publish to real-time alert stream
                        self.redis_client.lpush(
                            'alert_stream', 
                            alert.model_dump_json()
                        )
                
            except Exception as e:
                logger.error("Packet processing error", error=str(e))
                await asyncio.sleep(1)

async def main():
    """Main application entry point"""
    logger.info("SecureNet Threat Detector starting...")
    
    detector = ThreatDetector()
    await detector.init_connections()
    await detector.train_anomaly_model()
    
    # Start processing
    await detector.process_packet_stream()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Threat detector stopped by user")
    except Exception as e:
        logger.error("Threat detector crashed", error=str(e))
        exit(1)
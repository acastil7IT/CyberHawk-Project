# SecureNet Monitor - Deployment Guide

## 🚀 Deployment Options

### Local Development
```bash
# Quick start
./setup.sh

# Manual start
docker-compose up -d
```

### Production Deployment

#### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 20GB+ disk space
- Linux server (Ubuntu 20.04+ recommended)

#### Production Setup
```bash
# 1. Clone repository
git clone <your-repo>
cd securenet-monitor

# 2. Configure environment
cp .env.example .env
# Edit .env with production values

# 3. Generate SSL certificates
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# 4. Deploy with production settings
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

#### AWS ECS
```bash
# Build and push images
docker build -t securenet/api services/api-gateway/
docker tag securenet/api:latest <account>.dkr.ecr.region.amazonaws.com/securenet-api:latest
docker push <account>.dkr.ecr.region.amazonaws.com/securenet-api:latest

# Deploy with ECS CLI
ecs-cli compose --file docker-compose.aws.yml service up
```

#### Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
POSTGRES_DB=securenet
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://redis:6379

# Elasticsearch
ELASTICSEARCH_URL=http://elasticsearch:9200

# Security
JWT_SECRET_KEY=your-secret-key
API_KEY=your-api-key

# Network
CAPTURE_INTERFACE=eth0  # or leave empty for all interfaces
```

### SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://dashboard:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs -f traffic-analyzer

# Database health
docker-compose exec postgres pg_isready -U admin

# API health
curl http://localhost:8000/health
```

### Backup Strategy
```bash
# Database backup
docker-compose exec postgres pg_dump -U admin securenet > backup.sql

# Restore database
docker-compose exec -T postgres psql -U admin securenet < backup.sql

# Configuration backup
tar -czf config-backup.tar.gz .env nginx/ grafana/
```

### Performance Tuning
```yaml
# docker-compose.override.yml
services:
  postgres:
    environment:
      - POSTGRES_SHARED_BUFFERS=256MB
      - POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
    
  redis:
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    
  traffic-analyzer:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

## 🔐 Security Hardening

### Network Security
```bash
# Firewall rules (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5432/tcp   # Block direct DB access
sudo ufw enable
```

### Container Security
```dockerfile
# Use non-root user
RUN useradd -m -u 1001 appuser
USER appuser

# Read-only filesystem
docker run --read-only --tmpfs /tmp securenet/api
```

### Access Control
```yaml
# docker-compose.prod.yml
services:
  postgres:
    networks:
      - backend
    # Remove ports exposure in production
    
  redis:
    networks:
      - backend
    # Remove ports exposure in production

networks:
  backend:
    internal: true
  frontend:
    driver: bridge
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
services:
  api-gateway:
    deploy:
      replicas: 3
      
  threat-detector:
    deploy:
      replicas: 2
      
  nginx:
    depends_on:
      - api-gateway
    # Load balance across API instances
```

### Database Scaling
```sql
-- Read replicas
CREATE PUBLICATION securenet_pub FOR ALL TABLES;

-- Partitioning for large tables
CREATE TABLE network_traffic_2024_01 PARTITION OF network_traffic
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 🚨 Troubleshooting

### Common Issues

#### Traffic Analyzer Not Capturing
```bash
# Check network permissions
sudo setcap cap_net_raw,cap_net_admin=eip /usr/bin/python3

# Run with privileged mode
docker-compose up -d --privileged traffic-analyzer
```

#### High Memory Usage
```bash
# Monitor resource usage
docker stats

# Limit container memory
docker-compose up -d --memory=1g traffic-analyzer
```

#### Database Connection Issues
```bash
# Check connection pool
docker-compose exec postgres psql -U admin -c "SELECT * FROM pg_stat_activity;"

# Restart database
docker-compose restart postgres
```

### Log Analysis
```bash
# Centralized logging
docker-compose logs -f | grep ERROR

# Service-specific logs
docker-compose logs threat-detector | tail -100

# Real-time monitoring
watch -n 5 'docker-compose ps'
```

## 📋 Maintenance Checklist

### Daily
- [ ] Check service health status
- [ ] Monitor disk space usage
- [ ] Review security alerts
- [ ] Verify backup completion

### Weekly
- [ ] Update threat signatures
- [ ] Review incident reports
- [ ] Check system performance
- [ ] Update Docker images

### Monthly
- [ ] Security patch updates
- [ ] Database maintenance
- [ ] Log rotation cleanup
- [ ] Performance optimization review

---

For additional support, check the troubleshooting section or create an issue in the repository.
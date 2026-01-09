#!/bin/bash

# SecureNet Monitor Deployment Script
# Supports multiple deployment platforms

set -e

echo "🚀 SecureNet Monitor - Deployment Script"
echo "========================================"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Function to deploy locally
deploy_local() {
    echo "🏠 Deploying locally..."
    
    # Stop existing containers
    docker compose down 2>/dev/null || true
    
    # Build and start services
    docker compose up -d --build
    
    echo "✅ Local deployment completed!"
    echo "📱 Access at: http://localhost:3000"
}

# Function to prepare for cloud deployment
prepare_cloud_deployment() {
    echo "☁️ Preparing for cloud deployment..."
    
    # Create production docker-compose file
    cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-securenet}
      POSTGRES_USER: ${POSTGRES_USER:-admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    networks:
      - backend
    restart: unless-stopped

  # API Gateway
  api-gateway:
    build: ./services/api-gateway
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-admin}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-securenet}
      - REDIS_URL=redis://redis:6379
    networks:
      - backend
      - frontend
    restart: unless-stopped
    depends_on:
      - postgres
      - redis

  # Frontend Dashboard
  dashboard:
    build: ./frontend
    environment:
      - REACT_APP_API_URL=${API_URL:-http://localhost:8001}
    networks:
      - frontend
    restart: unless-stopped
    depends_on:
      - api-gateway

  # NGINX Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "${PORT:-80}:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    networks:
      - frontend
    restart: unless-stopped
    depends_on:
      - dashboard
      - api-gateway

  # Network Discovery (Optional for cloud)
  network-discovery:
    build: ./services/network-discovery
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-admin}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-securenet}
    networks:
      - backend
    restart: unless-stopped
    depends_on:
      - postgres

volumes:
  postgres_data:

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
EOF

    # Create production nginx config
    mkdir -p nginx
    cat > nginx/nginx.prod.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api-gateway:8000;
    }
    
    upstream frontend {
        server dashboard:3000;
    }

    server {
        listen 80;
        server_name _;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # API routes
        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

    # Create environment template
    cat > .env.production << 'EOF'
# Production Environment Variables
POSTGRES_DB=securenet
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password_here
API_URL=https://your-domain.com
PORT=80

# Optional: Add your domain for SSL
DOMAIN=your-domain.com
EOF

    echo "✅ Cloud deployment files created!"
    echo "📝 Next steps:"
    echo "   1. Update .env.production with your values"
    echo "   2. Choose your deployment platform below"
}

# Function to show deployment options
show_deployment_options() {
    echo ""
    echo "🌐 Deployment Options:"
    echo "====================="
    echo ""
    echo "1. 🏠 Local Development"
    echo "   docker compose up -d"
    echo ""
    echo "2. ☁️ Heroku (Free Tier)"
    echo "   - Install Heroku CLI"
    echo "   - heroku create your-app-name"
    echo "   - heroku stack:set container"
    echo "   - git push heroku main"
    echo ""
    echo "3. 🐙 Railway (Easy Deploy)"
    echo "   - Connect GitHub repo at railway.app"
    echo "   - Auto-deploys from main branch"
    echo "   - Free tier available"
    echo ""
    echo "4. ⚡ Vercel (Frontend Only)"
    echo "   - Connect GitHub repo at vercel.com"
    echo "   - Perfect for frontend demos"
    echo "   - Free tier with custom domains"
    echo ""
    echo "5. 🌊 DigitalOcean App Platform"
    echo "   - Connect GitHub repo"
    echo "   - Uses docker-compose.prod.yml"
    echo "   - \$5/month for basic app"
    echo ""
    echo "6. 🚀 AWS/GCP/Azure"
    echo "   - Use docker-compose.prod.yml"
    echo "   - Configure load balancer"
    echo "   - Set up SSL certificates"
    echo ""
}

# Main deployment logic
case "${1:-local}" in
    "local")
        deploy_local
        ;;
    "cloud")
        prepare_cloud_deployment
        show_deployment_options
        ;;
    "help"|"-h"|"--help")
        echo "Usage: ./deploy.sh [local|cloud|help]"
        echo ""
        echo "Commands:"
        echo "  local  - Deploy locally with Docker Compose (default)"
        echo "  cloud  - Prepare files for cloud deployment"
        echo "  help   - Show this help message"
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo "Use './deploy.sh help' for usage information"
        exit 1
        ;;
esac
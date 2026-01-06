#!/bin/bash

# SecureNet Monitor Setup Script
# This script sets up the complete network security monitoring platform

set -e

echo "🛡️  SecureNet Monitor Setup"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed (try both old and new syntax)
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Use modern docker compose syntax
COMPOSE_CMD="docker compose"
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p nginx/ssl
mkdir -p grafana/dashboards
mkdir -p grafana/datasources

# Create Grafana datasource configuration
echo "⚙️  Setting up Grafana datasources..."
cat > grafana/datasources/datasources.yml << EOF
apiVersion: 1

datasources:
  - name: PostgreSQL
    type: postgres
    url: postgres:5432
    database: securenet
    user: admin
    secureJsonData:
      password: secure123
    jsonData:
      sslmode: disable
      postgresVersion: 1500
    isDefault: true
EOF

# Create sample Grafana dashboard
echo "📊 Setting up Grafana dashboards..."
cat > grafana/dashboards/dashboards.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

# Set proper permissions
echo "🔐 Setting permissions..."
chmod +x setup.sh
chmod 755 logs

# Build and start services
echo "🚀 Building and starting services..."
echo "This may take a few minutes on first run..."

# Pull base images first to show progress
$COMPOSE_CMD pull

# Build and start services
$COMPOSE_CMD up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check if database is ready
echo "Checking database..."
for i in {1..30}; do
    if $COMPOSE_CMD exec -T postgres pg_isready -U admin -d securenet; then
        echo "✅ Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start"
        exit 1
    fi
    sleep 2
done

# Check if API is ready
echo "Checking API Gateway..."
for i in {1..30}; do
    if curl -s http://localhost:8001/health > /dev/null; then
        echo "✅ API Gateway is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ API Gateway failed to start"
        exit 1
    fi
    sleep 2
done

# Check if frontend is ready
echo "Checking Frontend..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend failed to start"
        exit 1
    fi
    sleep 2
done

echo ""
echo "🎉 SecureNet Monitor is now running!"
echo ""
echo "📱 Access Points:"
echo "   Dashboard:  http://localhost:3000"
echo "   API:        http://localhost:8001"
echo "   Grafana:    http://localhost:3001 (admin/admin123)"
echo "   Database:   localhost:5433 (admin/secure123)"
echo ""
echo "🔧 Management Commands:"
echo "   View logs:     $COMPOSE_CMD logs -f [service-name]"
echo "   Stop all:      $COMPOSE_CMD down"
echo "   Restart:       $COMPOSE_CMD restart"
echo "   Update:        $COMPOSE_CMD pull && $COMPOSE_CMD up -d"
echo ""
echo "📚 Next Steps:"
echo "   1. Open http://localhost:3000 to access the dashboard"
echo "   2. Check the incidents and network traffic tabs"
echo "   3. Monitor live alerts for security events"
echo "   4. Customize threat detection rules in the database"
echo ""
echo "⚠️  Note: The traffic analyzer requires privileged access for packet capture."
echo "   On some systems, you may need to run with sudo or adjust network permissions."
echo ""
echo "🛡️  Happy monitoring!"
FROM python:3.11-slim

# Install system dependencies for network scanning
RUN apt-get update && apt-get install -y \
    nmap \
    arp-scan \
    net-tools \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

CMD ["python", "network_discovery.py"]
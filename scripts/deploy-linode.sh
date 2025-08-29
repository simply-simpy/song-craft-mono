#!/bin/bash

# Linode Deployment Script for Songcraft
# This script deploys the application to a Linode server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LINODE_HOST="${LINODE_HOST:-}"
LINODE_USER="${LINODE_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/songcraft}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if [ -z "$LINODE_HOST" ]; then
        log_error "LINODE_HOST environment variable is not set."
        log_info "Please set it to your Linode server IP address:"
        log_info "export LINODE_HOST=your_server_ip"
        exit 1
    fi
    
    log_success "Requirements check passed"
}

build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build frontend
    log_info "Building frontend image..."
    docker build -t songcraft-frontend:latest .
    
    # Build backend
    log_info "Building backend image..."
    docker build -f songcraft-api/Dockerfile -t songcraft-backend:latest .
    
    log_success "Docker images built successfully"
}

deploy_to_linode() {
    log_info "Deploying to Linode server: $LINODE_HOST"
    
    # Create deployment package
    log_info "Creating deployment package..."
    DEPLOY_TEMP=$(mktemp -d)
    
    # Copy necessary files
    cp docker-compose.prod.yml "$DEPLOY_TEMP/"
    cp nginx.prod.conf "$DEPLOY_TEMP/"
    cp -r songcraft-api/drizzle "$DEPLOY_TEMP/"
    
    # Create production environment file if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
        log_warning ".env.production not found. Please create it from env.production.example"
        log_info "You can copy the example file and fill in your values:"
        log_info "cp env.production.example .env.production"
        exit 1
    fi
    
    cp "$PROJECT_ROOT/.env.production" "$DEPLOY_TEMP/"
    
    # Create deployment script
    cat > "$DEPLOY_TEMP/deploy.sh" << 'EOF'
#!/bin/bash
set -e

echo "Starting deployment on Linode server..."

# Stop existing containers
docker-compose -f docker-compose.prod.yml down || true

# Pull latest images (if using registry)
# docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 30

# Check service status
docker-compose -f docker-compose.prod.yml ps

echo "Deployment completed successfully!"
EOF
    
    chmod +x "$DEPLOY_TEMP/deploy.sh"
    
    # Create SSL directory and self-signed certificate for testing
    mkdir -p "$DEPLOY_TEMP/ssl"
    openssl req -x509 -newkey rsa:4096 -keyout "$DEPLOY_TEMP/ssl/key.pem" -out "$DEPLOY_TEMP/ssl/cert.pem" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || {
        log_warning "Could not generate self-signed certificate. You'll need to provide SSL certificates manually."
        mkdir -p "$DEPLOY_TEMP/ssl"
        touch "$DEPLOY_TEMP/ssl/cert.pem"
        touch "$DEPLOY_TEMP/ssl/key.pem"
    }
    
    # Create deployment archive
    cd "$DEPLOY_TEMP"
    tar -czf songcraft-deploy.tar.gz .
    
    # Transfer to Linode server
    log_info "Transferring deployment package to Linode server..."
    scp -o StrictHostKeyChecking=no songcraft-deploy.tar.gz "$LINODE_USER@$LINODE_HOST:/tmp/"
    
    # Execute deployment on Linode
    log_info "Executing deployment on Linode server..."
    ssh -o StrictHostKeyChecking=no "$LINODE_USER@$LINODE_HOST" << 'ENDSSH'
        cd /tmp
        tar -xzf songcraft-deploy.tar.gz
        chmod +x deploy.sh
        ./deploy.sh
        rm -rf /tmp/songcraft-deploy.tar.gz /tmp/deploy.sh
ENDSSH
    
    # Cleanup
    rm -rf "$DEPLOY_TEMP"
    
    log_success "Deployment completed successfully!"
}

main() {
    log_info "Starting Linode deployment for Songcraft..."
    
    check_requirements
    build_images
    deploy_to_linode
    
    log_success "Deployment completed! Your app should be running on https://$LINODE_HOST"
    log_info "Note: You're using a self-signed certificate. For production, consider using Let's Encrypt or a proper SSL certificate."
}

# Run main function
main "$@"

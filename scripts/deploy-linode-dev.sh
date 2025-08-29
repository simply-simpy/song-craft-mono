#!/bin/bash

# Linode Development Deployment Script for Songcraft
# This script deploys the development version to a Linode server

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
DEPLOY_PATH="${DEPLOY_PATH:-/opt/songcraft-dev}"
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

build_dev_images() {
    log_info "Building development Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build frontend dev image
    log_info "Building frontend development image..."
    docker build -f Dockerfile.dev -t songcraft-frontend:dev .
    
    # Build backend dev image
    log_info "Building backend development image..."
    docker build -f songcraft-api/Dockerfile.dev -t songcraft-backend:dev .
    
    log_success "Development Docker images built successfully"
}

deploy_dev_to_linode() {
    log_info "Deploying development version to Linode server: $LINODE_HOST"
    
    # Create deployment package
    log_info "Creating development deployment package..."
    DEPLOY_TEMP=$(mktemp -d)
    
    # Copy necessary files
    cp docker-compose.dev-linode.yml "$DEPLOY_TEMP/"
    cp nginx.dev.conf "$DEPLOY_TEMP/"
    cp -r songcraft-api/drizzle "$DEPLOY_TEMP/"
    
    # Create development environment file if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env.dev-linode" ]; then
        log_warning ".env.dev-linode not found. Please create it from env.dev-linode.example"
        log_info "You can copy the example file and fill in your values:"
        log_info "cp env.dev-linode.example .env.dev-linode"
        exit 1
    fi
    
    cp "$PROJECT_ROOT/.env.dev-linode" "$DEPLOY_TEMP/"
    
    # Create development deployment script
    cat > "$DEPLOY_TEMP/deploy-dev.sh" << 'EOF'
#!/bin/bash
set -e

echo "Starting development deployment on Linode server..."

# Stop existing containers
docker-compose -f docker-compose.dev-linode.yml down || true

# Start development services
docker-compose -f docker-compose.dev-linode.yml up -d

# Wait for services to be healthy
echo "Waiting for development services to be healthy..."
sleep 30

# Check service status
docker-compose -f docker-compose.dev-linode.yml ps

echo "Development deployment completed successfully!"
echo "Your dev instance should be accessible at:"
echo "- HTTP: http://$(hostname -I | awk '{print $1}')"
echo "- HTTPS: https://$(hostname -I | awk '{print $1}') (self-signed cert)"
echo "- Frontend Dev Server: http://$(hostname -I | awk '{print $1}'):3000"
echo "- Backend API: http://$(hostname -I | awk '{print $1}'):4500"
echo "- Database: $(hostname -I | awk '{print $1}'):5432"
EOF
    
    chmod +x "$DEPLOY_TEMP/deploy-dev.sh"
    
    # Create SSL directory and self-signed certificate for development
    mkdir -p "$DEPLOY_TEMP/ssl"
    openssl req -x509 -newkey rsa:4096 -keyout "$DEPLOY_TEMP/ssl/key.pem" -out "$DEPLOY_TEMP/ssl/cert.pem" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || {
        log_warning "Could not generate self-signed certificate. You'll need to provide SSL certificates manually."
        mkdir -p "$DEPLOY_TEMP/ssl"
        touch "$DEPLOY_TEMP/ssl/cert.pem"
        touch "$DEPLOY_TEMP/ssl/key.pem"
    }
    
    # Create development deployment archive
    cd "$DEPLOY_TEMP"
    tar -czf songcraft-dev-deploy.tar.gz .
    
    # Transfer to Linode server
    log_info "Transferring development deployment package to Linode server..."
    scp -o StrictHostKeyChecking=no songcraft-dev-deploy.tar.gz "$LINODE_USER@$LINODE_HOST:/tmp/"
    
    # Execute deployment on Linode
    log_info "Executing development deployment on Linode server..."
    ssh -o StrictHostKeyChecking=no "$LINODE_USER@$LINODE_HOST" << 'ENDSSH'
        cd /tmp
        tar -xzf songcraft-dev-deploy.tar.gz
        chmod +x deploy-dev.sh
        ./deploy-dev.sh
        rm -rf /tmp/songcraft-dev-deploy.tar.gz /tmp/deploy-dev.sh
ENDSSH
    
    # Cleanup
    rm -rf "$DEPLOY_TEMP"
    
    log_success "Development deployment completed successfully!"
}

main() {
    log_info "Starting Linode development deployment for Songcraft..."
    
    check_requirements
    build_dev_images
    deploy_dev_to_linode
    
    log_success "Development deployment completed!"
    log_info "Your dev instance should be running on:"
    log_info "- HTTP: http://$LINODE_HOST"
    log_info "- HTTPS: https://$LINODE_HOST (self-signed cert)"
    log_info "- Frontend Dev: http://$LINODE_HOST:3000"
    log_info "- Backend API: http://$LINODE_HOST:4500"
    log_info "- Database: $LINODE_HOST:5432"
    log_info ""
    log_info "Development features enabled:"
    log_info "- Hot reloading for frontend and backend"
    log_info "- Exposed ports for direct access"
    log_info "- Verbose logging and debugging"
    log_info "- More permissive rate limiting"
    log_info "- No caching for easier development"
}

# Run main function
main "$@"

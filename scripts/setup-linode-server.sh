#!/bin/bash

# Linode Server Setup Script
# This script sets up a fresh Linode server for Songcraft deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

update_system() {
    log_info "Updating system packages..."
    
    # Update package lists
    apt-get update
    
    # Upgrade existing packages
    apt-get upgrade -y
    
    # Install essential packages
    apt-get install -y \
        curl \
        wget \
        git \
        vim \
        htop \
        ufw \
        fail2ban \
        nginx \
        certbot \
        python3-certbot-nginx
    
    log_success "System updated successfully"
}

install_docker() {
    log_info "Installing Docker..."
    
    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc || true
    
    # Install prerequisites
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    log_success "Docker installed successfully"
}

install_docker_compose() {
    log_info "Installing Docker Compose..."
    
    # Install Docker Compose v2
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Create symlink for compatibility
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose installed successfully"
}

setup_firewall() {
    log_info "Setting up firewall..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable UFW
    ufw --force enable
    
    log_success "Firewall configured successfully"
}

setup_fail2ban() {
    log_info "Setting up Fail2ban..."
    
    # Create basic jail configuration
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
EOF
    
    # Restart fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    log_success "Fail2ban configured successfully"
}

setup_nginx() {
    log_info "Setting up Nginx..."
    
    # Remove default nginx site
    rm -f /etc/nginx/sites-enabled/default
    
    # Create basic nginx configuration
    cat > /etc/nginx/sites-available/songcraft << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name _;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:4500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/songcraft /etc/nginx/sites-enabled/
    
    # Create SSL directory
    mkdir -p /etc/nginx/ssl
    
    # Generate self-signed certificate for initial setup
    openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || {
        log_warning "Could not generate self-signed certificate. You'll need to provide SSL certificates manually."
        touch /etc/nginx/ssl/cert.pem
        touch /etc/nginx/ssl/key.pem
    }
    
    # Test nginx configuration
    nginx -t
    
    # Restart nginx
    systemctl restart nginx
    systemctl enable nginx
    
    log_success "Nginx configured successfully"
}

create_deployment_user() {
    log_info "Creating deployment user..."
    
    # Create songcraft user
    useradd -m -s /bin/bash songcraft || true
    
    # Add user to docker group
    usermod -aG docker songcraft
    
    # Create deployment directory
    mkdir -p /opt/songcraft
    chown songcraft:songcraft /opt/songcraft
    
    log_success "Deployment user created successfully"
}

setup_ssl_certbot() {
    log_info "Setting up SSL with Certbot..."
    
    # Create certbot configuration
    cat > /etc/letsencrypt/cli.ini << 'EOF'
# Automatically use the staging server for testing
# Uncomment the following line to use the production server
# server = https://acme-v02.api.letsencrypt.org/directory

# Use a 4096 bit RSA key instead of 2048
rsa-key-size = 4096

# Set email for important notifications
email = your-email@example.com

# Accept terms of service
agree-tos = true

# Use webroot authenticator
authenticator = webroot
webroot-path = /var/www/html
EOF
    
    log_success "Certbot configured successfully"
    log_info "To get SSL certificates, run: certbot --nginx -d yourdomain.com"
}

main() {
    log_info "Starting Linode server setup for Songcraft..."
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run this script as root (use sudo)"
        exit 1
    fi
    
    # Update system
    update_system
    
    # Install Docker and Docker Compose
    install_docker
    install_docker_compose
    
    # Setup security
    setup_firewall
    setup_fail2ban
    
    # Setup web server
    setup_nginx
    setup_ssl_certbot
    
    # Create deployment user
    create_deployment_user
    
    log_success "Linode server setup completed successfully!"
    log_info "Next steps:"
    log_info "1. Set up your domain DNS to point to this server"
    log_info "2. Get SSL certificates: certbot --nginx -d yourdomain.com"
    log_info "3. Deploy your application using the deployment script"
    log_info "4. Consider setting up automated SSL renewal: crontab -e"
    log_info "   Add: 0 12 * * * /usr/bin/certbot renew --quiet"
}

# Run main function
main "$@"

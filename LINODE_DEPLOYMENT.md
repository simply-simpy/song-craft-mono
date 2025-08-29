# Linode Deployment Guide for Songcraft

This guide will walk you through deploying your Songcraft application to Linode using Docker and Docker Compose.

## Prerequisites

- A Linode account
- A domain name (optional but recommended)
- SSH access to your local machine
- Docker and Docker Compose installed locally

## Step 1: Create a Linode Server

1. **Log into Linode** and create a new Linode
2. **Choose a distribution**: Ubuntu 22.04 LTS (recommended)
3. **Choose a region**: Select the region closest to your users
4. **Choose a plan**:
   - **Shared CPU**: Nanode 1GB for testing ($5/month)
   - **Dedicated CPU**: Linode 2GB for production ($10/month)
5. **Add your SSH key** for secure access
6. **Create the Linode** and wait for it to be ready

## Step 2: Set Up the Server

### Option A: Automated Setup (Recommended)

1. **SSH into your server**:

   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Download and run the setup script**:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/your-repo/songcraft/main/scripts/setup-linode-server.sh | bash
   ```

### Option B: Manual Setup

If you prefer to set up manually, follow these steps:

1. **Update the system**:

   ```bash
   apt update && apt upgrade -y
   ```

2. **Install Docker**:

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Install Docker Compose**:

   ```bash
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

4. **Set up firewall**:
   ```bash
   ufw allow ssh
   ufw allow 80
   ufw allow 443
   ufw --force enable
   ```

## Step 3: Configure Environment Variables

1. **Create production environment file**:

   ```bash
   cp env.production.example .env.production
   ```

2. **Edit the file** with your production values:

   ```bash
   nano .env.production
   ```

   **Required variables**:
   - `POSTGRES_PASSWORD`: A strong, secure password
   - `CLERK_SECRET_KEY`: Your Clerk production secret key

   **Optional variables**:
   - `POSTGRES_DB`: Database name (default: songcraft)
   - `POSTGRES_USER`: Database user (default: songcraft)
   - `DOMAIN`: Your domain name

## Step 4: Deploy the Application

### Option A: Development Instance (Recommended for Learning)

Perfect for testing, development, and learning the deployment process:

1. **Set environment variables**:

   ```bash
   export LINODE_HOST=YOUR_SERVER_IP
   export LINODE_USER=root
   ```

2. **Create development environment file**:

   ```bash
   cp env.dev-linode.example .env.dev-linode
   # Edit with your development values
   ```

3. **Run the development deployment script**:
   ```bash
   chmod +x scripts/deploy-linode-dev.sh
   ./scripts/deploy-linode-dev.sh
   ```

**Development Features:**

- Hot reloading for frontend and backend
- Exposed ports for direct access (3000, 4500, 5432)
- Verbose logging and debugging
- More permissive rate limiting
- No caching for easier development
- Self-signed SSL certificates

### Option B: Production Instance

For production use with real users:

1. **Set environment variables**:

   ```bash
   export LINODE_HOST=YOUR_SERVER_IP
   export LINODE_USER=root
   ```

2. **Create production environment file**:

   ```bash
   cp env.production.example .env.production
   # Edit with your production values
   ```

3. **Run the production deployment script**:
   ```bash
   chmod +x scripts/deploy-linode.sh
   ./scripts/deploy-linode.sh
   ```

### Option C: Manual Deployment

1. **Set environment variables**:

   ```bash
   export LINODE_HOST=YOUR_SERVER_IP
   export LINODE_USER=root
   ```

2. **Run the deployment script**:
   ```bash
   chmod +x scripts/deploy-linode.sh
   ./scripts/deploy-linode.sh
   ```

### Option B: Manual Deployment

1. **Build and push images** (if using a registry):

   ```bash
   docker build -t songcraft-frontend:latest .
   docker build -f songcraft-api/Dockerfile -t songcraft-backend:latest .
   ```

2. **Copy files to server**:

   ```bash
   scp docker-compose.prod.yml root@YOUR_SERVER_IP:/opt/songcraft/
   scp nginx.prod.conf root@YOUR_SERVER_IP:/opt/songcraft/
   scp .env.production root@YOUR_SERVER_IP:/opt/songcraft/
   ```

3. **Deploy on server**:
   ```bash
   ssh root@YOUR_SERVER_IP
   cd /opt/songcraft
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Step 5: Set Up SSL (Optional but Recommended)

### Option A: Let's Encrypt (Free)

1. **Install Certbot**:

   ```bash
   apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate**:

   ```bash
   certbot --nginx -d yourdomain.com
   ```

3. **Set up auto-renewal**:
   ```bash
   crontab -e
   # Add this line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Option B: Custom SSL Certificates

1. **Upload your certificates** to `/etc/nginx/ssl/`
2. **Update nginx configuration** to use your certificates
3. **Restart nginx**:
   ```bash
   systemctl restart nginx
   ```

## Step 6: Configure Domain DNS

1. **Point your domain** to your Linode server IP
2. **Wait for DNS propagation** (can take up to 48 hours)
3. **Test your domain** in a browser

## Step 7: Monitor and Maintain

### Check Application Status

```bash
# Check running containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Update Application

1. **Pull latest changes**:

   ```bash
   git pull origin main
   ```

2. **Rebuild and redeploy**:
   ```bash
   ./scripts/deploy-linode.sh
   ```

### Backup Database

```bash
# Create backup
docker exec songcraft_db_1 pg_dump -U songcraft songcraft > backup.sql

# Restore backup
docker exec -i songcraft_db_1 psql -U songcraft songcraft < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port already in use**:

   ```bash
   # Check what's using the port
   netstat -tulpn | grep :80

   # Stop conflicting service
   systemctl stop nginx
   ```

2. **Docker permission issues**:

   ```bash
   # Add user to docker group
   usermod -aG docker $USER

   # Log out and back in
   ```

3. **Database connection issues**:

   ```bash
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs db

   # Test database connection
   docker exec -it songcraft_db_1 psql -U songcraft -d songcraft
   ```

### Performance Optimization

1. **Enable Docker BuildKit**:

   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Use multi-stage builds** (already implemented in Dockerfiles)

3. **Monitor resource usage**:
   ```bash
   docker stats
   htop
   ```

## Security Considerations

1. **Change default passwords** for all services
2. **Use strong SSH keys** instead of passwords
3. **Keep system updated** regularly
4. **Monitor logs** for suspicious activity
5. **Use fail2ban** to prevent brute force attacks
6. **Regular backups** of database and configuration files

## Cost Optimization

1. **Start with Nanode 1GB** for testing ($5/month)
2. **Upgrade to Linode 2GB** for production ($10/month)
3. **Use object storage** for file uploads if needed
4. **Monitor bandwidth usage** to avoid overage charges

## Support

If you encounter issues:

1. **Check the logs** using the commands above
2. **Review this guide** for common solutions
3. **Check Linode status** at status.linode.com
4. **Contact Linode support** for server-related issues

## Next Steps

After successful deployment:

1. **Set up monitoring** (e.g., UptimeRobot for uptime monitoring)
2. **Configure backups** (automated database backups)
3. **Set up CI/CD** for automated deployments
4. **Monitor performance** and optimize as needed
5. **Set up alerts** for critical issues

---

**Happy deploying! 🚀**

# PayBadge Deployment Guide

## Self-Hosting Options

### Option 1: Docker (Recommended)

The easiest way to self-host PayBadge is using Docker:

```bash
# Clone the repository
git clone <your-repo-url>
cd paybadge

# Build the Docker image
docker build -t paybadge .

# Run the container
docker run -p 3000:3000 paybadge
```

Or use the npm scripts:
```bash
pnpm run docker:build
pnpm run docker:run
```

### Option 2: Direct Node.js

```bash
# Install dependencies
pnpm install

# Start the server
pnpm start

# Or for development with auto-reload
pnpm run dev
```

### Option 3: Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  paybadge:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Then run:
```bash
docker-compose up -d
```

## Production Deployment

### Environment Variables

```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production         # Environment mode
```

### Reverse Proxy Setup (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static badge responses
        location ~* \.(svg)$ {
            proxy_pass http://localhost:3000;
            proxy_cache_valid 200 1h;
            add_header Cache-Control "public, max-age=3600";
        }
    }
}
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

## Cloud Deployment Options

### 1. DigitalOcean Droplet

```bash
# Create a $5/month droplet with Ubuntu
# SSH into the droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone and deploy
git clone <your-repo-url>
cd paybadge
docker build -t paybadge .
docker run -d -p 80:3000 --restart unless-stopped paybadge
```

### 2. Railway (Free Tier)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 3. Render (Free Tier)

1. Connect your GitHub repository to Render
2. Set build command: `pnpm install`
3. Set start command: `pnpm start`
4. Deploy automatically on git push

### 4. Fly.io (Free Tier)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Initialize and deploy
fly launch
fly deploy
```

## Updating Your README

Once deployed, update your README.md to use your self-hosted service:

```markdown
# Before (broken)
[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc%2Ceth%2Csol%2Cusdc)

# After (working)
[![Crypto Payment](https://your-domain.com/badge.svg)](https://your-domain.com/?tickers=btc%2Ceth%2Csol%2Cusdc)
```

## Monitoring and Maintenance

### Health Checks

The service includes a health endpoint at `/health`:

```bash
curl https://your-domain.com/health
```

### Logs

```bash
# Docker logs
docker logs <container-id>

# Follow logs
docker logs -f <container-id>
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker build -t paybadge .
docker stop <old-container>
docker run -d -p 80:3000 --restart unless-stopped paybadge
```

## Performance Optimization

### Caching

The service includes built-in caching:
- ETag headers for conditional requests
- Cache-Control headers for browser caching
- 1-hour cache duration for badges

### CDN (Optional)

For high traffic, consider using a CDN like Cloudflare:

1. Point your domain to Cloudflare
2. Enable caching for `/badge*.svg` routes
3. Set cache TTL to 1 hour

## Security Considerations

1. **Input Sanitization**: All user inputs are sanitized
2. **CORS**: Properly configured for README embedding
3. **Rate Limiting**: Consider adding rate limiting for production
4. **HTTPS**: Always use HTTPS in production
5. **Container Security**: Non-root user in Docker container

## Troubleshooting

### Badge Not Displaying in README

1. Check CORS headers: `curl -I https://your-domain.com/badge.svg`
2. Verify Content-Type: Should be `image/svg+xml`
3. Test direct access: Open badge URL in browser
4. Check GitHub's image proxy cache (may take time to update)

### Server Issues

1. Check health endpoint: `curl https://your-domain.com/health`
2. Review logs for errors
3. Verify port accessibility
4. Check firewall settings

### Performance Issues

1. Monitor response times
2. Check server resources (CPU, memory)
3. Consider adding a CDN
4. Implement rate limiting if needed

## Cost Estimation

### Free Options
- Railway: 500 hours/month free
- Render: 750 hours/month free
- Fly.io: 3 shared-cpu-1x VMs free

### Paid Options
- DigitalOcean Droplet: $5/month
- AWS EC2 t3.micro: ~$8/month
- Google Cloud Run: Pay per request (very cheap for badges)

## Support

For issues or questions:
1. Check the logs first
2. Review this deployment guide
3. Open an issue on GitHub
4. Check the API documentation at `/api`
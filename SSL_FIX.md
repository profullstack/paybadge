# SSL Certificate Fix for GitHub Pages Custom Domain

## The Problem

The badge isn't displaying because of an SSL certificate issue:

```bash
$ curl -I 'https://paybadge.profullstack.com/badge.svg'
curl: (60) SSL: no alternative certificate subject name matches target hostname 'paybadge.profullstack.com'
```

This means GitHub Pages hasn't properly configured the SSL certificate for the custom domain `paybadge.profullstack.com`.

## Solutions

### Option 1: Fix GitHub Pages SSL (Recommended)

1. **Check CNAME Configuration**
   - Ensure the `CNAME` file in the repository contains only: `paybadge.profullstack.com`
   - No `http://` or `https://` prefix, just the domain

2. **Verify DNS Settings**
   ```bash
   # Check if DNS is pointing to GitHub Pages
   dig paybadge.profullstack.com
   
   # Should show GitHub Pages IPs:
   # 185.199.108.153
   # 185.199.109.153
   # 185.199.110.153
   # 185.199.111.153
   ```

3. **GitHub Repository Settings**
   - Go to repository Settings → Pages
   - Ensure "Enforce HTTPS" is checked
   - Custom domain should show `paybadge.profullstack.com`
   - Wait for the green checkmark indicating SSL is ready

4. **Force SSL Certificate Renewal**
   - Remove the custom domain from GitHub Pages settings
   - Wait 5 minutes
   - Re-add the custom domain
   - Wait for SSL certificate to be issued (can take up to 24 hours)

### Option 2: Use GitHub Pages Default Domain (Immediate Fix)

Update the README to use the default GitHub Pages domain:

```markdown
# Before (broken SSL)
[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc%2Ceth%2Csol%2Cusdc)

# After (working)
[![Crypto Payment](https://profullstack.github.io/paybadge/badge.svg)](https://profullstack.github.io/paybadge/?tickers=btc%2Ceth%2Csol%2Cusdc)
```

### Option 3: Self-Host the Solution

Deploy the Hono.js server we created to a platform with proper SSL:

1. **Deploy to Railway (Free)**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Deploy
   railway login
   railway init
   railway up
   ```

2. **Deploy to Render (Free)**
   - Connect GitHub repository to Render
   - Set build command: `pnpm install`
   - Set start command: `pnpm start`
   - Get your Render URL (e.g., `https://paybadge-xyz.onrender.com`)

3. **Update README with new URL**
   ```markdown
   [![Crypto Payment](https://your-app.onrender.com/badge.svg)](https://your-app.onrender.com/?tickers=btc%2Ceth%2Csol%2Cusdc)
   ```

### Option 4: Use a Different Subdomain

If the current domain has persistent SSL issues:

1. **Change to a different subdomain**
   - Update CNAME to `badges.profullstack.com` or `crypto.profullstack.com`
   - Update DNS records accordingly
   - GitHub will issue a new SSL certificate

## Testing the Fix

Once SSL is working, test with:

```bash
# Should return 200 OK with proper headers
curl -I 'https://paybadge.profullstack.com/badge.svg'

# Should show the SVG content
curl 'https://paybadge.profullstack.com/badge.svg'
```

## Why This Happens

1. **DNS Propagation**: DNS changes can take 24-48 hours to fully propagate
2. **GitHub Pages SSL**: GitHub uses Let's Encrypt, which can take time to issue certificates
3. **Domain Verification**: GitHub needs to verify domain ownership before issuing SSL
4. **Caching**: Old SSL certificates might be cached by browsers/CDNs

## Prevention

1. **Always use HTTPS** in repository settings
2. **Wait for the green checkmark** before using the domain
3. **Test SSL** before updating documentation
4. **Monitor certificate expiry** (GitHub auto-renews, but issues can occur)

## Immediate Workaround

For immediate functionality, use the self-hosted Hono.js server:

```bash
# Start the server locally
pnpm start

# Test locally
curl http://localhost:3000/badge.svg

# Deploy to any platform with proper SSL
```

The server we built is production-ready and can be deployed anywhere with proper SSL certificates.
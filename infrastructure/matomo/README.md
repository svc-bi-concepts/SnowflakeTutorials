# Self-Hosted Matomo Analytics

Privacy-friendly, self-hosted analytics for the Snowflake documentation.

## Quick Start

### 1. Configure Environment

```bash
cd infrastructure/matomo

# Copy and edit the environment file
cp env.example .env

# Edit .env with secure passwords
nano .env  # or use your preferred editor
```

### 2. Start Matomo

```bash
docker compose up -d
```

### 3. Complete Setup

1. Open http://localhost:8080 in your browser
2. Follow the Matomo installation wizard:
   - Database server: `matomo-db`
   - Login: `matomo`
   - Password: (your MATOMO_DB_PASSWORD from .env)
   - Database name: `matomo`
3. Create your admin account
4. Add your documentation site:
   - Website name: `Snowflake Documentation`
   - Website URL: Your GitHub Pages URL (e.g., `https://your-org.github.io/SnowflakeTutorials/`)
5. Copy the **Site ID** (usually `1` for the first site)

### 4. Update Documentation Config

Edit `mkdocs.yml` and update the analytics section:

```yaml
extra:
  analytics:
    provider: matomo
    url: https://your-matomo-domain.com/  # Your Matomo URL (must end with /)
    site_id: 1  # The Site ID from Matomo
```

## Production Deployment

For production, you should:

### Add SSL/HTTPS (Required for Tracking)

If your documentation uses HTTPS (GitHub Pages does), your Matomo instance must also use HTTPS. Options:

#### Option A: Use a Reverse Proxy (Recommended)

Add Traefik or Nginx as a reverse proxy with Let's Encrypt SSL:

```yaml
# Add to docker-compose.yml
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_letsencrypt:/letsencrypt
    networks:
      - matomo-network

  matomo:
    # ... existing config ...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.matomo.rule=Host(`matomo.yourdomain.com`)"
      - "traefik.http.routers.matomo.entrypoints=websecure"
      - "traefik.http.routers.matomo.tls.certresolver=letsencrypt"
    ports: []  # Remove direct port mapping

volumes:
  traefik_letsencrypt:
```

#### Option B: Use Cloudflare Tunnel

Free, no need to open ports:

```bash
# Install cloudflared and create a tunnel
cloudflared tunnel create matomo
cloudflared tunnel route dns matomo matomo.yourdomain.com
```

### Configure Matomo for Privacy

After installation, go to **Administration → Privacy**:

1. ✅ Enable "Anonymize Visitors' IP addresses"
2. ✅ Enable "Support Do Not Track preference"
3. ✅ Consider enabling "Cookie-less tracking" (no consent banner needed!)

## Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f matomo

# Update Matomo
docker compose pull
docker compose up -d

# Backup database
docker exec matomo-db mysqldump -u matomo -p matomo > backup.sql
```

## Matomo vs Google Analytics

| Feature | Matomo (Self-Hosted) | Google Analytics |
|---------|---------------------|------------------|
| **Cost** | Free | Free |
| **Data Ownership** | 100% yours | Google's |
| **GDPR Compliance** | Built-in | Requires consent |
| **Cookie Consent** | Optional (cookie-less mode) | Required |
| **Real-time Data** | ✅ Yes | ✅ Yes |
| **Server Required** | Yes | No |

## Troubleshooting

### Tracking Not Working

1. Check browser console for errors
2. Verify Matomo URL uses HTTPS if your docs use HTTPS
3. Check if ad-blockers are blocking `matomo.js`
4. Verify the Site ID matches your configuration

### Database Connection Failed

```bash
# Check if database is running
docker compose ps

# Check database logs
docker compose logs matomo-db

# Restart services
docker compose restart
```


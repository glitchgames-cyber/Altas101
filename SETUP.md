# Setup Guide - India Tech Atlas

## Quick Start (Static Mode)

The application works completely offline using localStorage. Simply:

1. Open `index.html` in any modern web browser
2. All features are available immediately
3. No server setup required

## Full Setup (With Backend)

### Prerequisites

- PHP 7.4 or higher
- MySQL/MariaDB 5.7 or higher
- Apache/Nginx web server
- mod_rewrite enabled (Apache) or equivalent (Nginx)

### Step 1: Database Setup

```bash
# Create database
mysql -u root -p < database.sql

# Or manually:
mysql -u root -p
CREATE DATABASE india_tech_atlas;
USE india_tech_atlas;
SOURCE database.sql;
```

### Step 2: Configure PHP

Edit `config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'india_tech_atlas');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('APP_URL', 'https://yourdomain.com');
```

### Step 3: Server Configuration

#### Apache (.htaccess)

1. Rename `htaccess` to `.htaccess`
2. Ensure mod_rewrite is enabled
3. Restart Apache

#### Nginx

1. Copy `nginx.conf` to your sites-available
2. Update server_name and SSL paths
3. Reload Nginx: `sudo nginx -s reload`

#### IIS (Windows)

1. Copy `web.config` to your web root
2. Install URL Rewrite module
3. Configure SSL certificates

### Step 4: Run Installation

Visit `http://yourdomain.com/install.php` in your browser and follow the wizard.

### Step 5: Update Domain References

Replace `yourdomain.com` in:
- `sitemap.xml`
- `robots.txt`
- `rss.xml` / `rss.php`
- `config.php`

## File Structure

```
HGM/
├── HTML Files
│   ├── index.html, past.html, present.html, future.html
│   ├── games.html, login.html, vault.html
│   └── impossible.html, memory3d.html, reaction.html, puzzle.html
│
├── JavaScript
│   ├── script.js, games-hub.js, vault.js, logbook.js
│   ├── impossible.js, memory3d.js, reaction.js, puzzle.js
│   └── quiz-questions.json
│
├── PHP Backend (Optional)
│   ├── config.php - Configuration
│   ├── api.php - REST API endpoints
│   ├── install.php - Installation wizard
│   ├── export-data.php - Data export
│   └── backup-db.php - Database backup
│
├── Database
│   ├── database.sql - Schema and data
│   └── cron-jobs.sql - Scheduled tasks
│
├── Server Config
│   ├── .htaccess - Apache configuration
│   ├── nginx.conf - Nginx configuration
│   └── web.config - IIS configuration
│
├── SEO & Feeds
│   ├── sitemap.xml - Site map
│   ├── robots.txt - Search engine rules
│   └── rss.php - RSS feed generator
│
└── Utilities
    ├── deploy.sh / deploy.bat - Deployment scripts
    ├── .gitignore - Git ignore rules
    └── README.md - Documentation
```

## API Usage

### Get Quiz Questions

```javascript
fetch('/api/quiz/questions?category=past')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Create Entry

```javascript
fetch('/api/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Student Name',
    className: 'Grade 9'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Get Statistics

```javascript
fetch('/api/stats')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Maintenance

### Backup Database

```bash
php backup-db.php
# Or manually:
mysqldump -u user -p india_tech_atlas > backup.sql
```

### Export Data

```bash
# JSON format
curl "http://yourdomain.com/export-data.php?format=json&type=all"

# CSV format
curl "http://yourdomain.com/export-data.php?format=csv&type=entries" > export.csv
```

### Scheduled Tasks

Add to crontab:

```bash
# Daily cleanup
0 2 * * * mysql -u user -p database < cron-jobs.sql

# Weekly optimization
0 3 * * 0 mysql -u user -p database -e "OPTIMIZE TABLE logbook_entries, quiz_scores;"
```

## Security Checklist

- [ ] Update all `yourdomain.com` references
- [ ] Set strong database passwords
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Restrict access to `config.php` and `.htaccess`
- [ ] Set proper file permissions (644 for files, 755 for directories)
- [ ] Disable PHP error display in production
- [ ] Regularly backup database
- [ ] Keep PHP and MySQL updated

## Troubleshooting

### Database Connection Failed

- Check `config.php` credentials
- Verify MySQL service is running
- Check firewall settings
- Ensure database exists

### 404 Errors on API

- Verify mod_rewrite is enabled (Apache)
- Check `.htaccess` file exists
- Review server error logs

### CORS Issues

- Update `CORS_ALLOWED_ORIGINS` in `config.php`
- Check server headers configuration

## Support

For issues, check:
- Server error logs
- Browser console
- PHP error logs
- Database connection status


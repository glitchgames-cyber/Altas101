# India Tech Atlas

An interactive web application exploring India's technology ecosystem across past, present, and future eras.

## Features

- **Timeline Explorer**: Navigate through India's tech milestones
- **Interactive Games**: Quiz, memory, reaction, and puzzle games
- **Student Logbook**: Secure vault for tracking student interactions
- **3D Memory Matrix**: Spatial memory challenge with 3D cubes
- **Lightning Reflex**: Reaction time and speed game
- **Circuit Puzzle**: Logic and pathfinding puzzle
- **Quantum Collapse**: Challenging probability-based game

## Installation

### Quick Start (Static Mode)

1. Clone or download this repository
2. Open `index.html` in a web browser
3. All features work offline using localStorage

### Full Installation (With Backend)

1. **Database Setup**:
   ```bash
   # Create database
   mysql -u root -p < database.sql
   ```

2. **Configure PHP**:
   - Edit `config.php` with your database credentials
   - Update `APP_URL` with your domain

3. **Run Installation**:
   - Visit `install.php` in your browser
   - Follow the installation wizard

4. **Server Configuration**:
   - Rename `htaccess` to `.htaccess`
   - Ensure mod_rewrite is enabled
   - Configure PHP settings as needed

## File Structure

```
HGM/
├── index.html              # Main homepage
├── past.html               # Past Hub
├── present.html            # Present Pulse
├── future.html             # Future Forge
├── games.html              # Games Lab
├── login.html              # Student Logbook
├── vault.html              # Secure Vault
├── impossible.html         # Quantum Collapse game
├── memory3d.html           # 3D Memory Matrix
├── reaction.html           # Lightning Reflex
├── puzzle.html             # Circuit Puzzle
├── script.js               # Main scripts
├── games-hub.js            # Games hub logic
├── quiz-questions.json     # 50 quiz questions
├── config.php              # PHP configuration
├── api.php                 # REST API endpoints
├── database.sql             # Database schema
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine rules
├── .htaccess               # Apache configuration
└── service-worker.js       # PWA service worker
```

## API Endpoints

If using PHP backend:

- `GET /api/quiz/questions?category=past` - Get quiz questions
- `POST /api/quiz/score` - Submit quiz score
- `GET /api/entries` - Get logbook entries
- `POST /api/entries` - Create entry
- `DELETE /api/entries/{id}` - Delete entry
- `GET /api/stats` - Get statistics
- `GET /api/health` - Health check

## Configuration

### Update Domain

Replace `yourdomain.com` in:
- `sitemap.xml`
- `robots.txt`
- `config.php`
- `rss.xml`

### Database

Edit `config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'india_tech_atlas');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Security Notes

- Vault password is hashed using SHA-256
- All data stored locally (localStorage)
- No external API calls for sensitive data
- HTTPS recommended for production

## License

This project is for educational purposes.

## Support

For issues or questions, check the code comments or documentation.


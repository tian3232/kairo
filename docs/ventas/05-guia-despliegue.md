# Kairo — Guía de Despliegue

---

## Requisitos del Servidor

| Componente | Mínimo | Recomendado |
|---|---|---|
| **PHP** | 8.2 | 8.3 |
| **Node.js** | 18+ | 20 LTS |
| **Base de datos** | PostgreSQL 14+ | PostgreSQL 16 |
| **Redis** | Opcional | Redis 7+ (para cache/sessions) |
| **Web Server** | Apache con mod_rewrite | Nginx |
| **SSL** | Let's Encrypt | Certificado wildcard |
| **RAM** | 2 GB | 4 GB+ |
| **Disco** | 20 GB | 50 GB+ (considerando uploads de video) |

---

## Paso 1: Preparar el Servidor

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-pgsql \
    php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip \
    php8.2-gd php8.2-bcmath php8.2-intl php8.2-redis \
    postgresql redis-server nginx composer nodejs npm

# Habilitar PHP-FPM
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm
```

---

## Paso 2: Configurar la Base de Datos

```bash
# Crear base de datos y usuario
sudo -u postgres psql
CREATE USER kairo WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE kairo OWNER kairo;
GRANT ALL PRIVILEGES ON DATABASE kairo TO kairo;
\q
```

---

## Paso 3: Desplegar el Código

```bash
# Clonar repositorio
cd /var/www
git clone https://github.com/tu-usuario/kairo.git
cd kairo

# Instalar dependencias PHP
composer install --optimize-autoloader --no-dev

# Instalar dependencias Node
npm ci

# Compilar assets para producción
npm run build
```

---

## Paso 4: Configurar Laravel

```bash
# Copiar .env
cp .env.example .env

# Generar APP_KEY
php artisan key:generate

# Editar .env
nano .env
```

### Configuración mínima de `.env`:

```env
APP_NAME=Kairo
APP_ENV=production
APP_DEBUG=false
APP_URL=https://kairo.example.com

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kairo
DB_USERNAME=kairo
DB_PASSWORD=tu_password_seguro

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=tu_usuario
MAIL_PASSWORD=tu_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@kairo.example.com
MAIL_FROM_NAME="Kairo"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://kairo.example.com/auth/google/callback

# OpenAI (opcional, para subtítulos con IA)
OPENAI_API_KEY=
```

---

## Paso 5: Migraciones y Storage

```bash
# Ejecutar migraciones
php artisan migrate --force

# Crear symlink de storage
php artisan storage:link

# Crear directorios de almacenamiento
mkdir -p storage/app/public/{avatars,banners,covers,messages,comments,subtitles,videos,thumbnails}
```

---

## Paso 6: Optimizar para Producción

```bash
# Cache de configuración
php artisan config:cache

# Cache de rutas
php artisan route:cache

# Cache de vistas
php artisan view:cache

# Cache de eventos
php artisan event:cache

# Optimizar autoloader
composer dump-autoload --optimize --no-dev
```

---

## Paso 7: Configurar Cola de Trabajos

```bash
# Crear servicio systemd para la cola
sudo nano /etc/systemd/system/kairo-worker.service
```

```ini
[Unit]
Description=Kairo Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/kairo
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable kairo-worker
sudo systemctl start kairo-worker
```

---

## Paso 8: Configurar Nginx

```nginx
server {
    listen 80;
    server_name kairo.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kairo.example.com;
    root /var/www/kairo/public;

    ssl_certificate /etc/letsencrypt/live/kairo.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kairo.example.com/privkey.pem;

    index index.php;

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Assets estáticos (cache)
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Denegar acceso a archivos ocultos
    location ~ /\. {
        deny all;
    }
}
```

---

## Paso 9: Certificado SSL

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d kairo.example.com

# Auto-renovación
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Paso 10: Monitoreo

```bash
# Verificar estado
php artisan about
php artisan health:checked

# Monitorear logs
php artisan pail --level=error

# Verificar cola
php artisan queue:failed
```

---

## Comandos Útiles de Mantenimiento

```bash
# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Actualizar
git pull origin main
composer install --optimize-autoloader --no-dev
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Backup de base de datos
pg_dump -U kairo kairo > backup_$(date +%Y%m%d).sql
```

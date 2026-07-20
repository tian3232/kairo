# Kairo — Stack Tecnológico

---

## Resumen

Kairo utiliza las versiones más recientes de cada tecnología principal, garantizando compatibilidad a largo plazo, acceso a las últimas funciones y un ecosistema activo de soporte.

---

## Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| **Laravel** | ^12.0 | Framework PHP — routing, ORM, autenticación, queues, middleware |
| **PHP** | ^8.2 | Lenguaje del servidor — typed properties, enums, fibers |
| **PostgreSQL** | 16+ | Base de datos principal (SQLite para desarrollo) |
| **Laravel Socialite** | * | Autenticación OAuth (Google) |
| **Eloquent ORM** | — | ORM con relationships, eager loading, scopes |

---

## Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | ^19.0.0 | Biblioteca UI — componentes, hooks, concurrent features |
| **React DOM** | ^19.0.0 | Renderizado DOM |
| **Inertia.js** | ^2.0 | Puente SPA — routing server-side + experiencia SPA |
| **TypeScript** | ^5.7.2 | Type safety en todo el frontend |
| **Tailwind CSS** | ^4.0 | CSS utility-first con plugin Vite nativo |
| **Vite** | ^6.0 | Build tool y dev server — HMR instantáneo |
| **Ziggy** | ^2.4 | Uso de rutas Laravel en JavaScript/TypeScript |

---

## UI y Componentes

| Tecnología | Versión | Propósito |
|---|---|---|
| **Radix UI** | ^1.x / ^2.x | Primitivas accesibles (13 componentes) |
| **shadcn/ui** | — | Biblioteca de componentes base |
| **Headless UI** | ^2.2.0 | Componentes sin estilos (listbox, dialog, etc.) |
| **Lucide React** | ^0.475.0 | Biblioteca de iconos (475+ iconos) |

---

## Reproductor de Video

| Tecnología | Versión | Propósito |
|---|---|---|
| **Vidstack** | ^1.15.6 | Reproductor de video profesional |
| — | — | DefaultVideoLayout con controles nativos |
| — | — | Soporte de subtítulos VTT multilingüe |
| — | — | Marcadores de intro/credits para skip |

---

## Herramientas de Desarrollo

| Herramienta | Propósito |
|---|---|
| **ESLint** | Linting con plugins React, React Hooks, Tailwind |
| **Prettier** | Formateo de código con organize-imports |
| **Laravel Pint** | Formateo de código PHP (PSR-12) |
| **Pest PHP** | Framework de testing PHP |
| **Playwright** | Testing end-to-end |
| **Laravel Sail** | Entorno Docker de desarrollo |
| **Laravel Pail** | Streaming de logs en tiempo real |

---

## Servicios Externos

| Servicio | Propósito |
|---|---|
| **Google OAuth API** | Autenticación social |
| **OpenAI API** | Generación de subtítulos con IA |
| **Whisper (local)** | Generación de subtítulos offline con Python |
| **Mailtrap** | Testing de emails en desarrollo |

---

## Infraestructura de Build

### Code Splitting (Vite Manual Chunks)

```
vendor-react     → 145 KB (React, ReactDOM, Inertia)  — compartido
vendor-vidstack  → 317 KB (reproductor de video)      — lazy
vendor-zxcvbn    → 1659 KB (fortaleza de contraseña)  — lazy
app              → 187 KB (código principal)
site-layout      → 50 KB (layout compartido)
```

### Optimizaciones de Rendimiento

- **Eager loading** en consultas N+1 (comments, likes, replies)
- **select()** específico en queries del home (evita cargar synopsis innecesariamente)
- **Lazy loading** de imágenes below-the-fold
- **Precarga** de imágenes del hero carousel (next/prev)
- **React.memo** en tarjetas de anime y episodios
- **useCallback** en funciones de scroll y eventos
- **Polling optimizado**: 1 endpoint liviano cada 10s vs 2 endpoints pesados cada 8s
- **Componentes memoizados** (AnimeCard, EpisodeCard, ContentRow)

---

## Arquitectura de Aplicación

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│  ┌──────────────────────────────────────────────┐   │
│  │            React 19 (SPA)                    │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │  Pages  │ │Components│ │   Layouts    │  │   │
│  │  │  (44)   │ │   (67)   │ │    (4)       │  │   │
│  │  └─────────┘ └──────────┘ └──────────────┘  │   │
│  │              ┌──────────────┐                │   │
│  │              │   Inertia    │                │   │
│  │              │    Client    │                │   │
│  │              └──────┬───────┘                │   │
│  └─────────────────────┼────────────────────────┘   │
│                        │ HTTP (JSON)                │
│  ┌─────────────────────┼────────────────────────┐   │
│  │              Laravel 12 (PHP)                 │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │ Routes  │ │Controllers│ │   Models     │  │   │
│  │  │ (100+)  │ │   (44)   │ │    (26)      │  │   │
│  │  └─────────┘ └──────────┘ └──────────────┘  │   │
│  │              ┌──────────────┐                │   │
│  │              │    Eloquent   │                │   │
│  │              │     ORM       │                │   │
│  │              └──────┬───────┘                │   │
│  └─────────────────────┼────────────────────────┘   │
│                        │ SQL                        │
│  ┌─────────────────────┼────────────────────────┐   │
│  │           PostgreSQL / SQLite                 │   │
│  │              (47 migrations)                  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Base de Datos — Modelos (26)

```
User ─────┬── UserAnimeList (watchlist/favorites)
          ├── UserList ──── UserListItem
          ├── Comment ──── CommentLike
          │              ├── CommentReport
          │              └── Comment (replies)
          ├── Message
          ├── Notification
          ├── Friendship
          ├── Rating
          ├── EpisodeFavorite
          ├── WatchProgress
          ├── UserPlaybackPreference
          └── ProfileComment

Anime ────┬── Season ──── Episode ──── Subtitle
          ├── Genre (pivot: anime_genre)
          ├── Studio
          ├── Character
          ├── AnimeRelation
          ├── HeroBanner
          └── AuditLog
```

---

## Variables de Entorno Requeridas

```env
APP_NAME=Kairo
APP_ENV=production
APP_KEY=base64:...
APP_URL=https://kairo.example.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kairo
DB_USERNAME=secret
DB_PASSWORD=secret

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=587

OPENAI_API_KEY=...
```

# Kairo — Arquitectura del Sistema

---

## Visión General

Kairo sigue la arquitectura **Monolith** con separación clara entre frontend y backend comunicándose via **Inertia.js** (protocolo JSON sobre HTTP). Cada navegación es una request server-side que renderiza un componente React en el cliente.

---

## Capas de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│                       PRESENTACIÓN                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  React 19 + TypeScript                │  │
│  │                                                       │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐  │  │
│  │  │  Pages  │  │Components│  │      Layouts        │  │  │
│  │  │   44    │  │    67    │  │  Site / Admin / Auth │  │  │
│  │  └────┬────┘  └────┬─────┘  └──────────┬──────────┘  │  │
│  │       └─────────────┼──────────────────┘             │  │
│  │                     ▼                                │  │
│  │              Inertia Client                          │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │ HTTP (Inertia Protocol)           │
├────────────────────────┼───────────────────────────────────┤
│                        │        LÓGICA                     │
│  ┌─────────────────────┼────────────────────────────────┐  │
│  │                 Laravel 12                            │  │
│  │                                                       │  │
│  │  ┌──────────┐  ┌────────────┐  ┌─────────────────┐   │  │
│  │  │  Routes  │  │ Controllers│  │   Middleware     │   │  │
│  │  │  (100+)  │  │    (44)    │  │  auth,admin,etc │   │  │
│  │  └────┬─────┘  └─────┬──────┘  └─────────────────┘   │  │
│  │       └───────────────┼───────────────────────┐       │  │
│  │                       ▼                       ▼       │  │
│  │              ┌─────────────┐          ┌────────────┐   │  │
│  │              │   Eloquent  │          │  Services  │   │  │
│  │              │    (26)     │          │ Socialite  │   │  │
│  │              └──────┬──────┘          │ OpenAI     │   │  │
│  │                     │                 │ Whisper    │   │  │
│  └─────────────────────┼─────────────────┴────────────┘   │
│                        │ SQL                              │
├────────────────────────┼───────────────────────────────────┤
│                        │        DATOS                     │
│  ┌─────────────────────┼────────────────────────────────┐  │
│  │              PostgreSQL / SQLite                      │  │
│  │                   (47 tablas)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Redis (cache, sessions, queue)           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Storage (filesystem)                     │  │
│  │  avatars / covers / banners / videos / subtitles     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Directorios

```
kairo/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/              # 12 controladores admin
│   │   │   ├── Auth/               # 6 controladores auth
│   │   │   ├── Settings/           # 2 controladores settings
│   │   │   └── *.php               # 24 controladores principales
│   │   └── Middleware/
│   └── Models/                     # 26 modelos Eloquent
├── database/
│   └── migrations/                 # 47 migraciones
├── lang/
│   └── es/                         # Traducciones español
├── resources/
│   ├── css/
│   │   └── app.css                 # Tailwind + custom CSS
│   ├── js/
│   │   ├── app.tsx                 # Entry point
│   │   ├── components/             # 67 componentes React
│   │   ├── layouts/                # 4 layouts (site, admin, auth, legal)
│   │   ├── lib/                    # Utilidades (imageUrl, etc.)
│   │   └── pages/                  # 44 páginas
│   │       ├── anime/              # show
│   │       ├── auth/               # login, register, forgot-password, etc.
│   │       ├── messages/           # index
│   │       ├── profile/            # show
│   │       ├── settings/           # profile, password, appearance, playback, sessions
│   │       ├── user/               # watchlist, favorites, history, lists, calendar
│   │       ├── watch/              # show (player)
│   │       ├── admin/              # 13 páginas admin
│   │       └── legal/              # terms, privacy, dmca
│   └── views/
├── routes/
│   ├── web.php                     # Rutas principales
│   ├── auth.php                    # Rutas de autenticación
│   └── settings.php                # Rutas de configuración
├── storage/app/public/             # Archivos subidos
├── public/build/                   # Assets compilados
├── vite.config.js                  # Configuración Vite
├── tailwind.config.js              # Configuración Tailwind
└── composer.json / package.json    # Dependencias
```

---

## Flujo de una Navegación

```
1. Usuario hace click en un Link
          │
          ▼
2. Inertia Client envía GET /anime/one-piece
          │
          ▼
3. Laravel Router resuelve la ruta
          │
          ▼
4. Middleware: auth → verified → admin (si aplica)
          │
          ▼
5. Controller::show() ejecuta queries con eager loading
          │
          ▼
6. Inertia::render('anime/show', $data) serializa a JSON
          │
          ▼
7. Respuesta HTTP con header X-Inertia
          │
          ▼
8. Inertia Client recibe JSON, resuelve el componente page
          │
          ▼
9. React renderiza <AnimeShowPage data={...} />
          │
          ▼
10. Sin recarga completa de página — transición suave
```

---

## Modelo de Datos Principal

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│     User     │────▶│  UserAnimeList   │◀────│     Anime    │
│              │     │ (watchlist/      │     │              │
│              │     │  favorite)       │     │              │
│              │     └─────────────────┘     └──────┬───────┘
│              │                                     │
│              │     ┌─────────────────┐             │
│              │────▶│    UserList     │             │
│              │     │ (custom lists)  │             │
│              │     └────────┬────────┘             │
│              │              │                      │
│              │     ┌────────▼────────┐             │
│              │     │  UserListItem   │─────────────┘
│              │     └─────────────────┘
│              │
│              │     ┌─────────────────┐     ┌──────────────┐
│              │────▶│    Comment      │────▶│ CommentLike  │
│              │     │ (anime/episode/ │     └──────────────┘
│              │     │  profile)       │     ┌──────────────┐
│              │     │                 │────▶│CommentReport │
│              │     └─────────────────┘     └──────────────┘
│              │
│              │     ┌─────────────────┐
│              │────▶│    Message      │
│              │     │ (direct msgs)   │
│              │     └─────────────────┘
│              │
│              │     ┌─────────────────┐
│              │────▶│  Friendship     │
│              │     │ (friend system) │
│              │     └─────────────────┘
│              │
│              │     ┌─────────────────┐
│              │────▶│  Notification   │
│              │     └─────────────────┘
│              │
│              │     ┌─────────────────┐
│              │────▶│  WatchProgress  │
│              │     │ (resume point)  │
│              │     └─────────────────┘
└──────────────┘

┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│     Anime    │────▶│     Season      │────▶│   Episode    │
│              │     └─────────────────┘     └──────┬───────┘
│              │                                     │
│              │     ┌─────────────────┐             │
│              │────▶│     Genre       │             │
│              │     │ (pivot table)   │             │
│              │     └─────────────────┘             │
│              │                                     │
│              │     ┌─────────────────┐     ┌───────▼──────┐
│              │────▶│     Studio      │     │  Subtitle    │
│              │     └─────────────────┘     └──────────────┘
│              │
│              │     ┌─────────────────┐
│              │────▶│  HeroBanner     │
│              │     └─────────────────┘
│              │
│              │     ┌─────────────────┐
│              │────▶│Character (pivot)│
│              │     └─────────────────┘
└──────────────┘
```

---

## Patrones de Arquitectura

| Patrón | Implementación |
|---|---|
| **SPA sin API** | Inertia.js server-side rendering con client-side navigation |
| **Repository Pattern** | Eloquent models como repositories |
| **Service Layer** | Socialite, OpenAI, Whisper como servicios externos |
| **Observer Pattern** | Eventos de notificación en actions de usuario |
| **Middleware Pipeline** | auth → verified → admin para protección de rutas |
| **Eager Loading** | Resolución de N+1 en comentarios (likes, replies, user_liked) |
| **Queue Workers** | Jobs para procesamiento pesado (subtítulos, emails) |
| **Code Splitting** | Manual chunks en Vite para carga lazy de video y zxcvbn |

---

## Seguridad

| Capa | Medida |
|---|---|
| **Autenticación** | Bcrypt (12 rounds), sesiones database-backed |
| **Autorización** | Roles (user/admin/owner), middleware admin |
| **CSRF** | Tokens de formulario + meta tag + Inertia |
| **XSS** | React auto-escaping + CSP headers |
| **Rate Limiting** | En autenticación, verificación, búsqueda |
| **SQL Injection** | Eloquent parameterized queries |
| **Upload Validation** | Mimes, max size, storage isolation |
| **OAuth** | Google Socialite con email verification |

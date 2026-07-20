# Kairo — Características Completas

---

## 1. Streaming y Reproductor

| Funcionalidad | Descripción |
|---|---|
| **Reproductor HD** | Vidstack con layout completo, controles nativos de calidad |
| **Guardado automático** | Posición de visualización guardada, retoma desde donde quedó |
| **Skip de intro** | Marcadores `intro_start` / `intro_end` para saltar opening |
| **Skip de créditos** | Marcador `credits_start` para avanzar al final |
| **Auto-advance** | Siguiente episodio automático al terminar |
| **Navegación cross-season** | Saltos inteligentes entre temporadas |
| **Subtítulos multilingüe** | Soporte VTT en japonés, inglés y español |
| **Preferencias de playback** | Configuración individual por usuario |
| **Like/Dislike por episodio** | Reacción granular por episodio |

---

## 2. Descubrimiento de Contenido

| Funcionalidad | Descripción |
|---|---|
| **Hero Banner Carousel** | Carrusel automático con duración configurable y precarga de imágenes |
| **Tendencias** | Anime ordenados por vistas |
| **Nuevos Episodios** | Feed de los últimos episodios por fecha de lanzamiento |
| **Filas por Género** | Scroll horizontal por género (limitado a 8 géneros) |
| **Continue Watching** | Barra de progreso con porcentaje para usuarios logueados |
| **Recomendaciones** | Motor basado en géneros favoritos e historial |
| **Explorar** | Catálogo completo con filtros: texto, género, tipo, estado, año, orden |
| **Búsqueda Global** | API en tiempo real con debounce de 300ms |
| **Simulcast** | Navegación por temporada (Invierno/Primavera/Verano/Otoño) con navegación de años |

---

## 3. Perfiles de Usuario

| Funcionalidad | Descripción |
|---|---|
| **Avatar y Bio** | Subida de avatar + biografía personal |
| **Nombre de usuario** | @username único con validación en tiempo real |
| **Estadísticas** | Comentarios, likes, listas, amigos |
| **Feed de actividad** | Comentarios recientes en anime |
| **Control de privacidad** | 7 toggles individuales para perfil público |

### Controles de Privacidad

1. Mostrar Lista de Seguimiento
2. Mostrar Favoritos
3. Mostrar Listas Personalizadas
4. Mostrar Actividad
5. Mostrar Amigos
6. Permitir Comentarios
7. Mostrar Estadísticas

---

## 4. Listas y Organización

| Funcionalidad | Descripción |
|---|---|
| **Lista de Seguimiento** | Add/remove rápido desde cualquier anime |
| **Favoritos** | Toggle de favorito desde cualquier tarjeta |
| **Listas Personalizadas** | CRUD completo: crear, renombrar, eliminar |
| **Cover de lista** | Imagen de portada personalizada por lista |
| **Reordenar listas** | Posición configurable |
| **Reordenar animes** | Posición de animes dentro de cada lista |
| **Toggle rápido** | API para agregar/quitar anime de lista sin recargar |

---

## 5. Funcionalidades Sociales

### Sistema de Amigos
- Enviar solicitudes de amistad
- Aceptar / Rechazar solicitudes
- Eliminar amigos
- Lista de amigos en perfil

### Mensajería Directa
- Conversaciones 1-a-1 (solo entre amigos)
- Texto (hasta 5000 caracteres)
- Adjuntos de imagen (JPEG, PNG, GIF, WebP — hasta 5MB)
- Edición de mensajes con timestamp
- Eliminar para mí / para todos
- Estados: enviado, entregado, leído
- Contador de mensajes no leídos
- Lista de conversaciones con preview del último mensaje

### Sistema de Comentarios
- Comentarios en páginas de anime Y episodios
- Comentarios en perfiles de usuario
- Adjuntos de imagen
- Opciones de alineación de texto
- Respuestas anidadas (hilos)
- Like / Dislike (pulgar arriba/abajo)
- Edición y eliminación
- Reporte de contenido inapropiado
- Moderación por administrador (visibilidad)

### Notificaciones
- Solicitud de amistad
- Amistad aceptada
- Comentario en perfil
- Marcar como leída / Marcar todo leído
- Aceptar/Rechazar desde la notificación
- Badge de no leídas

---

## 6. Sistema de Calificación

| Funcionalidad | Descripción |
|---|---|
| **Escala 1-10** | Calificación numérica por anime |
| **Promedio automático** | Recalculado automáticamente |
| **Conteo de calificaciones** | Cantidad de usuarios que calificaron |
| **Componente visual** | Estrellas interactivas |

---

## 7. Calendario

| Funcionalidad | Descripción |
|---|---|
| **Mi Calendario** | Calendario personal de anime del usuario |
| **Calendario Público** | Calendario general de anime próximos |

---

## 8. Panel de Administración

### Dashboard
- Estadísticas generales (animes, usuarios, episodios, vistas)
- Animes recientes
- Usuarios recientes

### Estadísticas
- Animes por estado (emisión/finalizado/próximo)
- Animes por tipo (TV/OVA/ONA/Película/Especial)
- Usuarios totales / nuevos del mes
- Total episodios
- Vistas totales / vistas hoy
- Comentarios totales / ocultos
- Top 5 animes más vistos
- Actividad de auditoría reciente

### Gestión de Contenido
- **Anime CRUD**: Crear, editar, eliminar con campos completos
- **Temporadas**: Crear, editar, eliminar por anime
- **Episodios**: Crear, actualizar, eliminar con campos detallados
- **Géneros**: CRUD completo
- **Estudios**: CRUD completo
- **Banners**: Crear, activar/desactivar, reordenar con drag-and-drop

### Gestión de Usuarios
- Ver todos los usuarios
- Cambiar roles (user/admin)
- Eliminar usuarios

### Moderación de Comentarios
- Ver todos los comentarios
- Panel de reportes
- Resolver / Descartar reportes
- Toggle de visibilidad
- Eliminar comentarios

### Carga de Medios
- Upload de imágenes (covers, banners, avatars)
- Upload de videos (episodios)

### Gestión de Subtítulos
- Generación automática con Whisper (local) y OpenAI API
- Upload manual de archivos VTT
- Eliminar subtítulos

### Registro de Auditoría
- Trail completo de acciones de administrador
- Viewer paginado de logs de auditoría

### Soporte
- Ver mensajes de soporte
- Marcar como leído
- Eliminar mensajes

---

## 9. Autenticación y Seguridad

| Funcionalidad | Descripción |
|---|---|
| **Registro email/password** | Con verificación de email obligatoria |
| **Google OAuth** | Login con Google via Socialite |
| **Selección de username** | Flujo para nuevos usuarios de Google |
| **Recuperación de contraseña** | Via email con enlace temporal |
| **Confirmación de contraseña** | Para acciones sensibles |
| **Estimación de fortaleza** | zxcvbn-ts en registro y cambio de contraseña |
| **Control de roles** | user, admin, owner |
| **Gestión de sesiones** | Ver/anular sesiones activas |
| **CSRF Protection** | Protección Laravel integrada |
| **Rate Limiting** | Limitación en emails de verificación |

---

## 10. Páginas Legales y Soporte

| Página | Descripción |
|---|---|
| Términos de Servicio | 11 secciones completas |
| Política de Privacidad | 11 secciones completas |
| Política DMCA | Reporte, proceso y contra-notificación |
| Widget de Soporte | Formulario accesible desde cualquier página |

# Rutas Disponibles - Mood Music API v1

## Autenticación (`/api/v1/auth`)

### Públicas

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| POST | `/register` | Crear nuevo usuario | `{ username, email, password, displayName? }` |
| POST | `/login` | Iniciar sesión | `{ identifier (email/username), password }` |
| POST | `/refresh` | Refrescar access token | `{ refreshToken }` |
| POST | `/logout` | Cerrar sesión | (sin body - solo elimina token en cliente) |

**Respuestas de autenticación:**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "displayName": "string",
    "avatarUrl": "url | null",
    "createdAt": "ISO8601"
  },
  "accessToken": "JWT",
  "refreshToken": "JWT"
}
```

---

## Catálogo (`/api/v1/catalog`)

### Públicas - Home

| Método | Ruta | Descripción | Query Params |
|--------|------|-------------|--------------|
| GET | `/home` | Dashboard inicial con trending songs, moods, playlists | - |

**Respuesta:**
```json
{
  "trendingSongs": [...],
  "moods": [...],
  "publicPlaylists": [...],
  "artists": [...],
  "plans": [...]
}
```

### Públicas - Canciones

| Método | Ruta | Descripción | Query Params |
|--------|------|-------------|--------------|
| GET | `/songs` | Listar todas las canciones | `limit=10&offset=0&sort=popular&search?&artistId?&albumId?&genreId?&moodId?` |
| GET | `/songs/search` | Buscar canciones | `q=string&limit=20` |
| GET | `/songs/:id` | Obtener canción por ID | - |
| GET | `/songs/:id/genres` | Géneros de una canción | - |
| GET | `/songs/:id/moods` | Moods de una canción | - |
| GET | `/songs/artist/:artistId` | Canciones de un artista | `limit=10&offset=0&sort=popular` |

### Públicas - Artistas

| Método | Ruta | Descripción | Query Params |
|--------|------|-------------|--------------|
| GET | `/artists` | Listar artistas | `limit=20&offset=0&search?&sort=popular` |
| GET | `/artists/:id` | Obtener artista por ID | - |
| GET | `/artists/:id/albums` | Álbumes de un artista | `limit=20&offset=0` |
| GET | `/artists/:id/songs` | Canciones de un artista | - |

### Públicas - Álbumes

| Método | Ruta | Descripción | Query Params |
|--------|------|-------------|--------------|
| GET | `/albums` | Listar álbumes | `limit=20&offset=0&search?&artistId?&sort=newest` |
| GET | `/albums/:id` | Obtener álbum por ID | - |
| GET | `/albums/:id/songs` | Canciones de un álbum | - |

### Públicas - Géneros

| Método | Ruta | Descripción | 
|--------|------|-------------|
| GET | `/genres` | Listar todos los géneros |
| GET | `/genres/:id` | Obtener género por ID |
| GET | `/genres/:id/songs` | Canciones de un género | 

### Públicas - Moods

| Método | Ruta | Descripción | Query Params |
|--------|------|-------------|--------------|
| GET | `/moods` | Listar todos los moods | - |
| GET | `/moods/:id` | Obtener mood por ID | - |
| GET | `/moods/:id/songs` | Canciones de un mood | `limit=50&offset=0` |

---

## Búsqueda Global (`/api/v1/search`)

### Públicas

| Método | Ruta | Descripción | Query Params |
|--------|------|-------------|--------------|
| GET | `/` | Búsqueda global (canciones, artistas, playlists) | `q=string (requerido)&limit=20` |

**Respuesta:**
```json
{
  "data": [
    {
      "entityType": "song|artist|playlist",
      "entityId": "uuid",
      "primaryText": "string",
      "secondaryText": "string",
      "imageUrl": "url",
      "popularity": "number"
    }
  ],
  "meta": {
    "query": "string",
    "count": "number"
  }
}
```

---

## Playlists (`/api/v1/playlists`)

### Públicas

| Método | Ruta | Descripción | 
|--------|------|-------------|
| GET | `/` | Listar playlists públicas | 
| GET | `/:id` | Obtener playlist por ID | 

### Protegidas (requieren JWT)

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| GET | `/user/my-playlists` | Mis playlists | - |
| POST | `/` | Crear nueva playlist | `{ name, description?, coverUrl?, visibility?, moodId? }` |
| PUT | `/:id` | Actualizar playlist | `{ name?, description?, coverUrl?, visibility?, moodId? }` |
| DELETE | `/:id` | Eliminar playlist | - |
| POST | `/:id/songs` | Agregar canción a playlist | `{ songId }` |
| DELETE | `/:id/songs/:songId` | Remover canción de playlist | - |
| PATCH | `/:id/songs/reorder` | Reordenar canción en playlist | `{ songId, newPosition }` |

---

## Canciones Favoritas (`/api/v1/liked-songs`)

### Protegidas (requieren JWT)

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| GET | `/` | Mis canciones favoritas | - |
| GET | `/:songId` | ¿Está la canción marcada como favorita? | - |
| POST | `/` | Marcar canción como favorita | `{ songId }` |
| DELETE | `/:songId` | Desmarcar canción como favorita | - |

---

## Perfil de Usuario (`/api/v1/me`)

### Protegidas (requieren JWT)

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| GET | `/profile` | Obtener perfil del usuario actual | - |
| PUT | `/profile` | Actualizar perfil | `{ displayName?, avatarUrl?, bio?, country?, preferredLanguage?, dateOfBirth? }` |
| GET | `/preferences` | Obtener preferencias del usuario | - |
| PUT | `/preferences` | Actualizar preferencias | `{ streamQuality?, downloadQuality?, eqLow?, eqMid?, eqHigh?, showExplicit?, autoplay?, crossfadeMs? }` |
| GET | `/player-state` | Obtener estado del reproductor guardado | - |
| PUT | `/player-state` | Guardar estado del reproductor | `{ currentSongId?, positionS, repeat, shuffle, volume }` |
| GET | `/downloads` | Mis descargas | - |
| POST | `/downloads` | Descargar canción | `{ songId, quality?, fileSizeBytes?, localPath?, status?, downloadedAt?, expiresAt? }` |
| GET | `/downloads/:id` | Obtener descarga específica | - |
| PUT | `/downloads/:id` | Actualizar descarga | `{ quality?, fileSizeBytes?, localPath?, status?, downloadedAt?, expiresAt? }` |
| DELETE | `/downloads/:id` | Eliminar descarga | - |
| GET | `/listening-history` | Mi historial de reproducción | `limit=20&offset=0` |
| POST | `/listening-history` | Registrar que escuché una canción | `{ songId, durationS, completed?, sourceType?, moodId? }` |

---

## Artistas (`/api/v1/artists`)

### Públicas

| Método | Ruta | Descripción | Query Params |
|--------|------|-------------|--------------|
| GET | `/` | Listar artistas | `limit=20&offset=0&search?&sort=popular` |
| GET | `/:id` | Obtener artista | - |
| GET | `/:id/songs` | Canciones del artista | - |
| GET | `/:id/albums` | Álbumes del artista | - |

---

## Headers Requeridos para Rutas Protegidas

```
Authorization: Bearer <accessToken>
```

Ejemplo:
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3000/api/v1/me/profile
```

---

## Códigos de Respuesta HTTP

| Código | Descripción |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado |
| `204` | No Content - Solicitud exitosa sin respuesta |
| `400` | Bad Request - Datos inválidos |
| `401` | Unauthorized - JWT faltante/inválido |
| `403` | Forbidden - Sin permisos |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - El recurso ya existe |
| `500` | Internal Server Error - Error del servidor |

---

## Errores Comunes

### Error de autenticación
```json
{
  "error": "El header Authorization debe usar Bearer token"
}
```

### Error de validación
```json
{
  "error": "validation_error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### Credenciales inválidas
```json
{
  "error": "Credenciales inválidas"
}
```

---

## Datos de Prueba

Se incluye archivo `SEED_TEST_DATA.sql` con 3 usuarios:
- **juantest** / juan@test.com (contraseña: para testing)
- **mariatest** / maria@test.com 
- **carlostest** / carlos@test.com

Con 10 canciones, 6 artistas, 4 playlists y datos de prueba para todas las features.

**Ejecutar seed:**
```bash
psql -U usuario -d mood_music -f SEED_TEST_DATA.sql
```

---

## Ejemplo de Flujo Completo

### 1. Registrarse
```bash
POST /api/v1/auth/register
{
  "username": "nuevouser",
  "email": "nuevo@test.com",
  "password": "password123",
  "displayName": "Nuevo Usuario"
}
```

### 2. Login
```bash
POST /api/v1/auth/login
{
  "identifier": "nuevouser",
  "password": "password123"
}
```

Respuesta contiene `accessToken` y `refreshToken`

### 3. Usar el token para acceder a rutas protegidas
```bash
GET /api/v1/me/profile
Authorization: Bearer <accessToken>
```

### 4. Buscar canciones
```bash
GET /api/v1/search?q=Blinding+Lights
```

### 5. Marcar como favorita
```bash
POST /api/v1/liked-songs
Authorization: Bearer <accessToken>
{
  "songId": "850e8400-e29b-41d4-a716-446655440001"
}
```

### 6. Crear playlist
```bash
POST /api/v1/playlists
Authorization: Bearer <accessToken>
{
  "name": "Mi Playlist",
  "description": "Mis mejores canciones",
  "visibility": "public"
}
```

### 7. Agregar canción a playlist
```bash
POST /api/v1/playlists/{playlistId}/songs
Authorization: Bearer <accessToken>
{
  "songId": "850e8400-e29b-41d4-a716-446655440001"
}
```

---

## Nota Importante

- El JWT se envía en la respuesta de login/register
- **El cliente debe almacenar el JWT** (localStorage, sessionStorage, cookies seguras)
- El servidor **NO almacena el JWT en BD**, solo valida por firma
- El refresh token se envía en cada request para obtener uno nuevo
- La validación se realiza por firma de JWT, no por consulta a BD

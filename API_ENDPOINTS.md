# API Endpoints Reference

## 🎵 Artists (`/api/v1/artists`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener todos los artistas | ❌ |
| GET | `/:id` | Obtener artista por ID | ❌ |
| POST | `/` | Crear nuevo artista | ✅ |
| PUT | `/:id` | Actualizar artista | ✅ |
| DELETE | `/:id` | Eliminar artista | ✅ |

### Ejemplos

```bash
# GET all artists
curl http://localhost:3000/api/v1/artists?limit=50&offset=0

# GET artist
curl http://localhost:3000/api/v1/artists/123e4567-e89b-12d3-a456-426614174000

# CREATE artist
curl -X POST http://localhost:3000/api/v1/artists \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Los Beatles",
    "imageUrl": "https://example.com/beatles.jpg"
  }'

# UPDATE artist
curl -X PUT http://localhost:3000/api/v1/artists/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{ "name": "The Beatles Updated" }'

# DELETE artist
curl -X DELETE http://localhost:3000/api/v1/artists/123e4567-e89b-12d3-a456-426614174000
```

---

## 🎶 Songs (`/api/v1/songs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener todas las canciones | ❌ |
| GET | `/:id` | Obtener canción con relaciones | ❌ |
| GET | `/artist/:artistId` | Obtener canciones por artista | ❌ |
| GET | `/search?q=query` | Buscar canciones por título | ❌ |
| POST | `/` | Crear nueva canción | ✅ |
| PUT | `/:id` | Actualizar canción | ✅ |
| DELETE | `/:id` | Eliminar canción | ✅ |
| GET | `/:id/genres` | Obtener géneros de canción | ❌ |
| POST | `/:id/genres` | Agregar género a canción | ✅ |
| DELETE | `/:id/genres/:genreId` | Eliminar género de canción | ✅ |
| GET | `/:id/moods` | Obtener moods de canción | ❌ |
| POST | `/:id/moods` | Agregar mood a canción | ✅ |
| DELETE | `/:id/moods/:moodId` | Eliminar mood de canción | ✅ |

### Ejemplos

```bash
# GET all songs
curl http://localhost:3000/api/v1/songs?limit=50&offset=0

# GET song with relations
curl http://localhost:3000/api/v1/songs/123e4567-e89b-12d3-a456-426614174000

# SEARCH songs
curl http://localhost:3000/api/v1/songs/search?q=imagine

# CREATE song
curl -X POST http://localhost:3000/api/v1/songs \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "song-uuid.mp3",
    "filePath": "music/song-uuid.mp3",
    "title": "Imagine",
    "artistId": "artist-uuid",
    "durationS": 183.12
  }'

# ADD genre to song
curl -X POST http://localhost:3000/api/v1/songs/123e4567/genres \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "genreId": "genre-uuid" }'

# ADD mood to song
curl -X POST http://localhost:3000/api/v1/songs/123e4567/moods \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "moodId": "mood-uuid", "score": 0.95 }'
```

---

## 😊 Moods (`/api/v1/moods`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener todos los moods | ❌ |
| GET | `/:id` | Obtener mood por ID | ❌ |
| GET | `/:id/songs` | Obtener canciones por mood | ❌ |
| POST | `/` | Crear nuevo mood | ✅ |
| PUT | `/:id` | Actualizar mood | ✅ |
| DELETE | `/:id` | Eliminar mood | ✅ |

### Ejemplos

```bash
# GET all moods
curl http://localhost:3000/api/v1/moods

# GET songs for mood
curl http://localhost:3000/api/v1/moods/mood-uuid/songs?limit=50

# CREATE mood
curl -X POST http://localhost:3000/api/v1/moods \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "chill",
    "displayName": "Chill Vibes",
    "iconName": "spa",
    "gradientStart": "#FF6B6B",
    "gradientEnd": "#4ECDC4"
  }'
```

---

## ❤️ Liked Songs (`/api/v1/liked-songs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener mis canciones favoritas | ✅ |
| GET | `/:songId` | Verificar si canción está marcada | ✅ |
| POST | `/` | Marcar canción como favorita | ✅ |
| DELETE | `/:songId` | Desmarcar canción favorita | ✅ |

### Ejemplos

```bash
# GET my liked songs
curl http://localhost:3000/api/v1/liked-songs \
  -H "Authorization: Bearer TOKEN"

# CHECK if song is liked
curl http://localhost:3000/api/v1/liked-songs/song-uuid \
  -H "Authorization: Bearer TOKEN"

# LIKE a song
curl -X POST http://localhost:3000/api/v1/liked-songs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "songId": "song-uuid" }'

# UNLIKE a song
curl -X DELETE http://localhost:3000/api/v1/liked-songs/song-uuid \
  -H "Authorization: Bearer TOKEN"
```

---

## 📥 Downloads (`/api/v1/downloads`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener mis descargas | ✅ |
| GET | `/:id` | Obtener descarga por ID | ✅ |
| GET | `/status/:status` | Filtrar descargas por estado | ✅ |
| POST | `/` | Crear nueva descarga | ✅ |
| PUT | `/:id` | Actualizar estado de descarga | ✅ |
| DELETE | `/:id` | Eliminar descarga | ✅ |

### Estados
- `pending` - Pendiente
- `downloading` - Descargando
- `completed` - Completada
- `failed` - Falló

### Ejemplos

```bash
# GET my downloads
curl http://localhost:3000/api/v1/downloads \
  -H "Authorization: Bearer TOKEN"

# GET downloads by status
curl http://localhost:3000/api/v1/downloads/status/completed \
  -H "Authorization: Bearer TOKEN"

# CREATE download
curl -X POST http://localhost:3000/api/v1/downloads \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "songId": "song-uuid" }'

# UPDATE download status
curl -X PUT http://localhost:3000/api/v1/downloads/download-uuid \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "downloading",
    "fileSizeBytes": 5242880
  }'
```

---

## 🎵 Playlists (`/api/v1/playlists`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener playlists públicas | ❌ |
| GET | `/:id` | Obtener playlist con canciones | ❌ |
| GET | `/user/my-playlists` | Obtener mis playlists | ✅ |
| POST | `/` | Crear nueva playlist | ✅ |
| PUT | `/:id` | Actualizar playlist | ✅ |
| DELETE | `/:id` | Eliminar playlist | ✅ |
| POST | `/:id/songs` | Agregar canción a playlist | ✅ |
| DELETE | `/:id/songs/:songId` | Eliminar canción de playlist | ✅ |
| PATCH | `/:id/songs/reorder` | Reordenar canción en playlist | ✅ |

### Ejemplos

```bash
# GET public playlists
curl http://localhost:3000/api/v1/playlists?limit=50

# GET my playlists
curl http://localhost:3000/api/v1/playlists/user/my-playlists \
  -H "Authorization: Bearer TOKEN"

# GET playlist with songs
curl http://localhost:3000/api/v1/playlists/playlist-uuid

# CREATE playlist
curl -X POST http://localhost:3000/api/v1/playlists \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mis Favoritos",
    "description": "Mis canciones favoritas",
    "visibility": "private",
    "moodId": "mood-uuid"
  }'

# ADD song to playlist
curl -X POST http://localhost:3000/api/v1/playlists/playlist-uuid/songs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "songId": "song-uuid" }'

# REMOVE song from playlist
curl -X DELETE http://localhost:3000/api/v1/playlists/playlist-uuid/songs/song-uuid \
  -H "Authorization: Bearer TOKEN"

# REORDER song in playlist
curl -X PATCH http://localhost:3000/api/v1/playlists/playlist-uuid/songs/reorder \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "songId": "song-uuid", "position": 1 }'
```

---

## ▶️ Player State (`/api/v1/player`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener estado del reproductor | ✅ |
| POST | `/` | Actualizar estado del reproductor | ✅ |
| POST | `/song` | Establecer canción actual | ✅ |
| POST | `/repeat` | Cambiar modo de repetición | ✅ |
| POST | `/shuffle` | Cambiar shuffle | ✅ |
| POST | `/position` | Cambiar posición de reproducción | ✅ |

### Ejemplos

```bash
# GET player state
curl http://localhost:3000/api/v1/player \
  -H "Authorization: Bearer TOKEN"

# UPDATE player state
curl -X POST http://localhost:3000/api/v1/player \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentSongId": "song-uuid",
    "positionS": 45.5,
    "repeat": "all",
    "shuffle": true
  }'

# SET current song
curl -X POST http://localhost:3000/api/v1/player/song \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "songId": "song-uuid", "position": 0 }'

# SET repeat mode
curl -X POST http://localhost:3000/api/v1/player/repeat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "repeat": "one" }'

# SET shuffle
curl -X POST http://localhost:3000/api/v1/player/shuffle \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "shuffle": true }'

# SET position
curl -X POST http://localhost:3000/api/v1/player/position \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "positionS": 125.5 }'
```

---

## 📊 Listening History (`/api/v1/listening-history`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener mi historial | ✅ |
| GET | `/moods/recent` | Moods recientes | ✅ |
| GET | `/songs/top` | Canciones principales | ✅ |
| GET | `/stats/time` | Tiempo total de escucha | ✅ |
| POST | `/` | Agregar a historial | ✅ |

### Ejemplos

```bash
# GET listening history
curl http://localhost:3000/api/v1/listening-history?limit=100 \
  -H "Authorization: Bearer TOKEN"

# GET recent moods
curl http://localhost:3000/api/v1/listening-history/moods/recent?days=7 \
  -H "Authorization: Bearer TOKEN"

# GET top songs
curl http://localhost:3000/api/v1/listening-history/songs/top?days=30&limit=50 \
  -H "Authorization: Bearer TOKEN"

# GET total listening time
curl http://localhost:3000/api/v1/listening-history/stats/time?days=30 \
  -H "Authorization: Bearer TOKEN"

# ADD to listening history
curl -X POST http://localhost:3000/api/v1/listening-history \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "songId": "song-uuid",
    "moodId": "mood-uuid",
    "durationS": 183.12,
    "completed": true
  }'
```

---

## 📋 Parámetros Comunes

### Paginación
```
?limit=50&offset=0
```

### Respuesta Paginada
```json
{
  "data": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1000
  }
}
```

### Manejo de Errores
```json
{
  "error": "Descripción del error",
  "status": 400
}
```

---

## 🔐 Autenticación

Incluir header en todas las peticiones autenticadas:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## ✨ Notas

- Todos los IDs son UUIDs
- Las fechas están en ISO 8601
- Los tiempos en segundos son números decimales
- Visibility puede ser: `private` o `public`
- Repeat modes: `none`, `one`, `all`
- Download status: `pending`, `downloading`, `completed`, `failed`

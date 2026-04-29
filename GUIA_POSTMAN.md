# Guia de rutas para Postman

Documentacion armada a partir del codigo actual en `src/routes` y `src/controllers`.

## Base URL

`http://localhost:3000`

## Headers comunes

- `Content-Type: application/json`
- `Authorization: Bearer {{accessToken}}` en todas las rutas protegidas

## Variables sugeridas en Postman

- `baseUrl = http://localhost:3000`
- `accessToken = <token devuelto por login o refresh>`
- `refreshToken = <token devuelto por login o refresh>`
- `songId = <uuid>`
- `artistId = <uuid>`
- `albumId = <uuid>`
- `moodId = <uuid>`
- `playlistId = <uuid>`
- `downloadId = <uuid>`
- `notificationId = <uuid>`
- `queueId = <uuid>`

## Notas rapidas

- Todas las rutas con `:id`, `:songId`, `:artistId`, `:moodId`, `:genreId` y similares esperan UUID.
- La paginacion general usa `limit` y `offset`. Por defecto: `limit=20`, `offset=0`.
- `POST /api/v1/auth/register` actualmente crea el usuario pero no devuelve tokens.
- Existen rutas "legacy" tipo `/api/v1/songs`, `/api/v1/downloads`, `/api/v1/player-state` y tambien rutas mas completas bajo `/api/v1/me/*`.
- Si una ruta protegida no recibe token Bearer, responde `401`.

## 1. Rutas base

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | No | - | - | Devuelve informacion general del servicio y grupos de endpoints. |
| GET | `/health` | No | - | - | Healthcheck simple. |

## 2. Auth

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | No | `username`, `email`, `password`, `displayName?` | - | Crea usuario. Responde `201` con `{ user }`. |
| POST | `/api/v1/auth/login` | No | `identifier`, `password` | - | `identifier` acepta email o username. Devuelve `accessToken` y `refreshToken`. |
| POST | `/api/v1/auth/refresh` | No | `refreshToken` | - | Genera nuevo `accessToken` y nuevo `refreshToken`. |
| POST | `/api/v1/auth/logout` | No | `refreshToken` | - | Revoca refresh token. Responde `204`. |

### Body de ejemplo: register

```json
{
  "username": "fernando",
  "email": "fernando@example.com",
  "password": "Secret1234",
  "displayName": "Fernando"
}
```

### Body de ejemplo: login

```json
{
  "identifier": "fernando@example.com",
  "password": "Secret1234"
}
```

## 3. Catalogo

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/catalog/home` | No | - | - | Home del catalogo: canciones tendencia, moods, playlists publicas, artistas y planes. |
| GET | `/api/v1/catalog/songs` | No | - | `limit?`, `offset?`, `search?`, `artistId?`, `albumId?`, `genreId?`, `moodId?`, `sort?` | `sort`: `popular`, `newest`, `title`. |
| GET | `/api/v1/catalog/songs/:id` | No | - | - | Detalle de una cancion streamable. |
| GET | `/api/v1/catalog/artists` | No | - | `limit?`, `offset?`, `search?`, `country?`, `sort?` | `country` usa codigo de 2 letras. `sort`: `popular`, `name`, `newest`. |
| GET | `/api/v1/catalog/artists/:id` | No | - | - | Devuelve artista con `topSongs` y `albums`. |
| GET | `/api/v1/catalog/albums` | No | - | `limit?`, `offset?`, `search?`, `artistId?`, `sort?` | `sort`: `newest`, `title`. |
| GET | `/api/v1/catalog/albums/:id` | No | - | - | Devuelve album con canciones. |
| GET | `/api/v1/catalog/genres` | No | - | - | Lista de generos con conteo de canciones. |
| GET | `/api/v1/catalog/moods` | No | - | - | Lista de moods con metadatos y conteo de canciones. |
| GET | `/api/v1/catalog/plans` | No | - | - | Lista de planes de suscripcion activos. |

## 4. Busqueda global

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/search` | No | - | `q`, `limit?` | `q` es obligatorio. `limit` maximo: `50`. |

## 5. Songs CRUD y relaciones

Estas rutas estan publicas en el codigo actual.

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/songs` | No | - | `limit?`, `offset?` | Lista paginada. |
| GET | `/api/v1/songs/search` | No | - | `q`, `limit?`, `offset?` | Busca por titulo. |
| GET | `/api/v1/songs/:id` | No | - | - | Devuelve una cancion con relaciones. |
| GET | `/api/v1/songs/artist/:artistId` | No | - | `limit?`, `offset?` | Canciones por artista. |
| POST | `/api/v1/songs` | No | `fileId`, `filePath`, `cdnUrl?`, `title`, `artistId`, `albumId?`, `coverUrl?`, `releaseYear?`, `durationS`, `explicit?` | - | Crea cancion. |
| PUT | `/api/v1/songs/:id` | No | `title?`, `albumId?`, `coverUrl?`, `releaseYear?`, `cdnUrl?` | - | Actualiza cancion. |
| DELETE | `/api/v1/songs/:id` | No | - | - | Elimina cancion. Responde `204`. |
| GET | `/api/v1/songs/:id/genres` | No | - | - | Lista generos asociados. |
| POST | `/api/v1/songs/:id/genres` | No | `genreId` | - | Asocia genero a cancion. |
| DELETE | `/api/v1/songs/:id/genres/:genreId` | No | - | - | Quita genero. Responde `204`. |
| GET | `/api/v1/songs/:id/moods` | No | - | - | Lista moods asociados. |
| POST | `/api/v1/songs/:id/moods` | No | `moodId`, `score?` | - | `score` entre `0` y `1`. |
| DELETE | `/api/v1/songs/:id/moods/:moodId` | No | - | - | Quita mood. Responde `204`. |

### Body de ejemplo: crear song

```json
{
  "fileId": "song-file-001",
  "filePath": "/music/song-file-001.mp3",
  "cdnUrl": "https://cdn.example.com/song-file-001.mp3",
  "title": "Mi Cancion",
  "artistId": "{{artistId}}",
  "albumId": "{{albumId}}",
  "coverUrl": "https://cdn.example.com/song-file-001.jpg",
  "releaseYear": 2024,
  "durationS": 210,
  "explicit": false
}
```

## 6. Artists CRUD

Estas rutas estan publicas en el codigo actual.

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/artists` | No | - | `limit?`, `offset?` | Lista paginada. |
| GET | `/api/v1/artists/:id` | No | - | - | Detalle de artista. |
| POST | `/api/v1/artists` | No | `name`, `imageUrl?` | - | Crea artista. |
| PUT | `/api/v1/artists/:id` | No | `name?`, `imageUrl?` | - | Actualiza artista. |
| DELETE | `/api/v1/artists/:id` | No | - | - | Elimina artista. Responde `204`. |

## 7. Moods CRUD

Estas rutas estan publicas en el codigo actual.

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/moods` | No | - | - | Lista moods. |
| GET | `/api/v1/moods/:id` | No | - | - | Detalle de mood. |
| GET | `/api/v1/moods/:id/songs` | No | - | `limit?`, `offset?` | Canciones del mood. |
| POST | `/api/v1/moods` | No | `name`, `displayName`, `iconName`, `gradientStart`, `gradientEnd`, `sortOrder?` | - | `gradientStart` y `gradientEnd` deben ir como hex, ejemplo `#FFAA00`. |
| PUT | `/api/v1/moods/:id` | No | `displayName?`, `iconName?`, `gradientStart?`, `gradientEnd?`, `sortOrder?` | - | Actualiza mood. |
| DELETE | `/api/v1/moods/:id` | No | - | - | Elimina mood. Responde `204`. |

## 8. Playlists

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/playlists` | No | - | `limit?`, `offset?` | Lista playlists. |
| GET | `/api/v1/playlists/user/my-playlists` | Si | - | `limit?`, `offset?` | Solo playlists del usuario autenticado. |
| GET | `/api/v1/playlists/:id` | No | - | - | Devuelve playlist con canciones. |
| POST | `/api/v1/playlists` | Si | `name`, `description?`, `coverUrl?`, `visibility?`, `moodId?` | - | Crea playlist propia. |
| PUT | `/api/v1/playlists/:id` | Si | `name?`, `description?`, `coverUrl?`, `visibility?`, `moodId?` | - | Solo el owner puede actualizar. |
| DELETE | `/api/v1/playlists/:id` | Si | - | - | Solo el owner puede eliminar. Responde `204`. |
| POST | `/api/v1/playlists/:id/songs` | Si | `songId` | - | Solo el owner puede agregar canciones. |
| PATCH | `/api/v1/playlists/:id/songs/reorder` | Si | `songId`, `position` | - | Reordena una cancion en la playlist. |
| DELETE | `/api/v1/playlists/:id/songs/:songId` | Si | - | - | Solo el owner puede quitar canciones. Responde `204`. |

## 9. Liked songs

Todas estas rutas requieren Bearer token.

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/liked-songs` | Si | - | `limit?`, `offset?` | Lista favoritos del usuario. |
| GET | `/api/v1/liked-songs/:songId` | Si | - | - | Devuelve `{ liked: true|false }`. |
| POST | `/api/v1/liked-songs` | Si | `songId` | - | Marca favorita. |
| DELETE | `/api/v1/liked-songs/:songId` | Si | - | - | Quita favorita. Responde `204`. |

## 10. Downloads

Todas estas rutas requieren Bearer token.

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/downloads` | Si | - | `limit?`, `offset?` | Lista descargas del usuario. |
| GET | `/api/v1/downloads/status/:status` | Si | - | `status?` | El path usa `:status`, pero el controlador lee `req.query.status`. Si falla, prueba `/api/v1/downloads/status/pending?status=pending`. |
| GET | `/api/v1/downloads/:id` | Si | - | - | Detalle de una descarga. Solo owner. |
| POST | `/api/v1/downloads` | Si | `songId` | - | Crea descarga. |
| PUT | `/api/v1/downloads/:id` | Si | `status?`, `fileSizeBytes?`, `localPath?` | - | `status`: `pending`, `downloading`, `completed`, `failed`. |
| DELETE | `/api/v1/downloads/:id` | Si | - | - | Elimina descarga. Responde `204`. |

## 11. Player state

Todas estas rutas requieren Bearer token.

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/player-state` | Si | - | - | Estado actual del reproductor del usuario. |
| POST | `/api/v1/player-state` | Si | `currentSongId?`, `positionS?`, `repeat?`, `shuffle?` | - | Actualiza parte del estado. |
| POST | `/api/v1/player-state/song` | Si | `songId`, `position?` | - | `songId` puede ser `null`. |
| POST | `/api/v1/player-state/repeat` | Si | `repeat` | - | `repeat`: `none`, `one`, `all`. |
| POST | `/api/v1/player-state/shuffle` | Si | `shuffle` | - | `shuffle`: boolean. |
| POST | `/api/v1/player-state/position` | Si | `positionS` | - | `positionS` debe ser >= `0`. |

## 12. Listening history

Todas estas rutas requieren Bearer token.

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/listening-history` | Si | - | `limit?`, `offset?` | Historial paginado. |
| GET | `/api/v1/listening-history/moods/recent` | Si | - | `days?` | El controlador usa `z.number()` sin coercion. Si envias query string y responde `400`, usa el valor por defecto o corrige la API. |
| GET | `/api/v1/listening-history/songs/top` | Si | - | `days?`, `limit?` | Misma observacion: `days` y `limit` no usan coercion. |
| GET | `/api/v1/listening-history/stats/time` | Si | - | `days?` | Misma observacion sobre coercion. |
| POST | `/api/v1/listening-history` | Si | `songId`, `moodId?`, `durationS`, `completed?` | - | Registra escucha. |

## 13. Me - perfil y preferencias

Todas estas rutas requieren Bearer token.

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/profile` | Si | - | - | Perfil extendido del usuario autenticado. |
| PATCH | `/api/v1/me/profile` | Si | `displayName?`, `avatarUrl?`, `bio?`, `country?`, `preferredLanguage?`, `dateOfBirth?` | - | `country` y `preferredLanguage` usan 2 letras. `dateOfBirth` va como `YYYY-MM-DD`. |
| GET | `/api/v1/me/preferences` | Si | - | - | Lee preferencias. Si no existen, las crea. |
| PUT | `/api/v1/me/preferences` | Si | `streamQuality?`, `downloadQuality?`, `eqLow?`, `eqMid?`, `eqHigh?`, `showExplicit?`, `autoplay?`, `crossfadeMs?` | - | `streamQuality` y `downloadQuality`: `low`, `normal`, `high`, `lossless`. |

### Body de ejemplo: actualizar perfil

```json
{
  "displayName": "Fernando Dev",
  "avatarUrl": "https://cdn.example.com/avatar.png",
  "bio": "Amante de la musica",
  "country": "BO",
  "preferredLanguage": "es",
  "dateOfBirth": "1995-08-15"
}
```

### Body de ejemplo: actualizar preferencias

```json
{
  "streamQuality": "high",
  "downloadQuality": "lossless",
  "eqLow": 2,
  "eqMid": 0,
  "eqHigh": 1,
  "showExplicit": true,
  "autoplay": true,
  "crossfadeMs": 1500
}
```

## 14. Me - mood sessions

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/me/moods/sessions` | Si | `moodId` | - | Cierra la sesion activa anterior y crea una nueva. Responde `201`. |
| GET | `/api/v1/me/moods/sessions` | Si | - | `limit?`, `offset?` | Lista sesiones de mood del usuario. |

## 15. Me - likes

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/likes` | Si | - | `limit?`, `offset?` | Version enriquecida de favoritos. |
| POST | `/api/v1/me/likes/:songId` | Si | - | - | Marca favorita por `songId` en path. Responde `201`. |
| DELETE | `/api/v1/me/likes/:songId` | Si | - | - | Quita favorita. Responde `204`. |

## 16. Me - downloads

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/downloads` | Si | - | `limit?`, `offset?` | Version enriquecida de descargas. |
| POST | `/api/v1/me/downloads` | Si | `songId`, `quality?`, `fileSizeBytes?`, `localPath?`, `status?`, `downloadedAt?`, `expiresAt?` | - | `quality`: `low`, `normal`, `high`, `lossless`. `status`: `pending`, `downloading`, `completed`, `failed`, `deleted`. |
| PATCH | `/api/v1/me/downloads/:id` | Si | `quality?`, `fileSizeBytes?`, `localPath?`, `status?`, `downloadedAt?`, `expiresAt?` | - | Actualiza una descarga propia. |

## 17. Me - queue

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/queue` | Si | - | - | Lee la cola del usuario. |
| POST | `/api/v1/me/queue` | Si | `songId`, `sourceType?`, `sourceId?` | - | Agrega una cancion al final. Responde `201`. |
| PUT | `/api/v1/me/queue` | Si | `items` | - | Reemplaza toda la cola. `items` es un arreglo de objetos con `songId`, `sourceType?`, `sourceId?`. |
| DELETE | `/api/v1/me/queue/:id` | Si | - | - | Elimina item por `queueId`. Responde `204`. |

### Body de ejemplo: reemplazar queue

```json
{
  "items": [
    {
      "songId": "{{songId}}",
      "sourceType": "playlist",
      "sourceId": "{{playlistId}}"
    }
  ]
}
```

## 18. Me - player state

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/player-state` | Si | - | - | Version extendida del estado del reproductor. |
| PUT | `/api/v1/me/player-state` | Si | `currentSongId`, `positionS`, `repeat`, `shuffle`, `volume` | - | `currentSongId` puede ser `null`. `volume` va entre `0` y `1`. |

### Body de ejemplo: actualizar player state

```json
{
  "currentSongId": "{{songId}}",
  "positionS": 42,
  "repeat": "all",
  "shuffle": false,
  "volume": 0.8
}
```

## 19. Me - history

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/history` | Si | - | `limit?`, `offset?` | Historial enriquecido. |
| POST | `/api/v1/me/history` | Si | `songId`, `durationS`, `completed?`, `sourceType?`, `moodId?` | - | Registra escucha. Responde `201`. |

## 20. Me - recommendations

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/recommendations` | Si | - | `moodId?`, `limit?` | Usa similitud si existe; si no, cae a recomendaciones por mood. `limit` maximo: `50`. |

## 21. Me - notifications

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/notifications` | Si | - | `limit?`, `offset?` | Lista notificaciones del usuario. |
| PATCH | `/api/v1/me/notifications/:id/read` | Si | - | - | Marca una notificacion como leida. |

## 22. Me - subscription

| Metodo | Ruta | Auth | Body | Query | Notas |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me/subscription` | Si | - | - | Devuelve la suscripcion activa o `null`. |

## 23. Bodies rapidos para copiar en Postman

### Logout

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

### Crear playlist

```json
{
  "name": "Ruta de manana",
  "description": "Playlist para probar la app",
  "coverUrl": "https://cdn.example.com/playlist.jpg",
  "visibility": "public",
  "moodId": "{{moodId}}"
}
```

### Agregar favorita con legacy endpoint

```json
{
  "songId": "{{songId}}"
}
```

### Crear download en `/api/v1/me/downloads`

```json
{
  "songId": "{{songId}}",
  "quality": "high",
  "fileSizeBytes": 12345678,
  "localPath": "/storage/emulated/0/Music/song.mp3",
  "status": "completed",
  "downloadedAt": "2026-04-29T18:00:00.000Z",
  "expiresAt": "2026-05-29T18:00:00.000Z"
}
```

### Crear listening history

```json
{
  "songId": "{{songId}}",
  "moodId": "{{moodId}}",
  "durationS": 180,
  "completed": true
}
```

## 24. Rutas recomendadas para pruebas rapidas

1. `POST /api/v1/auth/register`
2. `POST /api/v1/auth/login`
3. `GET /api/v1/catalog/home`
4. `GET /api/v1/catalog/songs`
5. `GET /api/v1/me/profile`
6. `GET /api/v1/me/likes`
7. `GET /api/v1/me/player-state`

## 25. Observaciones sobre el codigo actual

- `POST /api/v1/auth/register` no entrega tokens porque el bloque que firmaba tokens esta comentado.
- `GET /api/v1/downloads/status/:status` tiene desalineacion entre ruta y controlador.
- `GET /api/v1/listening-history/moods/recent`, `GET /api/v1/listening-history/songs/top` y `GET /api/v1/listening-history/stats/time` no usan coercion para los query params numericos.
- Hay dos familias de endpoints para varias entidades: una familia CRUD/legacy y otra familia bajo `/api/v1/me/*` mas orientada a la app autenticada.

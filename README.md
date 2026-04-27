# Mood Music API

API RESTful lista para conectar una app Flutter con la base de datos PostgreSQL de este proyecto.

## Qué incluye

- `Express + TypeScript + PostgreSQL`
- JWT con `access token` y `refresh token`
- Registro, login, refresh y logout
- Catálogo musical: canciones, artistas, álbumes, moods, géneros, planes
- Búsqueda unificada
- Playlists públicas y privadas
- Perfil de usuario y preferencias
- Likes, descargas, cola de reproducción, player state
- Historial, recomendaciones y notificaciones
- Dockerfile y `docker-compose.yml` para VPS o local

## Estructura

- [database.sql](C:/Users/josef/OneDrive/Desktop/Proyectos%20Fernando/RESTful/database.sql)
- [migrations/001_api_auth.sql](C:/Users/josef/OneDrive/Desktop/Proyectos%20Fernando/RESTful/migrations/001_api_auth.sql)
- [src/server.ts](C:/Users/josef/OneDrive/Desktop/Proyectos%20Fernando/RESTful/src/server.ts)
- [src/app.ts](C:/Users/josef/OneDrive/Desktop/Proyectos%20Fernando/RESTful/src/app.ts)
- [src/routes](C:/Users/josef/OneDrive/Desktop/Proyectos%20Fernando/RESTful/src/routes)

## Variables de entorno

Copia [`.env.example`](C:/Users/josef/OneDrive/Desktop/Proyectos%20Fernando/RESTful/.env.example) como `.env` y ajusta:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mood_music
DB_SSL=false
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
JWT_SECRET=change-this-access-secret
JWT_REFRESH_SECRET=change-this-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=10
```

## Arranque local

1. Instalar dependencias:

```bash
npm install
```

2. Crear la base y aplicar esquema + migración:

```bash
npm run db:bootstrap
```

3. Levantar la API:

```bash
npm run dev
```

La API queda en `http://localhost:3000`.

## Arranque con Docker

Cuando Docker Desktop o el daemon de Docker esté encendido:

```bash
docker compose up -d --build
```

Esto levanta:

- PostgreSQL en `localhost:5432`
- API en `http://localhost:3000`

## Despliegue en VPS

La opción más directa es usar Docker:

1. Subir el proyecto a la VPS.
2. Instalar Docker y Docker Compose.
3. Ajustar secretos en `docker-compose.yml` o usar un `.env` del servidor.
4. Ejecutar:

```bash
docker compose up -d --build
```

Si prefieres Node sin Docker:

```bash
npm install
npm run build
NODE_ENV=production npm run start
```

Luego puedes poner Nginx delante como reverse proxy hacia el puerto `3000`.

## Endpoints principales

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Catálogo

- `GET /api/v1/catalog/home`
- `GET /api/v1/catalog/songs`
- `GET /api/v1/catalog/songs/:id`
- `GET /api/v1/catalog/artists`
- `GET /api/v1/catalog/artists/:id`
- `GET /api/v1/catalog/albums`
- `GET /api/v1/catalog/albums/:id`
- `GET /api/v1/catalog/genres`
- `GET /api/v1/catalog/moods`
- `GET /api/v1/catalog/plans`

### Búsqueda

- `GET /api/v1/search?q=strokes`

### Playlists

- `GET /api/v1/playlists`
- `GET /api/v1/playlists/:id`
- `POST /api/v1/playlists`
- `PATCH /api/v1/playlists/:id`
- `DELETE /api/v1/playlists/:id`
- `POST /api/v1/playlists/:id/songs`
- `PATCH /api/v1/playlists/:id/songs/reorder`
- `DELETE /api/v1/playlists/:id/songs/:songId`

### Usuario autenticado

- `GET /api/v1/me/profile`
- `PATCH /api/v1/me/profile`
- `GET /api/v1/me/preferences`
- `PUT /api/v1/me/preferences`
- `GET /api/v1/me/likes`
- `POST /api/v1/me/likes/:songId`
- `DELETE /api/v1/me/likes/:songId`
- `GET /api/v1/me/downloads`
- `POST /api/v1/me/downloads`
- `PATCH /api/v1/me/downloads/:id`
- `GET /api/v1/me/queue`
- `POST /api/v1/me/queue`
- `PUT /api/v1/me/queue`
- `DELETE /api/v1/me/queue/:id`
- `GET /api/v1/me/player-state`
- `PUT /api/v1/me/player-state`
- `GET /api/v1/me/history`
- `POST /api/v1/me/history`
- `GET /api/v1/me/recommendations`
- `GET /api/v1/me/notifications`
- `PATCH /api/v1/me/notifications/:id/read`
- `GET /api/v1/me/subscription`
- `POST /api/v1/me/moods/sessions`
- `GET /api/v1/me/moods/sessions`

## Flujo para Flutter

1. Registrar o loguear usuario.
2. Guardar `accessToken` y `refreshToken`.
3. Enviar `Authorization: Bearer <accessToken>` en endpoints protegidos.
4. Si el `accessToken` expira, usar `POST /api/v1/auth/refresh`.

## Ejemplo rápido

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "fernando",
    "email": "fernando@example.com",
    "password": "Secret1234",
    "displayName": "Fernando"
  }'
```

## Notas

- Se añadió `pgcrypto` al esquema porque `gen_random_uuid()` ya se estaba usando en la base.
- Se extendió la creación automática de particiones de `listening_history` para que no caduque tan pronto.
- La API cubre el flujo principal de la app. Las tablas sociales, DJ y pagos ya están en la base para una segunda fase si luego quieres exponerlas también.

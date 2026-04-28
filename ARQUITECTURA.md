# Estructura del Proyecto - Modelos, Servicios y Controladores

## 📁 Estructura de Carpetas

```
src/
├── models/                    # Interfaces y tipos TypeScript
│   ├── artist.model.ts
│   ├── album.model.ts
│   ├── genre.model.ts
│   ├── song.model.ts
│   ├── mood.model.ts
│   ├── user.model.ts
│   ├── liked-song.model.ts
│   ├── download.model.ts
│   ├── playlist.model.ts
│   ├── player-state.model.ts
│   ├── listening-history.model.ts
│   ├── song-genre.model.ts
│   ├── song-mood.model.ts
│   ├── lyrics.model.ts
│   └── index.ts               # Exporta todos los modelos
│
├── services/                  # Lógica de negocio y acceso a BD
│   ├── artist.service.ts
│   ├── album.service.ts
│   ├── genre.service.ts
│   ├── song.service.ts
│   ├── mood.service.ts
│   ├── playlist.service.ts
│   ├── liked-song.service.ts
│   ├── download.service.ts
│   ├── player-state.service.ts
│   ├── listening-history.service.ts
│   ├── song-relation.service.ts  # Relaciones many-to-many
│   ├── lyrics.service.ts
│   ├── sql-fragments.ts       # Fragmentos de SQL reutilizables
│   └── index.ts               # Exporta todos los servicios
│
├── controllers/               # Controladores HTTP
│   ├── artist.controller.ts
│   ├── song.controller.ts
│   ├── playlist.controller.ts
│   ├── liked-song.controller.ts
│   ├── download.controller.ts
│   ├── player-state.controller.ts
│   ├── listening-history.controller.ts
│   ├── mood.controller.ts
│   └── index.ts               # Exporta todos los controladores
│
├── routes/                    # Definición de rutas
│   ├── artists.routes.ts
│   ├── songs.routes.ts
│   ├── moods.routes.ts
│   ├── liked-songs.routes.ts
│   ├── downloads.routes.ts
│   ├── player-state.routes.ts
│   ├── listening-history.routes.ts
│   ├── playlists.routes.ts    # Rutas de playlists
│   ├── index.ts               # Rutas principales
│   └── ...
│
├── middleware/                # Middlewares
├── utils/                     # Utilidades
├── db/                        # Configuración de BD
├── config/                    # Configuración
└── ...
```

## 🏗️ Arquitectura de Capas

### 1. **Models** (`src/models/`)
Define las interfaces TypeScript y tipos de datos para cada entidad.

```typescript
// Ejemplo: Song
export interface Song {
  id: string;
  fileId: string;
  title: string;
  artistId: string;
  // ...
}

export interface CreateSongDTO {
  fileId: string;
  title: string;
  artistId: string;
  // ...
}
```

### 2. **Services** (`src/services/`)
Maneja la lógica de negocio y la comunicación con la base de datos.

```typescript
// Ejemplo: SongService
export class SongService {
  async getAll(limit: number, offset: number): Promise<Song[]>
  async getById(id: string): Promise<Song>
  async create(data: CreateSongDTO): Promise<Song>
  async update(id: string, data: UpdateSongDTO): Promise<Song>
  async delete(id: string): Promise<void>
}

export const songService = new SongService();
```

### 3. **Controllers** (`src/controllers/`)
Maneja las peticiones HTTP y valida datos usando Zod.

```typescript
// Ejemplo: SongController
export class SongController {
  static getAll = asyncHandler(async (req, res) => {
    const { limit, offset } = pagination(req);
    const songs = await songService.getAll(limit, offset);
    res.json({ data: songs, pagination: { limit, offset } });
  });

  static create = asyncHandler(async (req, res) => {
    const data = createSongSchema.parse(req.body);
    const song = await songService.create(data);
    res.status(201).json(song);
  });
}
```

### 4. **Routes** (`src/routes/`)
Define los endpoints REST y mapea a los controladores.

```typescript
// Ejemplo: songs.routes.ts
const router = Router();

router.get('/', SongController.getAll);
router.post('/', SongController.create);
router.get('/:id', SongController.getById);
router.put('/:id', SongController.update);
router.delete('/:id', SongController.delete);

export default router;
```

## 📋 Entidades Principales

### Core Catalog
- **Artists** - Artistas de las canciones
- **Albums** - Álbumes
- **Genres** - Géneros musicales
- **Songs** - Canciones

### Mood Engine
- **Moods** - Estados de ánimo (Feliz, Triste, Focus, etc.)
- **Song-Genres** - Relación muchos-a-muchos
- **Song-Moods** - Relación muchos-a-muchos con puntuación

### User & Library
- **Users** - Información del usuario
- **Liked-Songs** - Canciones marcadas como favoritas
- **Downloads** - Descargas de canciones
- **Lyrics** - Letras sincronizadas

### Playlists
- **Playlists** - Playlists del usuario
- **Playlist-Songs** - Canciones en playlists con posición

### Player
- **Player-State** - Estado actual del reproductor
- **Listening-History** - Historial de reproducción

## 🔄 Flujo de Datos

```
Request → Route → Controller → Service → Database → Response
   ↓         ↓         ↓         ↓          ↓         ↓
HTTP      Mapeo    Validación  Lógica    Query    JSON
Endpoint   a URL    (Zod)      negocio   SQL
```

## 📡 Ejemplo de Uso

### Obtener todas las canciones
```
GET /api/v1/songs
```

**Flow:**
1. Route en `songs.routes.ts` recibe GET
2. Llama a `SongController.getAll`
3. Controller extrae pagination y llama a `songService.getAll()`
4. Service ejecuta query SQL
5. Response regresa JSON con canciones

### Crear una canción
```
POST /api/v1/songs
{
  "fileId": "123-456.mp3",
  "filePath": "music/123-456.mp3",
  "title": "Mi canción",
  "artistId": "uuid",
  "durationS": 222.12
}
```

**Flow:**
1. Controller valida con `createSongSchema`
2. Llama a `songService.create()`
3. Service inserta en BD y retorna la canción creada
4. Response 201 con los datos de la canción

## 🔐 Autenticación

Las rutas protegidas usan middleware `requireAuth`:

```typescript
router.use(requireAuth);

// Todas estas rutas requieren autenticación
router.get('/', LikedSongController.getLikedSongs);
router.post('/', LikedSongController.addLikedSong);
```

## ✨ Mejoras Implementadas

1. **Separación de responsabilidades** - Cada capa tiene un propósito específico
2. **Reutilización de código** - Services se usan en múltiples controladores
3. **Validación con Zod** - Esquemas claros para cada endpoint
4. **Manejo de errores** - ApiError y asyncHandler para errores consistentes
5. **Type Safety** - Interfaces TypeScript en todos lados
6. **Paginación** - Soporte para limit/offset en listados
7. **Relaciones** - Servicios para relaciones muchos-a-muchos
8. **Transacciones** - Soporte para operaciones atómicas

## 🚀 Próximos Pasos

1. Implementar Album, Genre y otras entidades faltantes
2. Crear seeders para datos iniciales (moods, géneros)
3. Agregar tests unitarios para servicios
4. Documentación Swagger/OpenAPI
5. Validación de permisos más granular
6. Rate limiting
7. Caché con Redis

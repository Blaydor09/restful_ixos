# Guía Rápida - Modelos, Servicios y Controladores

## 📚 Tabla de Contenidos
1. [Cómo agregar una nueva entidad](#como-agregar-una-nueva-entidad)
2. [Estructura de Servicios](#estructura-de-servicios)
3. [Estructura de Controladores](#estructura-de-controladores)
4. [Estructura de Rutas](#estructura-de-rutas)
5. [Ejemplos Prácticos](#ejemplos-practicos)

---

## Cómo Agregar una Nueva Entidad

### Paso 1: Crear el Modelo
Archivo: `src/models/nueva-entidad.model.ts`

```typescript
export interface NuevaEntidad {
  id: string;
  nombre: string;
  descripcion?: string;
  createdAt: Date;
}

export interface CreateNuevaEntidadDTO {
  nombre: string;
  descripcion?: string;
}

export interface UpdateNuevaEntidadDTO {
  nombre?: string;
  descripcion?: string;
}
```

### Paso 2: Crear el Servicio
Archivo: `src/services/nueva-entidad.service.ts`

```typescript
import { pool } from '../db/pool';
import { ApiError } from '../utils/api-error';
import { NuevaEntidad, CreateNuevaEntidadDTO, UpdateNuevaEntidadDTO } from '../models';

export class NuevaEntidadService {
  async getAll(limit: number = 50, offset: number = 0): Promise<NuevaEntidad[]> {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, created_at AS "createdAt"
       FROM nueva_entidad
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getById(id: string): Promise<NuevaEntidad> {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, created_at AS "createdAt"
       FROM nueva_entidad WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError('No encontrado', 404);
    }
    return result.rows[0];
  }

  async create(data: CreateNuevaEntidadDTO): Promise<NuevaEntidad> {
    const result = await pool.query(
      `INSERT INTO nueva_entidad (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING id, nombre, descripcion, created_at AS "createdAt"`,
      [data.nombre, data.descripcion || null]
    );
    return result.rows[0];
  }

  async update(id: string, data: UpdateNuevaEntidadDTO): Promise<NuevaEntidad> {
    const entidad = await this.getById(id);
    const result = await pool.query(
      `UPDATE nueva_entidad
       SET nombre = $1, descripcion = $2
       WHERE id = $3
       RETURNING id, nombre, descripcion, created_at AS "createdAt"`,
      [data.nombre ?? entidad.nombre, data.descripcion ?? entidad.descripcion, id]
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await pool.query('DELETE FROM nueva_entidad WHERE id = $1', [id]);
  }
}

export const nuevaEntidadService = new NuevaEntidadService();
```

### Paso 3: Crear el Controlador
Archivo: `src/controllers/nueva-entidad.controller.ts`

```typescript
import { Request, Response } from 'express';
import { z } from 'zod';
import { nuevaEntidadService } from '../services';
import { asyncHandler } from '../utils/async-handler';
import { pagination } from '../utils/pagination';

const createSchema = z.object({
  nombre: z.string().trim().min(1).max(255),
  descripcion: z.string().trim().optional(),
});

const updateSchema = createSchema.partial();

export class NuevaEntidadController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = pagination(req);
    const items = await nuevaEntidadService.getAll(limit, offset);
    res.json({ data: items, pagination: { limit, offset } });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await nuevaEntidadService.getById(id);
    res.json(item);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const data = createSchema.parse(req.body);
    const item = await nuevaEntidadService.create(data);
    res.status(201).json(item);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateSchema.parse(req.body);
    const item = await nuevaEntidadService.update(id, data);
    res.json(item);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await nuevaEntidadService.delete(id);
    res.status(204).send();
  });
}
```

### Paso 4: Crear las Rutas
Archivo: `src/routes/nueva-entidad.routes.ts`

```typescript
import { Router } from 'express';
import { NuevaEntidadController } from '../controllers';

const router = Router();

router.get('/', NuevaEntidadController.getAll);
router.get('/:id', NuevaEntidadController.getById);
router.post('/', NuevaEntidadController.create);
router.put('/:id', NuevaEntidadController.update);
router.delete('/:id', NuevaEntidadController.delete);

export default router;
```

### Paso 5: Registrar la Ruta
En `src/routes/index.ts`:

```typescript
import nuevaEntidadRoutes from './nueva-entidad.routes';

router.use('/api/v1/nueva-entidad', nuevaEntidadRoutes);
```

---

## Estructura de Servicios

Cada servicio maneja:
- ✅ Conexión a BD
- ✅ Validación de existencia de recursos
- ✅ CRUD operations
- ✅ Relaciones con otras entidades
- ✅ Queries complejas

```typescript
// Patrón: CRUD Basic
async getAll(limit, offset): Promise<Entity[]>
async getById(id): Promise<Entity>
async create(data): Promise<Entity>
async update(id, data): Promise<Entity>
async delete(id): Promise<void>

// Patrón: Relaciones
async addRelation(parentId, childId): Promise<void>
async removeRelation(parentId, childId): Promise<void>
async getRelations(parentId): Promise<Entity[]>

// Patrón: Búsqueda
async search(query, limit, offset): Promise<Entity[]>
async getByField(field, value): Promise<Entity | null>
```

---

## Estructura de Controladores

Cada controlador:
- ✅ Valida entrada con Zod
- ✅ Llama al servicio apropiado
- ✅ Maneja paginación
- ✅ Retorna JSON
- ✅ Maneja errores con asyncHandler

```typescript
// Patrón: Request/Response
static method = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validar entrada
  const data = schema.parse(req.body);

  // 2. Verificar usuario si es necesario
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // 3. Verificar permisos si es necesario
  const resource = await service.getById(id);
  if (resource.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  // 4. Ejecutar lógica
  const result = await service.operation(data);

  // 5. Retornar respuesta
  res.status(200).json(result);
});
```

---

## Estructura de Rutas

```typescript
// Rutas públicas
router.get('/', Controller.getAll);
router.get('/:id', Controller.getById);

// Rutas protegidas
router.post('/', requireAuth, Controller.create);
router.put('/:id', requireAuth, Controller.update);
router.delete('/:id', requireAuth, Controller.delete);

// Rutas con relaciones
router.post('/:id/relacion', requireAuth, Controller.addRelation);
router.delete('/:id/relacion/:relationId', requireAuth, Controller.removeRelation);

// Rutas especiales
router.get('/:id/stats', Controller.getStats);
router.post('/:id/action', requireAuth, Controller.action);
```

---

## Ejemplos Prácticos

### Ejemplo 1: Obtener canción con relaciones

**Request:**
```http
GET /api/v1/songs/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Mi Canción",
  "artist": {
    "id": "456e7890-f01c-12d3-a456-426614174111",
    "name": "Artista"
  },
  "genres": [
    { "id": "789f1234-g12d-12d3-a456-426614174222", "name": "Pop" }
  ],
  "moods": [
    { "id": "012g5678-h34e-12d3-a456-426614174333", "name": "Feliz", "score": 0.9 }
  ]
}
```

**Implementación:**

```typescript
// Service
async getByIdWithRelations(id: string): Promise<SongWithRelations> {
  const song = await this.getById(id);
  const genres = await this.getGenres(id);
  const moods = await this.getMoods(id);
  return { ...song, genres, moods };
}

// Controller
static getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const song = await songService.getByIdWithRelations(id);
  res.json(song);
});
```

### Ejemplo 2: Agregar canción a playlist

**Request:**
```http
POST /api/v1/playlists/123e4567-e89b-12d3-a456-426614174000/songs
Content-Type: application/json

{
  "songId": "789f1234-g12d-12d3-a456-426614174222"
}
```

**Response:**
```json
{
  "message": "Song added to playlist"
}
```

**Implementación:**

```typescript
// Service
async addSong(playlistId: string, songId: string): Promise<void> {
  const pos = await pool.query(
    `SELECT MAX(position) as max_pos FROM playlist_songs WHERE playlist_id = $1`,
    [playlistId]
  );
  const position = (pos.rows[0].max_pos ?? 0) + 1;

  await pool.query(
    `INSERT INTO playlist_songs (playlist_id, song_id, position)
     VALUES ($1, $2, $3)`,
    [playlistId, songId, position]
  );
}

// Controller
static addSong = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  const playlist = await playlistService.getById(id);
  if (playlist.ownerId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { songId } = z.object({ songId: z.string().uuid() }).parse(req.body);
  await playlistService.addSong(id, songId);
  
  res.status(201).json({ message: 'Song added' });
});
```

### Ejemplo 3: Obtener historia de escucha con stats

**Request:**
```http
GET /api/v1/listening-history?limit=20&offset=0
GET /api/v1/listening-history/moods/recent?days=7
GET /api/v1/listening-history/songs/top?days=30
GET /api/v1/listening-history/stats/time?days=30
```

**Implementación:**

```typescript
// Service
async getRecentMoods(userId: string, days: number): Promise<any[]> {
  return pool.query(
    `SELECT m.id, m.name, COUNT(*) as frequency
     FROM listening_history lh
     JOIN moods m ON m.id = lh.mood_id
     WHERE lh.user_id = $1 AND lh.listened_at > NOW() - INTERVAL '${days} days'
     GROUP BY m.id, m.name
     ORDER BY frequency DESC`,
    [userId]
  );
}

// Controller
static getRecentMoods = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { days } = z.object({ days: z.number().optional() }).parse(req.query);
  
  const moods = await listeningHistoryService.getRecentMoods(userId, days ?? 7);
  res.json({ data: moods });
});
```

---

## 🎯 Resumen

| Componente | Responsabilidad | Ubicación |
|-----------|-----------------|-----------|
| **Model** | Define tipos/interfaces | `src/models/` |
| **Service** | Lógica de negocio y BD | `src/services/` |
| **Controller** | Validación HTTP y respuesta | `src/controllers/` |
| **Route** | Mapeo de endpoints | `src/routes/` |

✨ **Ventajas:**
- 🎯 Separación clara de responsabilidades
- 🔄 Fácil de probar (unit tests)
- 📦 Reutilizable en múltiples endpoints
- 🛡️ Type-safe con TypeScript
- 📝 Código auto-documentado

# 📂 Árbol de Estructura del Proyecto

```
RESTful/
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 docker-compose.yml
├── 📄 Dockerfile
├── 📄 database.sql
├── 📄 README.md
│
├── 📋 ARQUITECTURA.md          ← Explicación de capas
├── 📋 GUIA_RAPIDA.md           ← Guía de extensión
├── 📋 API_ENDPOINTS.md         ← Referencia de endpoints
├── 📋 COMPLETADO.md            ← Resumen del proyecto
│
├── migrations/
│   └── 001_api_auth.sql
│
└── src/
    │
    ├── 📂 models/              ⭐ NUEVAS INTERFACES
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
    │   └── index.ts            ← Exporta todos
    │
    ├── 📂 services/            ⭐ NUEVA LÓGICA DE NEGOCIO
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
    │   ├── song-relation.service.ts
    │   ├── lyrics.service.ts
    │   ├── sql-fragments.ts
    │   └── index.ts            ← Exporta todos
    │
    ├── 📂 controllers/         ⭐ NUEVOS CONTROLADORES
    │   ├── artist.controller.ts
    │   ├── song.controller.ts
    │   ├── playlist.controller.ts
    │   ├── liked-song.controller.ts
    │   ├── download.controller.ts
    │   ├── player-state.controller.ts
    │   ├── listening-history.controller.ts
    │   ├── mood.controller.ts
    │   └── index.ts            ← Exporta todos
    │
    ├── 📂 routes/
    │   ├── ⭐ artists.routes.ts (NUEVO)
    │   ├── ⭐ songs.routes.ts (NUEVO)
    │   ├── ⭐ moods.routes.ts (NUEVO)
    │   ├── ⭐ liked-songs.routes.ts (NUEVO)
    │   ├── ⭐ downloads.routes.ts (NUEVO)
    │   ├── ⭐ player-state.routes.ts (NUEVO)
    │   ├── ⭐ listening-history.routes.ts (NUEVO)
    │   ├── playlists.routes.ts (ACTUALIZADO)
    │   ├── auth.routes.ts
    │   ├── catalog.routes.ts
    │   ├── me.routes.ts
    │   ├── search.routes.ts
    │   └── index.ts
    │
    ├── 📂 middleware/
    │   ├── auth.ts
    │   └── error-handler.ts
    │
    ├── 📂 db/
    │   └── pool.ts
    │
    ├── 📂 config/
    │   └── env.ts
    │
    ├── 📂 utils/
    │   ├── api-error.ts
    │   ├── async-handler.ts
    │   ├── auth.ts
    │   └── pagination.ts
    │
    ├── 📂 types/
    │   └── express.d.ts
    │
    ├── 📂 scripts/
    │   └── bootstrap.ts
    │
    ├── app.ts
    └── server.ts
```

## 🎯 Lo que hemos añadido

### ⭐ Nuevas Carpetas/Archivos

```
NUEVOS:
  src/models/              (14 archivos de interfaces)
  src/services/            (12 archivos de servicios)
  src/controllers/         (8 archivos de controladores)
  src/routes/artists.routes.ts
  src/routes/songs.routes.ts
  src/routes/moods.routes.ts
  src/routes/liked-songs.routes.ts
  src/routes/downloads.routes.ts
  src/routes/player-state.routes.ts
  src/routes/listening-history.routes.ts
  
DOCUMENTACIÓN:
  ARQUITECTURA.md
  GUIA_RAPIDA.md
  API_ENDPOINTS.md
  COMPLETADO.md
```

## 📊 Estadísticas de Archivos

```
Total de archivos nuevos: 51+
Total de líneas de código: 3000+
Endpoints implementados: 50+

Desglose por tipo:
  Models:      14 archivos  (~700 líneas)
  Services:    12 archivos  (~1500 líneas)
  Controllers:  8 archivos  (~600 líneas)
  Routes:       8 archivos  (~300 líneas)
  Docs:         4 archivos  (~1000 líneas)
```

## 🏗️ Arquitectura de Capas

```
┌─────────────────────────────────┐
│      HTTP Request/Response      │
│  (Express Routes & Middleware)  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Controllers (Validación)     │
│  - Zod Schemas                  │
│  - Authentication/Authorization │
│  - Paginación                   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Services (Lógica de Negocio)   │
│  - CRUD Operations              │
│  - Búsqueda y Filtrado          │
│  - Relaciones Many-to-Many      │
│  - Estadísticas                 │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Models (Tipos TypeScript)     │
│  - Interfaces                   │
│  - DTOs                         │
│  - Type Safety                  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Database (PostgreSQL)        │
│  - Pool de conexiones           │
│  - Queries SQL                  │
│  - Transacciones                │
└─────────────────────────────────┘
```

## 📍 Dónde encontrar cada cosa

| Necesito... | Lo encuentro en |
|------------|------------------|
| Tipos TypeScript | `src/models/*.model.ts` |
| Crear un servicio nuevo | Ver `GUIA_RAPIDA.md` |
| Usar un servicio | `import { songService } from '@/services'` |
| Agregar un endpoint | Crear en `src/routes/*.routes.ts` |
| Validar datos | `src/controllers/*.controller.ts` |
| Referencia de endpoints | `API_ENDPOINTS.md` |
| Entender la arquitectura | `ARQUITECTURA.md` |
| Resumen de cambios | `COMPLETADO.md` |

## 🔄 Flujo de Datos (Ejemplo: GET canción)

```
1. HTTP Request
   GET /api/v1/songs/123

2. Route Handler
   src/routes/songs.routes.ts
   └─> router.get('/:id', SongController.getById)

3. Controller
   src/controllers/song.controller.ts
   └─> SongController.getById()
       ├─ Extrae parámetros
       ├─ Llama al servicio

4. Service
   src/services/song.service.ts
   └─> songService.getByIdWithRelations()
       ├─ Query BD
       ├─ Obtiene relaciones
       └─ Retorna objeto tipado

5. Model
   src/models/song.model.ts
   └─> Interfaz SongWithRelations
       ├─ Song
       ├─ Artist
       ├─ Album
       ├─ Genres
       └─ Moods

6. Database
   PostgreSQL
   └─> Ejecuta queries SQL
       ├─ SELECT songs...
       ├─ SELECT genres...
       └─ SELECT moods...

7. Response
   JSON
   {
     "id": "...",
     "title": "...",
     "artist": { ... },
     "genres": [ ... ],
     "moods": [ ... ]
   }
```

## 🎯 Patrón de Carpetas

Cada característica nueva sigue el mismo patrón:

```
Para agregar una nueva entidad (ej: "Album"):

1. Crear modelo
   src/models/album.model.ts
   ├─ interface Album
   ├─ interface CreateAlbumDTO
   └─ interface UpdateAlbumDTO

2. Crear servicio
   src/services/album.service.ts
   ├─ class AlbumService
   │  ├─ getAll()
   │  ├─ getById()
   │  ├─ create()
   │  ├─ update()
   │  └─ delete()
   └─ export albumService

3. Crear controlador
   src/controllers/album.controller.ts
   ├─ class AlbumController
   │  ├─ static getAll()
   │  ├─ static getById()
   │  ├─ static create()
   │  ├─ static update()
   │  └─ static delete()
   └─ validación con Zod

4. Crear rutas
   src/routes/albums.routes.ts
   ├─ router.get('/', AlbumController.getAll)
   ├─ router.get('/:id', AlbumController.getById)
   ├─ router.post('/', AlbumController.create)
   ├─ router.put('/:id', AlbumController.update)
   └─ router.delete('/:id', AlbumController.delete)

5. Registrar en index.ts
   src/routes/index.ts
   └─ router.use('/api/v1/albums', albumsRoutes)
```

## ✨ Ventajas de esta Estructura

✅ **Modular** - Cada archivo tiene una responsabilidad clara
✅ **Escalable** - Fácil agregar nuevas entidades
✅ **Mantenible** - Código organizado y documentado
✅ **Testeable** - Services sin dependencias HTTP
✅ **Type-Safe** - TypeScript en todas partes
✅ **Documentado** - Documentación completa incluida

---

## 🚀 Próximo Paso

Para empezar, revisa:
1. **COMPLETADO.md** - Qué se hizo
2. **ARQUITECTURA.md** - Cómo está organizado
3. **GUIA_RAPIDA.md** - Cómo extender
4. **API_ENDPOINTS.md** - Endpoints disponibles

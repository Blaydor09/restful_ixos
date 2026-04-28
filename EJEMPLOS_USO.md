# 💡 Ejemplos de Uso Práctico

## 1️⃣ Ejemplo 1: Gestionar Canciones

### Obtener todas las canciones
```typescript
import { songService } from '@/services';

// En un controlador o servicio superior
const songs = await songService.getAll(limit, offset);
console.log(songs); // Array<Song>
```

### Obtener canción con todas sus relaciones
```typescript
const song = await songService.getByIdWithRelations(songId);
console.log(song);
// {
//   id: "...",
//   title: "Imagine",
//   artist: { id: "...", name: "John Lennon" },
//   album: { id: "...", title: "Imagine" },
//   genres: [
//     { id: "...", name: "Rock" },
//     { id: "...", name: "Pop" }
//   ],
//   moods: [
//     { id: "...", name: "Feliz", score: 0.95 },
//     { id: "...", name: "Relax", score: 0.85 }
//   ]
// }
```

### Crear una canción
```typescript
const newSong = await songService.create({
  fileId: "song-123.mp3",
  filePath: "music/song-123.mp3",
  title: "New Song",
  artistId: artistUuid,
  durationS: 240.5,
  explicit: false
});
```

### Buscar canciones por título
```typescript
const results = await songService.searchByTitle("imagine", 50, 0);
// Retorna canciones que coinciden con "imagine"
```

### Agregar un género a una canción
```typescript
import { songRelationService } from '@/services';

await songRelationService.addSongGenre(songId, { genreId: genreUuid });
```

### Agregar un mood a una canción
```typescript
await songRelationService.addSongMood(songId, { 
  moodId: moodUuid,
  score: 0.95 // Puntuación de confianza (0-1)
});
```

---

## 2️⃣ Ejemplo 2: Gestionar Playlists

### Crear una playlist
```typescript
import { playlistService } from '@/services';

const playlist = await playlistService.create(userId, {
  name: "Mis Favoritos",
  description: "Mis canciones favoritas",
  visibility: "private",
  moodId: moodUuid // Opcional: asociar a un mood
});
```

### Obtener playlist con todas las canciones
```typescript
const playlist = await playlistService.getByIdWithSongs(playlistId);
console.log(playlist);
// {
//   id: "...",
//   name: "Mis Favoritos",
//   owner_id: "...",
//   songs: [
//     { id: "...", title: "Song 1", position: 1 },
//     { id: "...", title: "Song 2", position: 2 },
//     ...
//   ]
// }
```

### Agregar canción a playlist
```typescript
await playlistService.addSong(playlistId, songId);
// Se agrega automáticamente al final
```

### Reordenar canciones en playlist
```typescript
await playlistService.reorderSong(playlistId, songId, newPosition);
// Mueve la canción a la nueva posición
```

### Obtener mis playlists
```typescript
const myPlaylists = await playlistService.getByOwnerId(userId, 50, 0);
```

### Actualizar playlist
```typescript
const updated = await playlistService.update(playlistId, {
  name: "Nuevonombre",
  visibility: "public"
});
```

---

## 3️⃣ Ejemplo 3: Gestionar Favoritos

### Marcar canción como favorita
```typescript
import { likedSongService } from '@/services';

await likedSongService.addLikedSong(userId, { songId });
```

### Verificar si canción está marcada
```typescript
const liked = await likedSongService.isLiked(userId, songId);
console.log(liked); // true o false
```

### Obtener mis canciones favoritas
```typescript
const likedSongs = await likedSongService.getLikedSongs(userId, 50, 0);
console.log(likedSongs);
// [
//   { id: "...", title: "Song 1", artist_name: "Artist 1", liked_at: "2024-..." },
//   ...
// ]
```

### Desmarcar como favorita
```typescript
await likedSongService.removeLikedSong(userId, songId);
```

---

## 4️⃣ Ejemplo 4: Gestionar Descargas

### Crear descarga
```typescript
import { downloadService } from '@/services';

const download = await downloadService.createDownload(userId, { songId });
// Estado inicial: "pending"
```

### Obtener mis descargas
```typescript
const downloads = await downloadService.getDownloads(userId, 50, 0);
```

### Actualizar estado de descarga
```typescript
const updated = await downloadService.updateDownload(downloadId, {
  status: "downloading",
  fileSizeBytes: 5242880
});

// Después...
await downloadService.updateDownload(downloadId, {
  status: "completed",
  localPath: "/local/path/song.mp3",
  downloadedAt: new Date()
});
```

### Filtrar descargas por estado
```typescript
const completed = await downloadService.getDownloadsByStatus(userId, "completed");
const failed = await downloadService.getDownloadsByStatus(userId, "failed");
```

---

## 5️⃣ Ejemplo 5: Gestionar Estado del Reproductor

### Obtener estado actual del reproductor
```typescript
import { playerStateService } from '@/services';

const state = await playerStateService.getPlayerState(userId);
console.log(state);
// {
//   userId: "...",
//   currentSongId: "...",
//   positionS: 45.5,
//   repeat: "none",
//   shuffle: false,
//   updatedAt: "2024-..."
// }
```

### Reproducir una canción
```typescript
const state = await playerStateService.setCurrentSong(userId, songId, 0);
// Comienza desde la posición 0
```

### Cambiar posición de reproducción
```typescript
const state = await playerStateService.setPosition(userId, 125.5);
```

### Cambiar modo de repetición
```typescript
await playerStateService.setRepeatMode(userId, "all"); // "none", "one", "all"
```

### Activar/Desactivar shuffle
```typescript
await playerStateService.setShuffle(userId, true);
```

### Actualizar múltiples propiedades
```typescript
const state = await playerStateService.updatePlayerState(userId, {
  currentSongId: songId,
  positionS: 100,
  repeat: "all",
  shuffle: true
});
```

---

## 6️⃣ Ejemplo 6: Historial de Escucha

### Agregar canción a historial
```typescript
import { listeningHistoryService } from '@/services';

await listeningHistoryService.addToHistory(userId, {
  songId,
  durationS: 240.5,
  completed: true, // Si se escuchó completa
  moodId: moodUuid // Mood en que se escuchó
});
```

### Obtener mi historial
```typescript
const history = await listeningHistoryService.getHistory(userId, 100, 0);
```

### Obtener mis moods recientes
```typescript
const recentMoods = await listeningHistoryService.getRecentMoods(userId, 7);
// Últimos 7 días
console.log(recentMoods);
// [
//   { id: "...", name: "Feliz", frequency: 25 },
//   { id: "...", name: "Focus", frequency: 15 },
//   ...
// ]
```

### Obtener mis canciones más escuchadas
```typescript
const topSongs = await listeningHistoryService.getTopSongs(userId, 30, 50);
// Últimos 30 días, top 50 canciones
console.log(topSongs);
// [
//   { id: "...", title: "Song 1", artist_name: "Artist 1", plays: 10, total_duration: 2400 },
//   ...
// ]
```

### Obtener tiempo total de escucha
```typescript
const totalSeconds = await listeningHistoryService.getTotalListeningTime(userId, 30);
const hours = totalSeconds / 3600;
console.log(`Has escuchado ${hours.toFixed(1)} horas en los últimos 30 días`);
```

---

## 7️⃣ Ejemplo 7: Gestionar Moods

### Obtener todos los moods
```typescript
import { moodService } from '@/services';

const moods = await moodService.getAll();
console.log(moods);
// [
//   { 
//     id: "...", 
//     name: "feliz",
//     displayName: "Feliz",
//     iconName: "sentiment_satisfied",
//     gradientStart: "#FACC15",
//     gradientEnd: "#F97316",
//     sortOrder: 1
//   },
//   ...
// ]
```

### Obtener canciones de un mood
```typescript
const songs = await moodService.getSongsByMood(moodId, 50, 0);
// Canciones ordenadas por puntuación (score)
```

### Crear un mood
```typescript
const mood = await moodService.create({
  name: "gaming",
  displayName: "Gaming",
  iconName: "sports_esports",
  gradientStart: "#FF1493",
  gradientEnd: "#00FF00",
  sortOrder: 9
});
```

---

## 8️⃣ Ejemplo 8: Gestionar Artistas

### Obtener todos los artistas
```typescript
import { artistService } from '@/services';

const artists = await artistService.getAll(50, 0);
```

### Obtener artista por ID
```typescript
const artist = await artistService.getById(artistId);
```

### Obtener canciones del artista
```typescript
// Combinando servicios
const artist = await artistService.getById(artistId);
const songs = await songService.getByArtistId(artistId);
```

### Crear artista
```typescript
const artist = await artistService.create({
  name: "New Artist",
  imageUrl: "https://example.com/artist.jpg"
});
```

---

## 9️⃣ Ejemplo 9: Casos de Uso Complejos

### Caso 1: Reproducir una playlist aleatoria según un mood

```typescript
import { moodService, playerStateService } from '@/services';

// 1. Obtener canciones del mood
const songs = await moodService.getSongsByMood(moodId, 100, 0);

// 2. Seleccionar aleatoria
const randomSong = songs[Math.floor(Math.random() * songs.length)];

// 3. Activar shuffle
await playerStateService.setCurrentSong(userId, randomSong.id, 0);
await playerStateService.setShuffle(userId, true);

// 4. Agregar al historial
await listeningHistoryService.addToHistory(userId, {
  songId: randomSong.id,
  durationS: 0,
  moodId: moodId
});
```

### Caso 2: Crear recomendación basada en historial

```typescript
// 1. Obtener moods recientes del usuario
const recentMoods = await listeningHistoryService.getRecentMoods(userId, 7);
const topMood = recentMoods[0];

// 2. Obtener canciones del top mood
const recommendedSongs = await moodService.getSongsByMood(topMood.id, 20, 0);

// 3. Crear playlist de recomendación
const playlist = await playlistService.create(userId, {
  name: `Recomendado: ${topMood.name}`,
  description: "Basado en tu historial reciente",
  visibility: "private",
  moodId: topMood.id
});

// 4. Agregar canciones
for (const song of recommendedSongs.slice(0, 10)) {
  await playlistService.addSong(playlist.id, song.id);
}

return playlist;
```

### Caso 3: Estadísticas del usuario

```typescript
// Obtener estadísticas completas del usuario

const [
  likedCount,
  downloadedCount,
  playlistCount,
  topSongs,
  topMoods,
  totalTime
] = await Promise.all([
  likedSongService.getLikedCount(userId),
  downloadService.getDownloadsByStatus(userId, "completed").then(d => d.length),
  playlistService.getByOwnerId(userId, 1000, 0).then(p => p.length),
  listeningHistoryService.getTopSongs(userId, 30, 5),
  listeningHistoryService.getRecentMoods(userId, 7),
  listeningHistoryService.getTotalListeningTime(userId, 30)
]);

const stats = {
  likedSongs: likedCount,
  downloadedSongs: downloadedCount,
  playlists: playlistCount,
  topSongs: topSongs.slice(0, 5),
  favoriteModds: topMoods.slice(0, 3),
  listeningHours: totalTime / 3600,
  lastMonth: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  }
};

return stats;
```

---

## 🔟 Ejemplo 10: Manejo de Errores

```typescript
import { ApiError } from '@/utils/api-error';

try {
  // Esto lanzará ApiError si no existe
  const song = await songService.getById("invalid-id");
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.message); // "Song not found"
    console.log(error.statusCode); // 404
  }
}
```

---

## 📝 Resumen de Patrones

### Patrón 1: CRUD Básico
```typescript
const items = await service.getAll(limit, offset);
const item = await service.getById(id);
const created = await service.create(data);
const updated = await service.update(id, data);
await service.delete(id);
```

### Patrón 2: Relaciones
```typescript
const relations = await relationService.getRelations(parentId);
await relationService.addRelation(parentId, childId);
await relationService.removeRelation(parentId, childId);
```

### Patrón 3: Búsqueda
```typescript
const results = await service.search(query, limit, offset);
const item = await service.getByField(field, value);
```

### Patrón 4: Estadísticas
```typescript
const stats = await service.getStats(userId, period);
const top = await service.getTop(userId, limit);
```

---

## ✨ Tips

1. **Siempre usar servicios** - No queries SQL directamente
2. **Validar entrada en controlador** - Usar Zod schemas
3. **Manejar errores** - Los servicios lanzan ApiError
4. **Cachear resultados** - Para queries costosas
5. **Usar transacciones** - Para operaciones complejas
6. **Type-safe** - Aprovechar TypeScript

¡Ahora está listo para usar! 🚀

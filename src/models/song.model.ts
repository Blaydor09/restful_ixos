export interface Song {
  id: string;
  fileId: string;
  filePath: string;
  cdnUrl?: string;
  title: string;
  artistId: string;
  albumId?: string;
  coverUrl?: string;
  releaseYear?: number;
  durationS: number;
  explicit: boolean;
  playCount: number;
  createdAt: Date;
}

export interface CreateSongDTO {
  fileId: string;
  filePath: string;
  cdnUrl?: string;
  title: string;
  artistId: string;
  albumId?: string;
  coverUrl?: string;
  releaseYear?: number;
  durationS: number;
  explicit?: boolean;
}

export interface UpdateSongDTO {
  title?: string;
  albumId?: string;
  coverUrl?: string;
  releaseYear?: number;
  cdnUrl?: string;
}

export interface SongWithRelations extends Song {
  artist: {
    id: string;
    name: string;
  };
  album?: {
    id: string;
    title: string;
  };
  genres: Array<{
    id: string;
    name: string;
  }>;
  moods: Array<{
    id: string;
    name: string;
    score: number;
  }>;
}

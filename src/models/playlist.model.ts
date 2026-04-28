export type PlaylistVisibility = 'private' | 'public';

export interface Playlist {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  visibility: PlaylistVisibility;
  moodId?: string;
  totalSongs: number;
  totalDurationS: number;
  createdAt: Date;
}

export interface CreatePlaylistDTO {
  name: string;
  description?: string;
  coverUrl?: string;
  visibility?: PlaylistVisibility;
  moodId?: string;
}

export interface UpdatePlaylistDTO {
  name?: string;
  description?: string;
  coverUrl?: string;
  visibility?: PlaylistVisibility;
  moodId?: string;
}

export interface PlaylistWithSongs extends Playlist {
  songs: Array<{
    id: string;
    title: string;
    artistId: string;
    durationS: number;
    position: number;
  }>;
}

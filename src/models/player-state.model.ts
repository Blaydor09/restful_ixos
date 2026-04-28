export type RepeatMode = 'none' | 'one' | 'all';

export interface PlayerState {
  userId: string;
  currentSongId?: string;
  positionS: number;
  repeat: RepeatMode;
  shuffle: boolean;
  updatedAt: Date;
}

export interface UpdatePlayerStateDTO {
  currentSongId?: string | null;
  positionS?: number;
  repeat?: RepeatMode;
  shuffle?: boolean;
}

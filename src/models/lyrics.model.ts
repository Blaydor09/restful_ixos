export interface Lyrics {
  id: string;
  songId: string;
  lineIndex: number;
  startMs: number;
  endMs: number;
  text: string;
}

export interface CreateLyricsDTO {
  lineIndex: number;
  startMs: number;
  endMs: number;
  text: string;
}

export interface UpdateLyricsDTO {
  text?: string;
  startMs?: number;
  endMs?: number;
}

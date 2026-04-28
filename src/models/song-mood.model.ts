export interface SongMood {
  songId: string;
  moodId: string;
  score: number;
}

export interface AddSongMoodDTO {
  moodId: string;
  score?: number;
}

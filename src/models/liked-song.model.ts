export interface LikedSong {
  userId: string;
  songId: string;
  likedAt: Date;
}

export interface CreateLikedSongDTO {
  songId: string;
}

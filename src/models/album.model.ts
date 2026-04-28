export interface Album {
  id: string;
  title: string;
  artistId: string;
  coverUrl?: string;
  releaseYear?: number;
  createdAt: Date;
}

export interface CreateAlbumDTO {
  title: string;
  artistId: string;
  coverUrl?: string;
  releaseYear?: number;
}

export interface UpdateAlbumDTO {
  title?: string;
  coverUrl?: string;
  releaseYear?: number;
}

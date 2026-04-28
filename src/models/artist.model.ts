export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface CreateArtistDTO {
  name: string;
  imageUrl?: string;
}

export interface UpdateArtistDTO {
  name?: string;
  imageUrl?: string;
}

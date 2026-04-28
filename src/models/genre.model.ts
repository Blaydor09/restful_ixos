export interface Genre {
  id: string;
  name: string;
  colorHex: string;
}

export interface CreateGenreDTO {
  name: string;
  colorHex: string;
}

export interface UpdateGenreDTO {
  name?: string;
  colorHex?: string;
}

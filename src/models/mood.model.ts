export interface Mood {
  id: string;
  name: string;
  displayName: string;
  iconName: string;
  gradientStart: string;
  gradientEnd: string;
  sortOrder: number;
}

export interface CreateMoodDTO {
  name: string;
  displayName: string;
  iconName: string;
  gradientStart: string;
  gradientEnd: string;
  sortOrder?: number;
}

export interface UpdateMoodDTO {
  displayName?: string;
  iconName?: string;
  gradientStart?: string;
  gradientEnd?: string;
  sortOrder?: number;
}

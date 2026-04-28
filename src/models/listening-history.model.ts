export interface ListeningHistory {
  id: string;
  userId: string;
  songId: string;
  moodId?: string;
  durationS: number;
  completed: boolean;
  listenedAt: Date;
}

export interface CreateListeningHistoryDTO {
  songId: string;
  moodId?: string;
  durationS: number;
  completed?: boolean;
}

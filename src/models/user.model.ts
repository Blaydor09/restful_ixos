export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdateUserDTO {
  displayName?: string;
  avatarUrl?: string;
  email?: string;
}

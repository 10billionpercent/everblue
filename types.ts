export type User = {
  id: string;
  username: string;
  createdAt: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type CreateUserInput = {
  username: string;
  password: string;
};

export type UpdateUserInput = {
  username?: string;
  password?: string;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
};
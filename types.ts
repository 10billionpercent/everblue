export type User = {
  id: string;
  username: string;
  createdAt: string;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
};

export type PaintingStatus =
  | "IDEA"
  | "SKETCH"
  | "LINEART"
  | "PAINTING"
  | "DONE";

export type PaintingType = "FOR_ME" | "COLLAB";

export type CharacterDetails = {
  name: string;
  outfit: string;
  hairstyle: string;
  expression?: string;
  pose?: string;
};

export type PaintingDescription = {
  mainDetails?: {
    theme?: string;
    background?: string;
    mood?: string;
    lighting?: string;
  };

  characters: CharacterDetails[];

  otherDetails?: {
    props?: string[];
    notes?: string;
  };
};

export type Painting = {
  id: string;
  userId: string;

  title: string;

  description: PaintingDescription;
  characters: string[];

  // ⭐ Optional Pinterest board
  pinterestBoard?: string | null;

  // ⭐ Final artwork stored in B2
  finalImageKey?: string | null;
  finalImageMime?: string | null;

  type: PaintingType;
  hostInstagram?: string;

  status: PaintingStatus;

  dueDate?: string;
  completedAt?: string;

  createdAt: string;
  updatedAt: string;
};

export type CreatePaintingInput = {
  title: string;

  description: PaintingDescription;
  characters: string[];

  pinterestBoard?: string;

  type: PaintingType;
  hostInstagram?: string;

  dueDate?: string;
};

export type UpdatePaintingInput =
  Partial<CreatePaintingInput> & {
    status?: PaintingStatus;

    finalImageKey?: string | null;
    finalImageMime?: string | null;
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


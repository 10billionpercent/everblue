import { env } from "cloudflare:workers";
import type {
  CreateUserInput,
  LoginInput,
  Session,
  UpdateUserInput,
  User,
} from "@/types";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
} from "./crypto";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type UserWithPassword = User & {
  hashedPassword: string;
};

export async function createUser({
  username,
  password,
}: CreateUserInput): Promise<User> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const hashedPassword = await hashPassword(password);

  await env.DB.prepare(
    `
      INSERT INTO users (
        id,
        username,
        hashed_password,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `,
  )
    .bind(id, username, hashedPassword, createdAt)
    .run();

  return {
    id,
    username,
    createdAt,
  };
}

export async function getUser(id: string): Promise<User | null> {
  const user = await env.DB.prepare(
    `
      SELECT
        id,
        username,
        created_at AS createdAt
      FROM users
      WHERE id = ?
    `,
  )
    .bind(id)
    .first<User>();

  return user ?? null;
}

export async function updateUser(
  id: string,
  { username, password }: UpdateUserInput,
): Promise<User | null> {
  const currentUser = await getUser(id);

  if (!currentUser) {
    return null;
  }

  const updates: string[] = [];
  const values: string[] = [];

  if (username !== undefined) {
    updates.push("username = ?");
    values.push(username);
  }

  if (password !== undefined) {
    updates.push("hashed_password = ?");
    values.push(await hashPassword(password));
  }

  if (updates.length === 0) {
    return currentUser;
  }

  await env.DB.prepare(
    `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = ?
    `,
  )
    .bind(...values, id)
    .run();

  return getUser(id);
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await env.DB.prepare(
    `
      DELETE FROM users
      WHERE id = ?
    `,
  )
    .bind(id)
    .run();

  return result.meta.changes > 0;
}

export async function verifyUserPassword({
  username,
  password,
}: LoginInput): Promise<boolean> {
  const user = await env.DB.prepare(
    `
      SELECT
        id,
        username,
        hashed_password AS hashedPassword,
        created_at AS createdAt
      FROM users
      WHERE username = ?
    `,
  )
    .bind(username)
    .first<UserWithPassword>();

  if (!user) {
    return false;
  }

  return verifyPassword(password, user.hashedPassword);
}

export async function createSession(userId: string): Promise<{
  sessionId: string;
  token: string;
  expiresAt: string;
}> {
  const sessionId = crypto.randomUUID();
  const token = generateSessionToken();
  const tokenHash = await hashSessionToken(token);

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_DURATION_MS);

  await env.DB.prepare(
    `
      INSERT INTO sessions (
        id,
        user_id,
        token_hash,
        expires_at,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
    `,
  )
    .bind(
      sessionId,
      userId,
      tokenHash,
      expiresAt.toISOString(),
      createdAt.toISOString(),
    )
    .run();

  return {
    sessionId,
    token,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const result = await env.DB.prepare(
    `
      DELETE FROM sessions
      WHERE id = ?
    `,
  )
    .bind(sessionId)
    .run();

  return result.meta.changes > 0;
}

export async function getSession(token: string): Promise<Session | null> {
  const tokenHash = await hashSessionToken(token);

  const session = await env.DB.prepare(
    `
      SELECT
        id,
        user_id AS userId,
        expires_at AS expiresAt,
        created_at AS createdAt
      FROM sessions
      WHERE token_hash = ?
    `,
  )
    .bind(tokenHash)
    .first<Session>();

  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt) <= new Date()) {
    await deleteSession(session.id);
    return null;
  }

  return session;
}

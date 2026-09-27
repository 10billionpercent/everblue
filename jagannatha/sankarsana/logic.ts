import { headers } from "next/headers";

import { auth } from "./auth";

export type AuthSession = typeof auth.$Infer.Session;

export type AuthUser = typeof auth.$Infer.User;

/**
 * Get the current session.
 *
 * Returns null when the request is unauthenticated.
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  return auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Require an authenticated session.
 *
 * Throws when the request is unauthenticated.
 */
export async function requireSession(): Promise<AuthSession> {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * Get the currently authenticated user.
 *
 * Returns null when unauthenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getCurrentSession();

  return session?.user ?? null;
}

/**
 * Require an authenticated user and return their ID.
 *
 * Hayagriva will use this when performing
 * user-owned painting operations.
 */
export async function requireUserId(): Promise<string> {
  const session = await requireSession();

  return session.user.id;
}

/**
 * Update the currently authenticated user's profile.
 */
export async function updateCurrentUser(input: {
  name?: string;
  username?: string;
}) {
  return auth.api.updateUser({
    headers: await headers(),
    body: input,
  });
}
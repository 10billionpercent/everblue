import vinextHandler from "vinext/server/app-router-entry";

import { auth } from "./sankarsana/auth";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    /*
     * Better Auth owns /api/auth/*
     *
     * This includes:
     *
     * /api/auth/sign-in/username
     * /api/auth/sign-in/social
     * /api/auth/sign-up/email
     * /api/auth/callback/google
     * /api/auth/get-session
     * /api/auth/sign-out
     * etc.
     */
    if (
      url.pathname === "/api/auth" ||
      url.pathname.startsWith("/api/auth/")
    ) {
      return auth.handler(request);
    }

    /*
     * Everything else belongs to vinext / Next.js.
     */
    return vinextHandler.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
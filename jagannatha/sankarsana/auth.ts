import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { env } from "cloudflare:workers";

export const auth = betterAuth({
  appName: "Everblue",

  baseURL: env.BETTER_AUTH_URL,

  secret: env.BETTER_AUTH_SECRET,

  database: env.DB,

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  /*
   * Keep our existing D1 table names so Hayagriva's
   * paintings.user_id -> users.id relationship stays intact.
   */
  user: {
    modelName: "users",

    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  session: {
    modelName: "sessions",

    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },

    // 30 days
    expiresIn: 60 * 60 * 24 * 30,

    // Refresh session at most once per day
    updateAge: 60 * 60 * 24,
  },

  account: {
    modelName: "accounts",

    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",

      accessToken: "access_token",
      refreshToken: "refresh_token",

      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",

      idToken: "id_token",

      createdAt: "created_at",
      updatedAt: "updated_at",
    },

    // Protect stored OAuth tokens with Better Auth's secret.
    encryptOAuthTokens: true,
  },

  plugins: [
    username({
      /*
       * Google users don't need a displayUsername column.
       * We only want the actual normalized username.
       */
      displayUsername: false,
    }),
  ],
});
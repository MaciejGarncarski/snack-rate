import { serverEnv } from "#/lib/server.env";

export const cookies = {
  session: {
    name: "user_session",
    options: {
      httpOnly: true,
      secure: serverEnv.isProd,
      sameSite: "lax" as const,
      maxAge: 31536000,
      path: "/",
    },
  },
  guestId: {
    name: "guest_id",
    options: {
      httpOnly: true,
      secure: serverEnv.isProd,
      sameSite: "lax" as const,
      maxAge: 31536000,
      path: "/",
    },
  },
  adminAuth: {
    name: "admin_auth",
    options: {
      httpOnly: true,
      secure: serverEnv.isProd,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24,
      path: "/",
    },
  },
} as const;

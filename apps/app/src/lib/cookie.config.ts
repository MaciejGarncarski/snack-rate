export const cookies = {
  session: {
    name: "user_session",
    options: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      maxAge: 31536000,
      path: "/",
    },
  },
  guestId: {
    name: "guest_id",
    options: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      maxAge: 31536000,
      path: "/",
    },
  },
} as const;

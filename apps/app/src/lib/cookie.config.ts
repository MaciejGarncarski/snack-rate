export const cookies = {
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

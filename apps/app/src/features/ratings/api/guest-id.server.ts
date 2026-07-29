import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { nanoid } from "nanoid";

import { cookies } from "#/lib/cookie.config";

export const ensureGuestId = createServerFn({ method: "GET" }).handler(() => {
  const existing = getCookie(cookies.guestId.name);

  if (existing) {
    return { guestId: existing };
  }

  const guestId = nanoid(32);
  setCookie(cookies.guestId.name, guestId, cookies.guestId.options);

  return { guestId };
});

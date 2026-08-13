import { os } from "@orpc/server";

export type ORPCContext = {
  requestHeaders: Headers;
  guestId: string | null;
  userId: string | null;
};

export const baseORPC = os.$context<ORPCContext>();

import { os } from "@orpc/server";

export type ORPCContext = {
  request: Request;
  guestId: string | null;
  userId: string | null;
};

export const baseORPC = os.$context<ORPCContext>();

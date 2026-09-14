import * as z from "zod";

export const searchSchema = z.object({
  query: z.string().trim().min(0).max(100),
});

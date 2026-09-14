import * as z from "zod";

export const searchSchema = z.object({
  query: z.string().trim().min(1).max(100),
});

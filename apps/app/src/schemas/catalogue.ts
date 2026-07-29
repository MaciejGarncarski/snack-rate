import * as z from "zod";

import { MAXIMUM_IMAGES } from "#/const/image-const";
import { optionalEanSchema } from "#/schemas/ean";

export const snackSlugSchema = z.object({
  slug: z.string(),
});

export const listSnacksSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const createSnackInputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  barcode: optionalEanSchema,
  typeSlug: z.string(),
  images: z.array(z.string()).min(1).max(MAXIMUM_IMAGES),
  captchaCode: z.string().length(5),
});

export const createSnackFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  description: z.string().max(2000).optional(),
  barcode: optionalEanSchema,
  typeSlug: z.string().min(1, "Rodzaj jest wymagany"),
  images: z
    .array(z.instanceof(File))
    .min(1, "Wymagana jest przynajmniej jedna grafika")
    .max(MAXIMUM_IMAGES, "Maksymalnie 3 grafiki"),
  captchaCode: z.string().length(5, "Wpisz 5-znakowy kod z obrazka"),
});

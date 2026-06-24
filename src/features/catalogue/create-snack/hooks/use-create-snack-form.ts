import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { useCreateSnack } from "#/features/catalogue/create-snack/hooks/use-create-snack";

export const createSnackSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  description: z.string().max(2000),
  price: z
    .string()
    .refine(
      (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) > 0),
      "Cena musi być liczbą większą od 0",
    )
    .refine((v) => Number(v) <= 100, "Cena nie może być większa niż 100"),
  barcode: z.string(),
  typeSlug: z.string().min(1, "Rodzaj jest wymagany"),
  images: z
    .array(z.instanceof(File))
    .min(1, "Wymagana jest przynajmniej jedna grafika")
    .max(3, "Maksymalnie 3 grafiki"),
});

export type FormValues = z.infer<typeof createSnackSchema>;

export const useCreateSnackForm = () => {
  const { createSnack } = useCreateSnack();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      barcode: "",
      typeSlug: "",
      images: [] as File[],
    } satisfies FormValues,
    validators: {
      onChange: createSnackSchema,
    },
    onSubmit: ({ value }) => {
      const formData = new FormData();
      formData.append("name", value.name);
      formData.append("description", value.description);

      if (value.price) {
        formData.append("price", value.price);
      }

      if (value.barcode) {
        formData.append("barcode", value.barcode);
      }

      if (value.typeSlug) {
        formData.append("typeSlug", value.typeSlug);
      }

      for (const image of value.images) {
        formData.append("images", image);
      }

      createSnack(formData);
    },
  });

  return form;
};

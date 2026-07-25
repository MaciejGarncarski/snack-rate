import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { useCreateSnack } from "#/features/catalogue/create-snack/hooks/use-create-snack";
import { optionalEanSchema } from "#/schemas/ean";

export const createSnackSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(200),
  description: z.string().max(2000),
  barcode: optionalEanSchema,
  typeSlug: z.string().min(1, "Rodzaj jest wymagany"),
  images: z
    .array(z.instanceof(File))
    .min(1, "Wymagana jest przynajmniej jedna grafika")
    .max(3, "Maksymalnie 3 grafiki"),
  captchaCode: z.string().length(5, "Wpisz 5-znakowy kod z obrazka"),
});

export type FormValues = z.infer<typeof createSnackSchema>;

const defaultValues: FormValues = {
  name: "",
  description: "",
  barcode: "",
  typeSlug: "",
  images: [],
  captchaCode: "",
};

export const useCreateSnackForm = () => {
  const { createSnack } = useCreateSnack();

  const form = useForm({
    defaultValues,
    validators: {
      onChange: createSnackSchema,
      onSubmit: createSnackSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const formData = new FormData();
      formData.append("name", value.name);
      formData.append("description", value.description);

      if (value.barcode) {
        formData.append("barcode", value.barcode);
      }

      if (value.typeSlug) {
        formData.append("typeSlug", value.typeSlug);
      }

      for (const image of value.images) {
        formData.append("images", image);
      }

      formData.append("captchaCode", value.captchaCode);

      await createSnack(formData);
      formApi.reset();
    },
  });

  return form;
};

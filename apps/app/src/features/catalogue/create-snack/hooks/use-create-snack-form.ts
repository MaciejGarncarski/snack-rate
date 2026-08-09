import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { regenerateCaptcha } from "#/features/captcha/store";
import { useCreateSnack } from "#/features/catalogue/create-snack/hooks/use-create-snack";
import { createSnackFormSchema } from "#/schemas/catalogue";

export type FormValues = z.infer<typeof createSnackFormSchema>;

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
      onSubmit: createSnackFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const formData = new FormData();
      formData.append("name", value.name);
      if (value.description) {
        formData.append("description", value.description);
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

      formData.append("captchaCode", value.captchaCode);

      try {
        await createSnack(formData);
        formApi.reset();
      } catch {
        regenerateCaptcha();
      }
    },
  });

  return form;
};

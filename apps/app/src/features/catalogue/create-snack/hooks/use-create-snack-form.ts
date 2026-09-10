import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import * as z from "zod";

import { useCreateSnack } from "#/features/catalogue/create-snack/hooks/use-create-snack";
import { createSnackFormSchema } from "#/schemas/catalogue";

export type FormValues = z.infer<typeof createSnackFormSchema>;

const defaultValues: FormValues = {
  name: "",
  description: "",
  barcode: "",
  typeSlug: "",
  images: [],
};

export const useCreateSnackForm = () => {
  const { createSnack } = useCreateSnack();
  const [token, setToken] = useState<string | undefined>();
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const resetTurnstile = () => {
    setToken(undefined);
    turnstileRef.current?.reset();
  };

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

      try {
        await createSnack(formData, token);
        formApi.reset();
      } catch {
        // keep form state on error; submission will surface validation/server errors
      } finally {
        // Turnstile tokens are single-use; reset the widget after a submit attempt
        resetTurnstile();
      }
    },
  });

  return { form, token, setToken, turnstileRef };
};

import { useForm } from "@tanstack/react-form";
import * as z from "zod";

export const createSnackSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000),
  price: z
    .string()
    .refine(
      (v) => v === "" || (!Number.isNaN(Number.parseFloat(v)) && Number.parseFloat(v) > 0),
      "Price must be a positive number",
    ),
  barcode: z.string(),
  typeSlug: z.string().min(1, "Type is required"),
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(3, "Maximum 3 images"),
});

export type FormValues = z.infer<typeof createSnackSchema>;

type Props = {
  onSubmit: (formData: FormData) => Promise<void>;
};

export const useCreateSnackForm = ({ onSubmit }: Props) => {
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
    onSubmit: async ({ value }) => {
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

      await onSubmit(formData);
    },
  });

  return form;
};

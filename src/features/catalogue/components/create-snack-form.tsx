import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";

import { ImagePicker } from "./image-picker";

const createSnackSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000),
  price: z
    .string()
    .refine(
      (v) => v === "" || (!Number.isNaN(Number.parseFloat(v)) && Number.parseFloat(v) > 0),
      "Price must be a positive number",
    ),
  barcode: z.string(),
  brandId: z.string(),
  typeId: z.string(),
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(3, "Maximum 3 images"),
});

type FormValues = z.infer<typeof createSnackSchema>;

type Brand = {
  id: string;
  name: string;
};

type SnackType = {
  id: string;
  name: string;
};

type Props = {
  onSubmit: (formData: FormData) => Promise<void>;
  brands: Brand[];
  types: SnackType[];
};

function getErrorMessage(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const first = errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first)
    return String((first as { message: unknown }).message);
  return String(first);
}

export function CreateSnackForm({ onSubmit, brands, types }: Props) {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      barcode: "",
      brandId: "",
      typeId: "",
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

      if (value.brandId) {
        formData.append("brandId", value.brandId);
      }

      if (value.typeId) {
        formData.append("typeId", value.typeId);
      }

      for (const image of value.images) {
        formData.append("images", image);
      }

      await onSubmit(formData);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex-1">
          <form.Field name="images">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <ImagePicker
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(field.state.meta.errors)}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex flex-1 flex-col gap-5">
          <form.Field name="name">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Input
                  type="text"
                  placeholder="Snack name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(field.state.meta.errors)}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Textarea
                placeholder="Description (optional)"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="price">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Input
                    type="number"
                    placeholder="Price (optional)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    step="0.01"
                    min="0"
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {getErrorMessage(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="barcode">
              {(field) => (
                <Input
                  type="text"
                  placeholder="Barcode (optional)"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </div>
          {/*
          <form.Field name="brandId">
            {(field) => (
              <FormCombobox
                options={brands}
                value={field.state.value}
                onChange={(val) => field.handleChange(val)}
                placeholder="Brand (optional)"
              />
            )}
          </form.Field> */}

          <form.Field name="typeId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                {/* <FormCombobox
                  options={types}
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val)}
                  placeholder="Type (optional)"
                /> */}
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(field.state.meta.errors)}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <form.Subscribe
        selector={(state) => ({
          hasSubmitError: "onSubmit" in state.errorMap && state.errorMap.onSubmit !== undefined,
          submitError: "onSubmit" in state.errorMap ? state.errorMap.onSubmit : undefined,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
        // oxlint-disable-next-line react/no-children-prop
        children={({ hasSubmitError, submitError, canSubmit, isSubmitting }) => (
          <>
            {hasSubmitError && <p className="text-sm text-destructive">{String(submitError)}</p>}
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Snack"}
            </Button>
          </>
        )}
      />
    </form>
  );
}

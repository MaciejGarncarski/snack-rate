export type CreateSnackInput = {
  formData: FormData;
};

export const buildCreateSnackPayload = (formData: FormData) => {
  const name = formData.get("name");
  const description = formData.get("description");
  const barcode = formData.get("barcode");
  const typeSlug = formData.get("typeSlug");

  const images: File[] = [];

  for (const [key, value] of formData.entries()) {
    if (key === "images" && value instanceof File) {
      images.push(value);
    }
  }

  return {
    name: String(name),
    description: description ? String(description) : undefined,
    barcode: barcode ? String(barcode) : undefined,
    typeSlug: typeSlug?.toString() || "",
    images,
  };
};

export const buildCreateSnackPayload = (formData: FormData) => {
  const name = formData.get("name");
  const description = formData.get("description");
  const barcode = formData.get("barcode");
  const typeSlug = formData.get("typeSlug");

  const images = [...formData.entries()].flatMap(([key, value]) =>
    key === "images" && value instanceof File ? [value] : [],
  );

  return {
    name: String(name),
    description: description ? String(description) : undefined,
    barcode: barcode ? String(barcode) : undefined,
    typeSlug: typeSlug?.toString() || "",
    images,
  };
};

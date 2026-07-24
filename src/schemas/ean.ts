import * as z from "zod";

function isValidEAN(ean: string): boolean {
  if (!/^\d{8}$|^\d{13}$/u.test(ean)) {
    return false;
  }

  const digits = ean.split("").map(Number);
  const checkDigit = digits.pop()!;

  const sum = digits.toReversed().reduce((acc, digit, index) => {
    const weight = index % 2 === 0 ? 3 : 1;
    return acc + digit * weight;
  }, 0);

  const calculated = (10 - (sum % 10)) % 10;

  return calculated === checkDigit;
}

const eanBaseSchema = z.string().trim().refine(isValidEAN, {
  message: "Nieprawidłowy kod EAN.",
});

export const eanSchema = eanBaseSchema;

export const optionalEanSchema = eanBaseSchema.optional();

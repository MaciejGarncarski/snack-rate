const LOCALE = "pl-PL";

const rules = new Intl.PluralRules(LOCALE);

export const createPluralizer =
  (phrases: Partial<Record<Intl.LDMLPluralRule, string>>) => (count: number) =>
    phrases[rules.select(count)] ?? null;

export const pluralizeRatings = createPluralizer({
  one: "ocena",
  few: "oceny",
  many: "ocen",
  other: "ocen",
});

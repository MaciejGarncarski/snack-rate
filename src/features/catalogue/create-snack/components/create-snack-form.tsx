import { Block } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "#/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { ImagePicker } from "#/features/catalogue/create-snack/components/image-picker";
import { useCreateSnackForm } from "#/features/catalogue/create-snack/hooks/use-create-snack-form";

function getErrorMessage(errors: unknown[]): string | undefined {
  if (errors.length === 0) return undefined;
  const first = errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first)
    return String((first as { message: unknown }).message);
  return String(first);
}

type SnackType = {
  name: string;
  slug: string;
};

type SnackTypeFormatted = {
  value: string;
  label: string;
};

type Props = {
  onSubmit: (formData: FormData) => Promise<void>;
  types: SnackType[];
};

export function CreateSnackForm({ onSubmit, types }: Props) {
  const form = useCreateSnackForm({ onSubmit });
  const typesFormMapped = types.map((t): SnackTypeFormatted => ({ value: t.slug, label: t.name }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="mx-auto flex flex-col gap-10"
    >
      <Block
        shouldBlockFn={() => {
          if (!form.state.isDirty) return false;

          const shouldLeave = confirm(
            "Czy na pewno chcesz opuścić stronę? Wprowadzone zmiany zostaną utracone.",
          );
          return !shouldLeave;
        }}
        enableBeforeUnload={form.state.isDirty}
      />
      <div className="flex flex-col gap-20 md:flex-row">
        <form.Field name="images">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <ImagePicker
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>}
              </Field>
            );
          }}
        </form.Field>
        <div className="flex flex-col gap-6 md:w-[20rem]">
          <form.Field name="name">
            {(field) => (
              <Field>
                <FieldLabel>Nazwa</FieldLabel>
                <Input
                  size="lg"
                  placeholder="Nazwa"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel>Opis (opcjonalnie)</FieldLabel>
                <Textarea
                  size="lg"
                  placeholder="Opis (opcjonalnie)"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="price">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Cena (opcjonalnie)</FieldLabel>
                  <Input
                    size="lg"
                    type="number"
                    placeholder="Cena (opcjonalnie)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    step="0.01"
                    min="0"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="barcode">
            {(field) => (
              <Field>
                <FieldLabel>Kod kreskowy (opcjonalnie)</FieldLabel>
                <Input
                  type="text"
                  size="lg"
                  placeholder="Kod kreskowy - numer"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="typeSlug">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Rodzaj</FieldLabel>
                  <Combobox
                    aria-invalid={isInvalid}
                    items={typesFormMapped}
                    value={typesFormMapped.find((t) => t.value === form.state.values.typeSlug)}
                    onValueChange={(value) => {
                      if (value?.value) {
                        field.handleChange(value?.value);
                      }
                    }}
                  >
                    <ComboboxInput size="lg" placeholder="Rodzaj" />
                    <ComboboxPopup>
                      <ComboboxEmpty>Brak typów.</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item.value} value={item}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxPopup>
                  </Combobox>
                  {isInvalid && <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>}
                </Field>
              );
            }}
          </form.Field>

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
                {hasSubmitError && (
                  <p className="text-sm text-destructive">{String(submitError)}</p>
                )}
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <Button type="button" disabled={true} variant={"outline"}>
                    Podgląd produktu (wkrótce)
                  </Button>
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? "Dodawanie..." : "Dodaj"}
                  </Button>
                </div>
              </>
            )}
          />
        </div>
      </div>
    </form>
  );
}

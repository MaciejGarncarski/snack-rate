import { NavigationBlock } from "#/components/layout/navigation-block";
import { Button } from "#/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "#/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { ImagePicker } from "#/features/catalogue/create-snack/components/image-picker";
import { useCreateSnackForm } from "#/features/catalogue/create-snack/hooks/use-create-snack-form";

type SnackType = {
  name: string;
  slug: string;
};

type SnackTypeFormatted = {
  value: string;
  label: string;
};

type Props = {
  types: SnackType[];
};

function getErrorMessage(errors: unknown[]): string {
  return errors.map((e: any) => e?.message ?? String(e)).join(", ");
}

export function CreateSnackForm({ types }: Props) {
  const form = useCreateSnackForm();
  const typesFormMapped = types.map((t): SnackTypeFormatted => ({ value: t.slug, label: t.name }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex w-full flex-col gap-12 "
    >
      <div className="flex flex-col gap-4 justify-between md:flex-row">
        <form.Field name="images">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field className="w-76 mx-auto md:mx-0 md:w-82 xl:w-90" data-invalid={isInvalid}>
                <ImagePicker
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                />
                <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>
              </Field>
            );
          }}
        </form.Field>
        <div className="flex flex-col gap-6 md:w-[20rem]">
          <form.Field name="typeSlug">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Rodzaj</FieldLabel>
                  <Combobox
                    selectionMode="single"
                    isRequired
                    value={field.state.value}
                    onChange={(key) => {
                      const value = key?.toString();

                      if (value) {
                        field.handleChange(value);
                      }
                    }}
                    allowsEmptyCollection
                    menuTrigger="focus"
                    aria-invalid={isInvalid}
                    name={field.name}
                  >
                    <ComboboxInput
                      aria-invalid={isInvalid}
                      placeholder="Rodzaj"
                      onBlur={field.handleBlur}
                      autoComplete="off"
                    />
                    <ComboboxContent>
                      <ComboboxList
                        renderEmptyState={() => <ComboboxEmpty>Brak typów.</ComboboxEmpty>}
                        items={typesFormMapped}
                      >
                        {(item) => (
                          <ComboboxItem id={item.value} textValue={item.label}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="name">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Nazwa</FieldLabel>
                  <Input
                    placeholder="Nazwa"
                    value={field.state.value}
                    name={field.name}
                    id={field.name}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Opis (opcjonalnie)</FieldLabel>
                  <Textarea
                    placeholder="Opis (opcjonalnie)"
                    value={field.state.value}
                    name={field.name}
                    id={field.name}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="price">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Cena (opcjonalnie)</FieldLabel>
                  <Input
                    type="number"
                    placeholder="Cena (opcjonalnie)"
                    value={field.state.value}
                    name={field.name}
                    id={field.name}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    step="0.01"
                    min="0"
                  />
                  <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="barcode">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Kod kreskowy (opcjonalnie)</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Kod kreskowy - numer"
                    value={field.state.value}
                    name={field.name}
                    id={field.name}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
              shouldBlockNavigation: state.isDirty && !state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting, shouldBlockNavigation }) => (
              <>
                <NavigationBlock shouldBlock={shouldBlockNavigation} />
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <Button isDisabled variant="outline">
                    Podgląd produktu (wkrótce)
                  </Button>
                  <Button type="submit" isDisabled={!canSubmit}>
                    {isSubmitting ? "Wysyłanie..." : "Wyślij"}
                  </Button>
                </div>
              </>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  );
}

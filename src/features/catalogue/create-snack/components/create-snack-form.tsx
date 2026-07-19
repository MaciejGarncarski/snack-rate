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
            return (
              <Field className="w-76 mx-auto md:mx-0 md:w-82 xl:w-90">
                <ImagePicker
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                />
                <FieldError>{getErrorMessage(field.state.meta.errors)}</FieldError>
              </Field>
            );
          }}
        </form.Field>
        <div className="flex flex-col gap-10 md:w-[20rem]">
          <form.Field name="typeSlug">
            {(field) => {
              return (
                <Field>
                  <FieldLabel>Rodzaj</FieldLabel>
                  <Combobox<SnackTypeFormatted> menuTrigger="focus" items={typesFormMapped}>
                    <ComboboxInput placeholder="Rodzaj" onBlur={field.handleBlur} />
                    <ComboboxContent>
                      <ComboboxEmpty>Brak typów.</ComboboxEmpty>
                      <ComboboxList<SnackTypeFormatted>>
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
              return (
                <Field>
                  <FieldLabel>Nazwa</FieldLabel>
                  <Input
                    placeholder="Nazwa"
                    value={field.state.value}
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
              return (
                <Field>
                  <FieldLabel>Opis (opcjonalnie)</FieldLabel>
                  <Textarea
                    placeholder="Opis (opcjonalnie)"
                    value={field.state.value}
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
              return (
                <Field>
                  <FieldLabel>Cena (opcjonalnie)</FieldLabel>
                  <Input
                    type="number"
                    placeholder="Cena (opcjonalnie)"
                    value={field.state.value}
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
              return (
                <Field>
                  <FieldLabel>Kod kreskowy (opcjonalnie)</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Kod kreskowy - numer"
                    value={field.state.value}
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

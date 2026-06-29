import { NavigationBlock } from "#/components/layout/navigation-block";
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
      <div className="flex flex-col justify-between md:flex-row">
        <form.Field name="images">
          {(field) => {
            const hasError = field.state.meta.errors.length > 0;
            return (
              <Field invalid={hasError}>
                <ImagePicker
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                />
                <FieldError match={hasError}>{getErrorMessage(field.state.meta.errors)}</FieldError>
              </Field>
            );
          }}
        </form.Field>
        <div className="flex flex-col gap-10 md:w-[20rem]">
          <form.Field name="typeSlug">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0;
              return (
                <Field invalid={hasError}>
                  <FieldLabel>Rodzaj</FieldLabel>
                  <Combobox
                    items={typesFormMapped}
                    value={
                      typesFormMapped.find((t) => t.value === field.state.value) || {
                        label: "",
                        value: "",
                      }
                    }
                    onValueChange={(value) => {
                      if (value?.value) {
                        field.handleChange(value?.value);
                      }
                    }}
                  >
                    <ComboboxInput size="lg" placeholder="Rodzaj" onBlur={field.handleBlur} />
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
                  <FieldError match={hasError}>
                    {getErrorMessage(field.state.meta.errors)}
                  </FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="name">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0;
              return (
                <Field invalid={hasError}>
                  <FieldLabel>Nazwa</FieldLabel>
                  <Input
                    size="lg"
                    placeholder="Nazwa"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError match={hasError}>
                    {getErrorMessage(field.state.meta.errors)}
                  </FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0;
              return (
                <Field invalid={hasError}>
                  <FieldLabel>Opis (opcjonalnie)</FieldLabel>
                  <Textarea
                    size="lg"
                    placeholder="Opis (opcjonalnie)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError match={hasError}>
                    {getErrorMessage(field.state.meta.errors)}
                  </FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="price">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0;
              return (
                <Field invalid={hasError}>
                  <FieldLabel>Cena (opcjonalnie)</FieldLabel>
                  <Input
                    size="lg"
                    type="number"
                    placeholder="Cena (opcjonalnie)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    step="0.01"
                    min="0"
                  />
                  <FieldError match={hasError}>
                    {getErrorMessage(field.state.meta.errors)}
                  </FieldError>
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="barcode">
            {(field) => {
              const hasError = field.state.meta.errors.length > 0;
              return (
                <Field invalid={hasError}>
                  <FieldLabel>Kod kreskowy (opcjonalnie)</FieldLabel>
                  <Input
                    type="text"
                    size="lg"
                    placeholder="Kod kreskowy - numer"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError match={hasError}>
                    {getErrorMessage(field.state.meta.errors)}
                  </FieldError>
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
                  <Button type="button" disabled={true} variant={"outline"}>
                    Podgląd produktu (wkrótce)
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? "Dodawanie..." : "Dodaj"}
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

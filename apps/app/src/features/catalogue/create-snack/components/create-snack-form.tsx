import { CheckIcon, ScanBarcodeIcon } from "lucide-react";
import { useState } from "react";

import { BarcodeScannerDialog } from "#/components/barcode-scanner-dialog";
import { NavigationBlock } from "#/components/layout/navigation-block";
import { SnackBarcode } from "#/components/snacks/snack-barcode";
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
import { Tooltip, TooltipTrigger } from "#/components/ui/tooltip";
import { ImagePicker } from "#/features/catalogue/create-snack/components/image-picker";
import { SnackFormCard } from "#/features/catalogue/create-snack/components/snack-form-card";
import { useCreateSnackForm } from "#/features/catalogue/create-snack/hooks/use-create-snack-form";
import { extractFormError } from "#/lib/form-error-message";

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

export function CreateSnackForm({ types }: Props) {
  const form = useCreateSnackForm();
  const typesFormMapped = types.map((t): SnackTypeFormatted => ({ value: t.slug, label: t.name }));
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  const submitForm = (formEvent: React.ChangeEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    formEvent.stopPropagation();
    form.handleSubmit();
  };

  return (
    <form onSubmit={submitForm} className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-2">
      <SnackFormCard
        step="01"
        title="O produkcie"
        description="Podaj informacje, które pomogą innym rozpoznać produkt na półce."
      >
        <form.Field name="typeSlug">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="text-sm">
                  Rodzaj<span className="text-primary font-bold">*</span>
                </FieldLabel>
                <Combobox
                  selectionMode="single"
                  isRequired
                  value={field.state.value}
                  onChange={(key) => {
                    const value = key?.toString();
                    if (value) field.handleChange(value);
                  }}
                  allowsEmptyCollection
                  menuTrigger="focus"
                  aria-invalid={isInvalid}
                  name={field.name}
                  id={field.name}
                >
                  <ComboboxInput
                    aria-invalid={isInvalid}
                    placeholder="Wybierz rodzaj produktu"
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
                <FieldError>{extractFormError(field.state.meta.errors)}</FieldError>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="text-sm">
                  Nazwa<span className="text-primary font-bold">*</span>
                </FieldLabel>
                <Input
                  placeholder="np. Coca-Cola Zero Sugar"
                  value={field.state.value}
                  name={field.name}
                  id={field.name}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError>{extractFormError(field.state.meta.errors)}</FieldError>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="text-sm">
                  Opis <span className="font-normal text-muted-foreground">(opcjonalnie)</span>
                </FieldLabel>
                <Textarea
                  placeholder="Co warto o nim wiedzieć? Smak, wariant, edycja..."
                  value={field.state.value}
                  name={field.name}
                  id={field.name}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="min-h-21"
                />
                <FieldError>{extractFormError(field.state.meta.errors)}</FieldError>
              </Field>
            );
          }}
        </form.Field>
      </SnackFormCard>

      <SnackFormCard
        step="02"
        title="Zdjęcia produktu"
        description="Dodaj wyraźne zdjęcie przodu opakowania. Możesz dodać także tył lub szczegóły."
      >
        <form.Field name="images">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="gap-3">
                <ImagePicker
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                />
                <FieldError className="text-center">
                  {extractFormError(field.state.meta.errors)}
                </FieldError>
              </Field>
            );
          }}
        </form.Field>
      </SnackFormCard>

      <SnackFormCard
        step="03"
        title="Potwierdź zgłoszenie"
        description="Kod kreskowy ułatwia znalezienie dokładnie tego wariantu."
      >
        <form.Field name="barcode">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="text-sm">
                  Kod kreskowy{" "}
                  <span className="font-normal text-muted-foreground">(opcjonalnie)</span>
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Wpisz numer kodu kreskowego"
                    value={field.state.value}
                    name={field.name}
                    id={field.name}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="flex-1"
                  />
                  <TooltipTrigger>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onPress={() => setIsBarcodeScannerOpen(true)}
                      aria-label="Skanuj kod kreskowy"
                      className="shrink-0 rounded-full"
                    >
                      <ScanBarcodeIcon className="size-4" />
                    </Button>
                    <Tooltip>
                      <p>Skanuj kod kreskowy</p>
                    </Tooltip>
                  </TooltipTrigger>
                </div>
                <FieldError>{extractFormError(field.state.meta.errors)}</FieldError>
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({
            barcode: state.values.barcode,
            hasBarcodeError: (state.fieldMeta.barcode?.errors?.length ?? 0) > 0,
          })}
        >
          {(field) =>
            field.barcode && !field.hasBarcodeError ? (
              <div className="flex justify-center rounded-2xl bg-muted/40 p-4">
                <SnackBarcode barcode={field.barcode} size="md" />
              </div>
            ) : null
          }
        </form.Subscribe>
      </SnackFormCard>

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
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Po wysłaniu sprawdzimy zgłoszenie przed publikacją.
              </p>
              <Button type="submit" isDisabled={!canSubmit} className="gap-2 sm:min-w-44" size="lg">
                <CheckIcon className="size-4" />
                {isSubmitting ? "Wysyłanie…" : "Wyślij zgłoszenie"}
              </Button>
            </div>
          </>
        )}
      </form.Subscribe>

      <BarcodeScannerDialog
        open={isBarcodeScannerOpen}
        onOpenChange={setIsBarcodeScannerOpen}
        onScan={(barcode) => {
          form.setFieldValue("barcode", barcode);
        }}
      />
    </form>
  );
}

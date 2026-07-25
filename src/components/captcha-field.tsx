import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { getCaptcha } from "#/lib/captcha";

type CaptchaFieldProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  onBlur?: () => void;
  isInvalid?: boolean;
  errors?: unknown[];
};

export function CaptchaField({
  value,
  onChange,
  name,
  onBlur,
  isInvalid,
  errors,
}: CaptchaFieldProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCaptcha = useCallback(() => {
    setIsLoading(true);
    getCaptcha()
      .then((svgString) => {
        setSvg(svgString);
        onChange("");
      })
      .catch(() => {
        setSvg(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [onChange]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel>Kod z obrazka</FieldLabel>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 h-20 w-full">
          {isLoading ? (
            <div className=" animate-pulse rounded bg-muted h-full w-full" />
          ) : svg ? (
            <div
              className="select-none overflow-hidden rounded border leading-none [&_svg]:block h-full w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="flex items-center justify-center rounded border text-sm text-muted-foreground h-full w-full">
              Błąd ładowania
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            isDisabled={isLoading}
            onPress={fetchCaptcha}
            aria-label="Odśwież kod"
          >
            <RefreshCw className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
        <Input
          placeholder="Wpisz kod z obrazka"
          value={value}
          name={name}
          id={name}
          aria-invalid={isInvalid}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      </div>
      {errors && errors.length > 0 && (
        <FieldError>
          {errors
            .map((error) => {
              if (typeof error === "string") return error;
              if (
                typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof error.message === "string"
              ) {
                return error.message;
              }
              return String(error);
            })
            .join(", ")}
        </FieldError>
      )}
    </Field>
  );
}

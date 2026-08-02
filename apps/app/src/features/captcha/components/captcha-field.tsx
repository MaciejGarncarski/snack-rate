import { useMutation } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";

import { Button } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { getCaptcha } from "#/features/captcha/transport/get-captcha.server";

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
  const {
    mutate,
    data: svg,
    isPending,
    isError,
  } = useMutation({
    mutationFn: () => getCaptcha(),
    onSuccess: () => {
      onChange("");
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const handleRefresh = () => {
    mutate();
  };

  const view = useMemo(() => {
    if (isPending) return "loading";
    if (isError) return "error";
    if (svg) return "svg";
    return "loading";
  }, [isPending, isError, svg]);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={name}>Kod z obrazka</FieldLabel>

      <div className="flex flex-row items-center gap-4">
        <Input
          id={name}
          name={name}
          value={value}
          placeholder="Wpisz kod z obrazka"
          className="flex-1 min-w-0"
          aria-invalid={isInvalid}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />

        <div
          className="relative aspect-200/64 max-w-32 shrink-0 w-40 overflow-hidden rounded-xl border bg-muted/40"
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            {view === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-hidden bg-muted"
              >
                <motion.div
                  className="h-full w-full bg-muted-foreground/10"
                  animate={{
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            )}

            {view === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-sm text-muted-foreground"
              >
                <span>Nie udało się załadować kodu</span>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  Spróbuj ponownie
                </button>
              </motion.div>
            )}

            {view === "svg" && svg && (
              <motion.div
                key={svg}
                initial={{
                  opacity: 0,
                  scale: 0.98,
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 1.02,
                  filter: "blur(6px)",
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="absolute inset-0 select-none leading-none [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </AnimatePresence>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          isDisabled={isPending}
          onPress={handleRefresh}
          aria-label="Odśwież kod"
          className="shrink-0"
        >
          <motion.div
            animate={{
              rotate: isPending ? 360 : 0,
            }}
            transition={{
              rotate: isPending
                ? {
                    duration: 0.5,
                    ease: "linear",
                    repeat: Infinity,
                  }
                : {
                    duration: 0.2,
                    ease: "easeOut",
                  },
            }}
          >
            <RefreshCw className="size-4" />
          </motion.div>
        </Button>
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

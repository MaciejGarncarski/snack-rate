import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

import { Button } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "#/components/ui/input-otp";
import { useCaptcha } from "#/features/captcha/hooks/use-captcha";

type CaptchaFieldProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  onBlur?: () => void;
  isInvalid?: boolean;
  errors?: unknown[];
};

function isString(cause: unknown): cause is string {
  return typeof cause === "string";
}

function isObjectWithStringMessage(cause: unknown): cause is { message: string } {
  return (
    typeof cause === "object" && cause !== null && "message" in cause && isString(cause.message)
  );
}

export function CaptchaField({
  value,
  onChange,
  name,
  onBlur,
  isInvalid,
  errors,
}: CaptchaFieldProps) {
  const { svg, isPending, isError, regenerate } = useCaptcha();
  const prevSvgRef = useRef(svg);

  useEffect(() => {
    if (prevSvgRef.current !== svg && svg !== null) {
      onChange("");
    }

    prevSvgRef.current = svg;
  }, [svg, onChange]);

  const view = useMemo(() => {
    if (isPending) return "loading";
    if (isError) return "error";
    if (svg) return "svg";
    return "loading";
  }, [isPending, isError, svg]);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={name}>Kod z obrazka</FieldLabel>

      <div className="flex flex-col flex-wrap items-center gap-2 rounded-2xl md:gap-4 bg-input/50 px-2 py-4">
        <div
          className="relative aspect-200/64 w-26 shrink-0 overflow-hidden rounded-lg border bg-gray-200 md:w-50"
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
                  animate={{ opacity: [0.4, 1, 0.4] }}
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
                  onClick={regenerate}
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

        <div className="flex flex-row items-center gap-2">
          <InputOTP
            id={name}
            name={name}
            maxLength={5}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={isInvalid}
            autoComplete="off"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            type="button"
            variant="outline"
            size="icon"
            isDisabled={isPending}
            onPress={regenerate}
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
      </div>

      {errors && errors.length > 0 && (
        <FieldError>
          {errors
            .map((error) => {
              if (isString(error)) return error;
              if (isObjectWithStringMessage(error)) return error.message;

              return String(error);
            })
            .join(", ")}
        </FieldError>
      )}
    </Field>
  );
}

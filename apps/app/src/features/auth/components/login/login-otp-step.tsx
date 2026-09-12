import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { TurnstileWidget } from "#/components/turnstile-widget";
import { Button } from "#/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "#/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "#/components/ui/input-otp";
import { authClient } from "#/lib/auth-client";
import { extractORPCError } from "#/lib/extract-orpc-error";
import { orpc } from "#/orpc/client";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type LoginOtpStepProps = {
  email: string;
  onBack: () => void;
};

export function LoginOtpStep({ email, onBack }: LoginOtpStepProps) {
  //   const verifyOTP = useMutation(orpc.auth.verifyOTP.mutationOptions({}));
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [token, setToken] = useState<string | undefined>();
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const { mutateAsync: resendCode, isPending: isResending } = useMutation(
    orpc.auth.signInOTP.mutationOptions({
      onError: (mutationError) => {
        const errorMessage = extractORPCError(mutationError)?.message;
        toast.error(errorMessage ? errorMessage : "Wystąpił nieoczekiwany błąd");
      },
      onSuccess: () => {
        toast.success(`Wysłano ponownie kod do: ${email}`);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
    }),
  );

  const verify = async (code: string) => {
    if (code.length !== OTP_LENGTH || isVerifying) {
      return;
    }
    setIsVerifying(true);
    try {
      const { error } = await authClient.signIn.emailOtp({ email, otp: code });
      if (error) {
        toast.error(error.message ?? "Nieprawidłowy kod weryfikacyjny");
        return;
      }
      toast.success("Zalogowano pomyślnie");
      await router.navigate({ to: "/" });
    } catch {
      toast.error("Wystąpił nieoczekiwany błąd");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <form
      className="p-6 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        void verify(otp);
      }}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Sprawdź skrzynkę!</h1>
          <p className="text-balance text-muted-foreground">
            Wysłaliśmy 6-cyfrowy kod na adres <span className="font-medium">{email}</span>
          </p>
          <Button type="button" variant="link" size="sm" onClick={onBack}>
            Zmień adres email
          </Button>
        </div>
        <Field className="items-center">
          <InputOTP
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (value.length === OTP_LENGTH) {
                void verify(value);
              }
            }}
          >
            <InputOTPGroup>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>Wprowadź kod weryfikacyjny z wiadomości email.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" isDisabled={isVerifying || otp.length !== OTP_LENGTH}>
            {isVerifying ? "Weryfikowanie..." : "Zaloguj się"}
          </Button>
          <Button
            type="button"
            variant="outline"
            isDisabled={isResending || cooldown > 0}
            onClick={() => {
              void resendCode({ email, token: token ?? "" });
              turnstileRef.current?.reset();
            }}
          >
            {isResending
              ? "Wysyłanie..."
              : cooldown > 0
                ? `Wyślij ponownie za ${cooldown}s`
                : "Wyślij kod ponownie"}
          </Button>
        </Field>
      </FieldGroup>

      <TurnstileWidget onVerify={setToken} ref={turnstileRef} />
    </form>
  );
}

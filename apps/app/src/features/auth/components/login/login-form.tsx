// oxlint-disable jsx-a11y/anchor-is-valid
import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

import { Image } from "#/components/image/image";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldDescription } from "#/components/ui/field";
import { ModeToggle } from "#/components/ui/mode-toggle";
import { LoginEmailStep } from "#/features/auth/components/login/login-email-step";
import { LoginOtpStep } from "#/features/auth/components/login/login-otp-step";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const canGoBack = useCanGoBack();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex justify-between items-center">
        <Button
          onClick={() => {
            if (canGoBack) {
              router.history.back();
              return;
            }

            router.navigate({ to: "/" });
          }}
          className="w-fit"
          variant="outline"
          size="xs"
        >
          <ChevronLeft />
          Powrót do aplikacji
        </Button>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {step === "email" ? (
            <LoginEmailStep
              email={email}
              onEmailChange={setEmail}
              onCodeSent={() => setStep("otp")}
            />
          ) : (
            <LoginOtpStep email={email} onBack={() => setStep("email")} />
          )}
          <div className="relative hidden bg-muted md:block">
            <Image
              src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNW0wcWlxdzZqdWI2OTB3czY3c2h0c3EzenU0eWpxY3A0MGh2Ym9tYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KHhs4BXpy5dba/200.webp"
              placeholderSrc="https://i.giphy.com/4AwFO4f2VLo2fIFFA2.webp"
              blurBackground
              alt=""
              className="w-full h-full object-cover rounded-2xl"
              containerClassName="absolute inset-0 h-full w-full p-4 dark:brightness-[0.6]"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Klikając kontynuuj, zgadzasz się na nasze <a href="#">Warunki korzystania</a> oraz{" "}
        <a href="#">Politykę prywatności</a>.
      </FieldDescription>
    </div>
  );
}

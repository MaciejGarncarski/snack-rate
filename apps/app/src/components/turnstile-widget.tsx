import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { Ref } from "react";

import { useTheme } from "#/components/ui/theme-provider";
import { clientEnv } from "#/lib/client.env";

type Props = {
  onVerify: (token?: string) => void;
  size?: "compact" | "normal" | "flexible" | "invisible";
  appearance?: "always" | "execute" | "interaction-only";
  ref?: Ref<TurnstileInstance | undefined>;
};

export function TurnstileWidget({
  onVerify,
  ref,
  size = "flexible",
  appearance = "interaction-only",
}: Props) {
  const { resolvedTheme } = useTheme();

  return (
    <Turnstile
      ref={ref}
      siteKey={clientEnv.VITE_TURNSTILE_SITE_KEY}
      options={{ theme: resolvedTheme, language: "pl", size, appearance }}
      onSuccess={onVerify}
      onError={() => onVerify()}
      onExpire={() => onVerify()}
    />
  );
}

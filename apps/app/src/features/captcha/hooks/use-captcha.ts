import { useSelector } from "@tanstack/react-store";
import { useEffect } from "react";

import { captchaStore, regenerateCaptcha } from "../store";

export function useCaptcha() {
  const svg = useSelector(captchaStore, (s) => s.svg);
  const isPending = useSelector(captchaStore, (s) => s.isPending);
  const isError = useSelector(captchaStore, (s) => s.isError);

  useEffect(() => {
    regenerateCaptcha();
  }, []);

  return {
    svg,
    isPending,
    isError,
    regenerate: regenerateCaptcha,
  };
}

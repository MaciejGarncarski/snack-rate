import { useMutation } from "@tanstack/react-query";

import { getCaptcha } from "#/features/captcha/transport/get-captcha.server";

export function useGenerateCaptcha({ onSuccess }: { onSuccess?: () => void } = {}) {
  return useMutation({
    mutationFn: () => getCaptcha(),
    onSuccess: (data) => {
      onSuccess?.();
      return data;
    },
  });
}

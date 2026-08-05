import { createStore } from "@tanstack/react-store";

import { client } from "#/orpc/client";

type CaptchaState = {
  svg: string | null;
  isPending: boolean;
  isError: boolean;
};

const IDLE: CaptchaState = { svg: null, isPending: false, isError: false };
const pending = (): CaptchaState => ({ svg: null, isPending: true, isError: false });
const success = (svg: string): CaptchaState => ({ svg, isPending: false, isError: false });
const error = (prev: CaptchaState): CaptchaState => ({ ...prev, isPending: false, isError: true });

export const captchaStore = createStore<CaptchaState>(IDLE);

export function regenerateCaptcha(): void {
  captchaStore.setState(pending);

  void (async () => {
    try {
      const svg = await client.captcha.get();
      captchaStore.setState(() => success(svg));
    } catch {
      captchaStore.setState(error);
    }
  })();
}

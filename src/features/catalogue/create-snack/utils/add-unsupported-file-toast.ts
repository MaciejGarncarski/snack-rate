import { anchoredToastManager, toastManager } from "#/components/ui/toast";
import {
  IMAGE_TOAST_TIMEOUT,
  supportedFormatsList,
} from "#/features/catalogue/create-snack/consts/image-const";

export function addUnsupportedFileToast(ref?: React.RefObject<HTMLInputElement>) {
  if (ref?.current) {
    anchoredToastManager.add({
      timeout: IMAGE_TOAST_TIMEOUT,
      id: "unsupported-file-toast",
      title: "Nieobsługiwany format pliku",
      description: `Niektóre z dodanych plików mają nieobsługiwany format i zostały pominięte. Obsługiwane formaty to: ${supportedFormatsList}.`,
      positionerProps: {
        anchor: ref.current,
      },
    });

    return;
  }

  toastManager.add({
    timeout: IMAGE_TOAST_TIMEOUT,
    id: "unsupported-file-toast",
    title: "Nieobsługiwany format pliku",
    description: `Niektóre z dodanych plików mają nieobsługiwany format i zostały pominięte. Obsługiwane formaty to: ${supportedFormatsList}.`,
  });
}

import { toastManager } from "#/components/ui/toast";
import {
  IMAGE_TOAST_TIMEOUT,
  MAX_FILE_SIZE,
} from "#/features/catalogue/create-snack/consts/image-const";

export function addFilesizeToast() {
  toastManager.add({
    timeout: IMAGE_TOAST_TIMEOUT,
    id: "filesize-toast",
    title: "Plik zbyt duży",
    description: `Niektóre z dodanych plików przekraczają maksymalny rozmiar ${MAX_FILE_SIZE / (1024 * 1024)} MB i zostały pominięte.`,
  });
}

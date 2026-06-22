import { toastManager } from "#/components/ui/toast";
import { IMAGE_TOAST_TIMEOUT } from "#/features/catalogue/create-snack/consts/image-const";

export function addAlreadyAddedToast({ fileName }: { fileName: string }) {
  toastManager.add({
    timeout: IMAGE_TOAST_TIMEOUT,
    id: "already-added-toast",
    title: "Plik już dodany",
    description: `Plik o nazwie "${fileName}" został już dodany.`,
  });
}

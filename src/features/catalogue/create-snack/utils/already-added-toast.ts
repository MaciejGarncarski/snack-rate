import { toastManager } from "#/components/ui/toast";
import { IMAGE_TOAST_TIMEOUT } from "#/const/image-const";

const toastId = "already-added-toast";

export function addAlreadyAddedToast({ fileName }: { fileName: string }) {
  toastManager.add({
    timeout: IMAGE_TOAST_TIMEOUT,
    id: toastId,
    title: "Plik już dodany",
    description: `Plik o nazwie "${fileName}" został już dodany.`,
  });
}

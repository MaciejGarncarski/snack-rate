import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats,
  type Html5QrcodeFullConfig,
} from "html5-qrcode";
import type { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { CameraOffIcon, ScanBarcodeIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";

const SCANNER_ID = "barcode-scanner";
const SCAN_FPS = 10;

type BarcodeScannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
};

const cameraConfig: Html5QrcodeScannerConfig = {
  fps: SCAN_FPS,
  qrbox: (viewfinderWidth) => {
    const width = Math.floor(viewfinderWidth * 0.85);
    const height = Math.floor(width * 0.4);

    return {
      width: Math.min(width, 250),
      height: Math.min(height, 90),
    };
  },
  disableFlip: false,
};

const scannerConfig: Html5QrcodeFullConfig = {
  verbose: true,
  formatsToSupport: [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
  ],
};

export function BarcodeScannerDialog({ open, onOpenChange, onScan }: BarcodeScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onScanSuccess = useCallback(
    (decodedText: string) => {
      onScan(decodedText);
      onOpenChange(false);
    },
    [onScan, onOpenChange],
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const stopScanner = async () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (!scanner) return;

      try {
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          await scanner.stop();
        }
        scanner.clear();
      } catch {}
    };

    const startScanner = async () => {
      setCameraReady(false);
      setError(null);
      try {
        const scanner = new Html5Qrcode(SCANNER_ID, scannerConfig);
        scannerRef.current = scanner;
        await scanner.start({ facingMode: "environment" }, cameraConfig, onScanSuccess, () => {});

        setCameraReady(true);

        if (cancelled) {
          await stopScanner();
          return;
        }

        const video = document.querySelector(`#${SCANNER_ID} video`);
        if (video && !video.hasAttribute("aria-label")) {
          video.setAttribute("aria-label", "Kamera skanera kodów kreskowych");
        }
      } catch (err) {
        scannerRef.current = null;
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Nie udało się uruchomić kamery.");
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open, onScan, onOpenChange, onScanSuccess]);

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Skanuj kod kreskowy</DialogTitle>
        <DialogDescription>Umieść kod kreskowy w polu widzenia kamery.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted">
          <div id={SCANNER_ID} className="size-full [&_video]:rounded-xl" />
          {!cameraReady && (
            <CameraOffIcon className="absolute left-1/2 top-1/2 z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">
            <ScanBarcodeIcon className="mr-1 inline size-4" />
            {error}
          </p>
        )}
      </div>
      <DialogFooter>
        <DialogClose variant="ghost">Anuluj</DialogClose>
      </DialogFooter>
    </Dialog>
  );
}

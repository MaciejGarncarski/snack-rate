import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { ScanBarcodeIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SCANNER_ID = "barcode-scanner";
const SCAN_FPS = 10;

type BarcodeScannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
};

export function BarcodeScannerDialog({ open, onOpenChange, onScan }: BarcodeScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: SCAN_FPS, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
            onOpenChange(false);
          },
          () => {},
        );

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
  }, [open, onScan, onOpenChange]);

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Skanuj kod kreskowy</DialogTitle>
        <DialogDescription>Umieść kod kreskowy w polu widzenia kamery.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted">
          <div id={SCANNER_ID} className="size-full [&_video]:rounded-xl" />
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

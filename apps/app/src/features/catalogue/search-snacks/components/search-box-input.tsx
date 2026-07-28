import { ScanBarcodeIcon, Search, XIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState, type RefObject } from "react";

import { BarcodeScannerDialog } from "#/components/barcode-scanner-dialog";
import { Button } from "#/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group";
import { Spinner } from "#/components/ui/spinner";
import { Tooltip, TooltipTrigger } from "#/components/ui/tooltip";

type Props = {
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onClick: () => void;
  inputValue: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onResetClick?: () => void;
  isLoading?: boolean;
  isSearchBoxOpen?: boolean;
};

export function SearchBoxInput({
  inputValue,
  onResetClick,
  onChange,
  onKeyDown,
  onFocus,
  onClick,
  inputRef,
  isLoading = false,
  isSearchBoxOpen = false,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const setInputBarcode = (value: string) => {
    onChange(value);
    onFocus();
  };

  return (
    <div className="flex items-center gap-2">
      <InputGroup className="border border-input">
        <InputGroupInput
          type="text"
          autoComplete="off"
          placeholder="Szukaj..."
          value={inputValue}
          ref={inputRef}
          onFocus={onFocus}
          onClick={onClick}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <InputGroupAddon>
          <AnimatePresence>
            {isLoading && isSearchBoxOpen ? <Spinner /> : <Search />}
          </AnimatePresence>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Button aria-label="Reset" variant="ghost" size="icon-sm" onClick={onResetClick}>
            <XIcon />
          </Button>
        </InputGroupAddon>
      </InputGroup>

      <BarcodeScannerDialog
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        onScan={setInputBarcode}
      />

      <TooltipTrigger>
        <Button
          aria-label="Scan Barcode"
          variant="secondary"
          size="icon"
          className="border border-input bg-input/50"
          onClick={() => setDialogOpen(true)}
        >
          <ScanBarcodeIcon />
        </Button>
        <Tooltip>
          <p>Skanuj kod kreskowy</p>
        </Tooltip>
      </TooltipTrigger>
    </div>
  );
}

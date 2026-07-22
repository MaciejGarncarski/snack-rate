import { Button } from "#/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group";
import { Spinner } from "#/components/ui/spinner";
import { Search, XIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import type { RefObject } from "react";

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
  return (
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
        <AnimatePresence>{isLoading && isSearchBoxOpen ? <Spinner /> : <Search />}</AnimatePresence>
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Button aria-label="Reset" variant="ghost" size="icon-xs" onClick={onResetClick}>
          <XIcon />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}

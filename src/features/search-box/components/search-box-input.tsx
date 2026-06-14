import { Search, XIcon } from "lucide-react";
import type { RefObject } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group";

type Props = {
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onClick: () => void;
  inputValue: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onResetClick?: () => void;
};

export function SearchBoxInput({
  inputValue,
  onResetClick,
  onChange,
  onKeyDown,
  onFocus,
  onClick,
  inputRef,
}: Props) {
  return (
    <InputGroup className="max-w-48 border border-input md:max-w-sm">
      <InputGroupInput
        placeholder="Szukaj..."
        value={inputValue}
        ref={inputRef}
        onFocus={onFocus}
        onClick={onClick}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Reset" title="Reset" size="icon-sm" onClick={onResetClick}>
          <XIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

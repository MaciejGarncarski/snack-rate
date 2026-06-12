import { useHotkey } from "@tanstack/react-hotkeys";
import { useCallback, useEffect, useState, type KeyboardEvent, type RefObject } from "react";

import { useClickOutside } from "#/hooks/use-click-outside";

type UseSearchBoxControlsProps = {
  setSuggestionsOpen: (open: boolean) => void;
  suggestionListContainerRef: RefObject<HTMLUListElement | null>;
  dataLength: number;
  inputRef: RefObject<HTMLInputElement | null>;
};

export function useSearchBoxControls({
  setSuggestionsOpen,
  suggestionListContainerRef,
  dataLength,
  inputRef,
}: UseSearchBoxControlsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useClickOutside(suggestionListContainerRef, () => {
    setSuggestionsOpen(false);
    setSelectedIndex(0);
  });

  useHotkey("Escape", () => {
    setSuggestionsOpen(false);
    setSelectedIndex(0);
    inputRef.current?.blur();
  });

  useHotkey("Control+K", () => {
    setSuggestionsOpen(true);
    setSelectedIndex(0);
    inputRef.current?.focus();
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();

        setSelectedIndex((current) => Math.min(current + 1, dataLength - 1));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setSelectedIndex((current) => Math.max(current - 1, 0));
      }

      if (e.key === "Enter") {
        const selectedItem = suggestionListContainerRef.current;
        const allLinks = selectedItem?.querySelectorAll("li");
        const selectedLink = allLinks?.[selectedIndex]?.querySelector("a");

        if (selectedLink) {
          selectedLink.click();
        }
      }

      if (e.key === "Tab") {
        setSuggestionsOpen(false);
        setSelectedIndex(0);
      }
    },
    [selectedIndex, dataLength, suggestionListContainerRef, setSuggestionsOpen],
  );

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  };
}

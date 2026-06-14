import { useHotkey } from "@tanstack/react-hotkeys";
import { useCallback, useEffect, useState, type KeyboardEvent, type RefObject } from "react";

import { useClickOutside } from "#/hooks/use-click-outside";

type UseSearchBoxNavigationProps = {
  setSuggestionsOpen: (open: boolean) => void;
  suggestionListContainerRef: RefObject<HTMLUListElement | null>;
  dataLength: number;
  inputRef: RefObject<HTMLInputElement | null>;
};

export function useSearchBoxNavigation({
  setSuggestionsOpen,
  suggestionListContainerRef,
  dataLength,
  inputRef,
}: UseSearchBoxNavigationProps) {
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
    (keyboardEvent: KeyboardEvent<HTMLInputElement>) => {
      const { key } = keyboardEvent;

      if (key === "ArrowDown") {
        keyboardEvent.preventDefault();

        setSelectedIndex((current) => {
          const nextIndex = current + 1;
          return nextIndex >= dataLength ? 0 : nextIndex;
        });
      }

      if (key === "ArrowUp") {
        keyboardEvent.preventDefault();
        setSelectedIndex((current) => {
          const prevIndex = current - 1;
          return prevIndex < 0 ? dataLength - 1 : prevIndex;
        });
      }

      if (key === "Enter") {
        const selectedItem = suggestionListContainerRef.current;
        const allLinks = selectedItem?.querySelectorAll("li");
        const selectedLink = allLinks?.[selectedIndex]?.querySelector("a");
        selectedLink?.click();
      }

      if (key === "Tab") {
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

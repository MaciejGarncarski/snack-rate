import { useState } from "react";

import { useDebounce } from "#/hooks/use-debounce";

export function useSearchBoxInput() {
  const [inputValue, setInputValue] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const debouncedQuery = useDebounce(inputValue, 400);

  return {
    inputValue,
    setInputValue,
    suggestionsOpen,
    setSuggestionsOpen,
    debouncedQuery,
  };
}

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";

import { getSearchedItemsQueryOptions } from "#/features/snacks/components/search-box/api/get-searched-items";
import { SearchBoxInput } from "#/features/snacks/components/search-box/components/search-box-input";
import { SearchBoxMessage } from "#/features/snacks/components/search-box/components/search-box-message";
import { SearchBoxResults } from "#/features/snacks/components/search-box/components/search-box-results";
import { useSearchBoxInput } from "#/features/snacks/components/search-box/hooks/use-search-box-input";
import { useSearchBoxNavigation } from "#/features/snacks/components/search-box/hooks/use-search-box-navigation";

export function NavbarSearchBox() {
  const { debouncedQuery, inputValue, setInputValue, suggestionsOpen, setSuggestionsOpen } =
    useSearchBoxInput();

  const { data, isLoading } = useQuery(getSearchedItemsQueryOptions(debouncedQuery || ""));
  const suggestionListContainerRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isDebouncing = debouncedQuery !== inputValue;

  const { selectedIndex, setSelectedIndex, handleKeyDown } = useSearchBoxNavigation({
    setSuggestionsOpen,
    suggestionListContainerRef,
    inputRef,
    dataLength: data?.length ?? 0,
  });

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setSuggestionsOpen(true);
  };

  const handleReset = () => {
    setInputValue("");
    setSuggestionsOpen(false);
    setSelectedIndex(0);
  };

  const handleListItemClick = () => {
    setSuggestionsOpen(false);
    setInputValue("");
    setSelectedIndex(0);
  };

  return (
    <div className="relative">
      <SearchBoxInput
        inputValue={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setSuggestionsOpen(true)}
        onClick={() => setSuggestionsOpen(true)}
        onResetClick={handleReset}
        inputRef={inputRef}
        isSearchBoxOpen={suggestionsOpen}
        isLoading={isLoading || isDebouncing}
      />

      <AnimatePresence mode="wait">
        {suggestionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -left-8 mt-1 w-58 rounded-lg border bg-accent p-1 text-sm shadow-lg md:top-11 md:-left-9 md:w-84 md:p-2"
          >
            <AnimatePresence mode="wait">
              {data?.length === 0 ? (
                <SearchBoxMessage message="Brak wyników" />
              ) : isLoading || isDebouncing ? (
                <SearchBoxMessage message="Ładowanie..." />
              ) : (
                <SearchBoxResults
                  onLinkClick={handleListItemClick}
                  listRef={suggestionListContainerRef}
                  selectedIndex={selectedIndex}
                  query={debouncedQuery}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

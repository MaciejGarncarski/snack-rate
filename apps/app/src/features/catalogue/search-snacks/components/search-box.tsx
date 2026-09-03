import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";

import { SearchBoxInput } from "#/features/catalogue/search-snacks/components/search-box-input";
import { SearchBoxMessage } from "#/features/catalogue/search-snacks/components/search-box-message";
import { SearchBoxResults } from "#/features/catalogue/search-snacks/components/search-box-results";
import { useSearchBoxInput } from "#/features/catalogue/search-snacks/hooks/use-search-box-input";
import { useSearchBoxNavigation } from "#/features/catalogue/search-snacks/hooks/use-search-box-navigation";
import { getSearchedItemsQueryOptions } from "#/features/catalogue/search-snacks/queries/get-searched-items.query-options";

export function NavbarSearchBox() {
  const { debouncedQuery, inputValue, setInputValue, suggestionsOpen, setSuggestionsOpen } =
    useSearchBoxInput();

  const { data, isLoading } = useQuery(getSearchedItemsQueryOptions(debouncedQuery));
  const suggestionListContainerRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isDebouncing = debouncedQuery !== inputValue;

  const { selectedIndex, setSelectedIndex, handleKeyDown } = useSearchBoxNavigation({
    setSuggestionsOpen,
    suggestionListContainerRef,
    inputRef,
    dataLength: data?.length ?? 0,
  });

  const handleClose = () => {
    setInputValue("");
    setSuggestionsOpen(false);
    setSelectedIndex(0);
    inputRef.current?.blur();
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setSuggestionsOpen(true);
  };

  return (
    <div className="relative w-full">
      <div className="max-w-50 md:max-w-72">
        <SearchBoxInput
          inputValue={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setSuggestionsOpen(true)}
          onClick={() => setSuggestionsOpen(true)}
          onResetClick={handleClose}
          inputRef={inputRef}
          isSearchBoxOpen={suggestionsOpen}
          isLoading={isLoading || isDebouncing}
        />
      </div>

      <AnimatePresence mode="wait">
        {suggestionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute overflow-hidden left-1/2 backdrop-blur-xl border border-border -translate-x-1/2 mt-2 w-64 rounded-3xl md:p-2 bg-popover/85 text-sm shadow-xl md:top-9 md:w-84"
          >
            {data?.length === 0 ? (
              <SearchBoxMessage message="Brak wyników" />
            ) : isLoading || isDebouncing ? (
              <SearchBoxMessage message="Ładowanie..." />
            ) : (
              <SearchBoxResults
                onLinkClick={handleClose}
                listRef={suggestionListContainerRef}
                selectedIndex={selectedIndex}
                items={data ?? []}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

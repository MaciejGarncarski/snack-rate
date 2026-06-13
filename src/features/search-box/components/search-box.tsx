import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, type ChangeEvent } from "react";

import { ImageWithPlaceholder } from "#/components/layout/image-with-placeholder";
import { ProductRating } from "#/components/product/product-rating";
import { Button } from "#/components/ui/button";
import { getSearchedItemsQueryOptions } from "#/features/search-box/api/get-searched-items";
import { useSearchBoxControls } from "#/features/search-box/hooks/use-searach-box-controls";
import { useSearchBoxInput } from "#/features/search-box/hooks/use-search-box-input";
import { cn } from "#/lib/utils";

export function NavbarSearchBox() {
  const { debouncedQuery, inputValue, setInputValue, suggestionsOpen, setSuggestionsOpen } =
    useSearchBoxInput();
  const { data, isLoading } = useQuery(getSearchedItemsQueryOptions(debouncedQuery));
  const suggestionListContainerRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { selectedIndex, setSelectedIndex, handleKeyDown } = useSearchBoxControls({
    setSuggestionsOpen,
    suggestionListContainerRef,
    inputRef,
    dataLength: data?.length ?? 0,
  });

  const searchOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toLowerCase());
    setSuggestionsOpen(true);
  };

  return (
    <div className="relative">
      <div className="w-40 cursor-pointer rounded border border-input bg-input text-sm shadow-sm md:w-64">
        <input
          className="h-full w-full px-4 py-2"
          placeholder="Szukajka"
          aria-label="Szukaj produkty"
          value={inputValue}
          ref={inputRef}
          onFocus={() => setSuggestionsOpen(true)}
          onClick={() => setSuggestionsOpen(true)}
          onChange={searchOnChange}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="sm"
          variant={"ghost"}
          className="absolute top-0.5 right-0.5 cursor-pointer rounded-sm"
          onClick={() => {
            setInputValue("");
            setSuggestionsOpen(false);
            setSelectedIndex(0);
            inputRef.current?.blur();
          }}
        >
          <XIcon />
        </Button>
      </div>

      <AnimatePresence>
        {suggestionsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full -left-10 mt-1 w-58 rounded-lg border bg-accent p-1 text-sm shadow-lg md:-left-10 md:w-84 md:p-2"
          >
            <AnimatePresence>
              {data?.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 text-muted-foreground"
                >
                  Brak wyników
                </motion.div>
              ) : isLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2">
                  Ładowanie...
                </motion.div>
              ) : (
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  ref={suggestionListContainerRef}
                >
                  {data?.map((item, index) => (
                    <li
                      key={item.slug}
                      className={cn(
                        `rounded border-b px-4 py-2 last:border-b-0 hover:bg-popover`,
                        index === selectedIndex ? "md:bg-popover" : "",
                      )}
                    >
                      <Link
                        to="/product/$slug"
                        params={{ slug: item.slug }}
                        className="flex items-center gap-4"
                        {...(!index && { "data-first": "" })}
                        onClick={() => {
                          setSuggestionsOpen(false);
                          setInputValue("");
                          setSelectedIndex(0);
                        }}
                      >
                        <div className="mb-1 size-8 overflow-hidden rounded-xs md:size-11">
                          <ImageWithPlaceholder alt="" src={item.images[0].url} />
                        </div>
                        <div>
                          <span>{item.name}</span>
                          <ProductRating rating={parseFloat(item.avgRating)} size="xs" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

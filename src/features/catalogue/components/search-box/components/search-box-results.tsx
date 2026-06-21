import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { ImageWithPlaceholder } from "#/components/layout/image-with-placeholder";
import { SnackRating } from "#/components/snacks/snack-rating";
import { ScrollArea } from "#/components/ui/scroll-area";
import { cn } from "#/lib/utils";

import type { SnackSearchResult } from "../api/get-searched-items";

type Props = {
  onLinkClick: () => void;
  listRef: React.RefObject<HTMLUListElement | null>;
  selectedIndex: number;
  items: SnackSearchResult[];
};

export function SearchBoxResults({ onLinkClick, listRef, selectedIndex, items }: Props) {
  return (
    <ScrollArea className="h-72">
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={listRef}
        className="flex flex-col gap-0"
      >
        {items.map((item, index) => (
          <li
            key={item.slug}
            className={cn(
              "border-b px-4 py-2 last:border-b-0 hover:bg-accent/60",
              index === selectedIndex && "md:bg-accent/60",
            )}
          >
            <Link
              to="/snack/$slug"
              params={{ slug: item.slug }}
              className="flex items-center gap-4"
              {...(index === 0 && { "data-first": "" })}
              onClick={onLinkClick}
            >
              <div className="flex size-8 items-center justify-center overflow-hidden rounded-xs md:size-11">
                <ImageWithPlaceholder alt="" src={item.images[0]?.url} />
              </div>
              <div>
                <span>{item.name}</span>
                <SnackRating rating={item.avgRating} size="xs" />
              </div>
            </Link>
          </li>
        ))}
      </motion.ul>
    </ScrollArea>
  );
}

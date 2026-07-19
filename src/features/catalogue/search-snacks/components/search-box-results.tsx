import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { ImageWithPlaceholder } from "#/components/layout/image-with-placeholder";
import { SnackRating } from "#/components/snacks/snack-rating";
import { ScrollArea } from "#/components/ui/scroll-area";
import type { SnackItem } from "#/features/catalogue/server/repositories/snacks.repository";
import { cn } from "#/lib/utils";

type Props = {
  onLinkClick: () => void;
  listRef: React.RefObject<HTMLUListElement | null>;
  selectedIndex: number;
  items: SnackItem[];
};

export function SearchBoxResults({ onLinkClick, listRef, selectedIndex, items }: Props) {
  return (
    <ScrollArea className="h-72">
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={listRef}
        className="flex flex-col gap-0.5 p-1"
      >
        {items.map((item, index) => (
          <li key={item.slug}>
            <Link
              to="/produkt/$slug"
              params={{ slug: item.slug }}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors outline-none hover:bg-primary/25",
                index === selectedIndex && "bg-primary/20",
              )}
              {...(index === 0 && { "data-first": "" })}
              onClick={onLinkClick}
            >
              <ImageWithPlaceholder
                alt=""
                src={item.thumbnailUrl ?? item.images[0]?.url}
                containerClassName="w-9 aspect-4/5 shrink-0 overflow-hidden rounded-md bg-muted md:w-10"
                className="h-full w-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <SnackRating rating={item.avgRating} size="xs" />
              </div>
            </Link>
          </li>
        ))}
      </motion.ul>
    </ScrollArea>
  );
}

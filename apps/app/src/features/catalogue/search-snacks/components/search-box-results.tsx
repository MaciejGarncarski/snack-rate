import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { ImageWithPlaceholder } from "#/components/image/image-with-placeholder";
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
                "relative flex w-full items-center gap-2.5 rounded-2xl",
                "py-2 pr-3 pl-3",
                "text-sm font-medium",
                "outline-none transition-colors",
                "hover:bg-foreground/10 hover:text-accent-foreground",
                "focus:bg-foreground/10 focus:text-accent-foreground",
                index === selectedIndex && "bg-foreground/10 text-accent-foreground",
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

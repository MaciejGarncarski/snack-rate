import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { ImageWithPlaceholder } from "#/components/layout/image-with-placeholder";
import { ProductRating } from "#/components/product/product-rating";
import { getSearchedItemsQueryOptions } from "#/features/search-box/api/get-searched-items";
import { cn } from "#/lib/utils";

type Props = {
  onLinkClick: () => void;
  listRef: React.RefObject<HTMLUListElement | null>;
  selectedIndex: number;
  query: string;
};

export function SearchBoxResults({ onLinkClick, listRef, selectedIndex, query }: Props) {
  const { data } = useQuery(getSearchedItemsQueryOptions(query));

  return (
    <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} ref={listRef}>
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
            onClick={onLinkClick}
          >
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-xs md:size-11">
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
  );
}

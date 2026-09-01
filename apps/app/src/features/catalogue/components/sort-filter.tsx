import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  StarIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import type { SortBy } from "#/schemas/catalogue";

const SORT_OPTIONS: {
  value: SortBy;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "newest", label: "Najnowsze", icon: ArrowDownAZIcon },
  { value: "oldest", label: "Najstarsze", icon: ArrowUpAZIcon },
  { value: "most_reviewed", label: "Najczęściej oceniane", icon: StarIcon },
  { value: "most_liked", label: "Najwyżej oceniane", icon: ThumbsUpIcon },
  { value: "most_disliked", label: "Najniżej oceniane", icon: ThumbsDownIcon },
];

type Props = {
  activeSortBy?: SortBy | null;
};

export function SortFilter({ activeSortBy }: Props) {
  const navigate = useNavigate({ from: "/" });
  const currentValue = activeSortBy ?? "newest";

  return (
    <Select
      value={currentValue}
      onChange={(key) => {
        if (key) {
          const sortValue = String(key) as SortBy;
          navigate({
            search: (prev) => {
              if (sortValue === "newest") {
                const next = { ...prev };
                delete next.sortBy;
                return next;
              }
              return { ...prev, sortBy: sortValue };
            },
          });
        }
      }}
    >
      <SelectTrigger className="w-auto min-w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-44">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} id={option.value}>
              <span className="flex items-center gap-2">
                <Icon className="size-3.5" />
                {option.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function SortFilterSkeleton() {
  return <Skeleton className="h-9 w-36 rounded-3xl" />;
}

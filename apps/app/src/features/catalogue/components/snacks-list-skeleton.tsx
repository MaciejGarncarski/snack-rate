import { Card, CardFooter, CardHeader } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";

const TITLE_WIDTHS = ["w-3/5", "w-4/5", "w-2/3", "w-1/2", "w-3/4", "w-7/12"];
const DESC_WIDTHS = ["w-4/5", "w-11/12", "w-3/4", "w-5/6", "w-full", "w-2/3"];
const BADGE_WIDTHS = ["w-14", "w-20", "w-16", "w-18", "w-12", "w-20"];
const RATING_WIDTHS = ["w-36", "w-40", "w-38", "w-44", "w-36", "w-42"];

export function SnackItemSkeleton({ index = 0 }: { index?: number }) {
  const i = index % TITLE_WIDTHS.length;

  return (
    <li className="mx-auto w-full max-w-sm">
      <Card className="pt-0">
        <Skeleton className="aspect-4/5 w-full rounded-none bg-muted" />
        <CardHeader>
          <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
            <Skeleton className={`h-5 ${BADGE_WIDTHS[i]} rounded-full`} />
          </div>
          <Skeleton className={`h-5 ${TITLE_WIDTHS[i]}`} />
          <Skeleton className={`h-4 ${DESC_WIDTHS[i]}`} />
        </CardHeader>
        <CardFooter>
          <Skeleton className={`h-6 ${RATING_WIDTHS[i]}`} />
        </CardFooter>
      </Card>
    </li>
  );
}

export function SnacksListSkeleton() {
  return (
    <ul className="mx-auto flex flex-col gap-14">
      {Array.from({ length: 6 }).map((_, index) => (
        <SnackItemSkeleton key={index} index={index} />
      ))}
    </ul>
  );
}

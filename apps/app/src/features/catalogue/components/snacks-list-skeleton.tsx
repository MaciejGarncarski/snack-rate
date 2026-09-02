import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { PRODUCTS_PER_SCROLL } from "#/features/catalogue/queries/list-snacks.query-options";

export function SnacksListItemSkeleton() {
  return (
    <li className="flex w-full justify-center">
      <Card className="flex h-full w-full flex-row items-stretch gap-2 rounded-3xl p-0 sm:gap-1 sm:rounded-4xl overflow-hidden">
        <Skeleton className="z-10 w-28 shrink-0 aspect-[4/5] rounded-xl sm:w-32 lg:w-40 overflow-hidden" />
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-2.5 pr-3 sm:gap-(--card-spacing) sm:py-(--card-spacing) sm:px-3">
          <CardHeader className="gap-1.5 p-0 sm:gap-2">
            <Skeleton className="h-5 w-20 rounded-full sm:h-6" />
            <CardTitle className="w-full">
              <Skeleton className="h-4 w-3/4 sm:h-4.25" />
              <Skeleton className="mt-1 h-4 w-2/3 sm:h-4.25" />
            </CardTitle>
            <CardDescription className="w-full space-y-1.5">
              <Skeleton className="h-3 w-full sm:h-3.5" />
              <Skeleton className="h-3 w-5/6 sm:h-3.5" />
              <Skeleton className="hidden h-3 w-4/6 sm:h-3.5 sm:block" />
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto w-full p-0">
            <Skeleton className="h-4 w-28 sm:h-5 sm:w-32" />
          </CardFooter>
        </div>
      </Card>
    </li>
  );
}
export function SnacksListSkeleton() {
  return (
    <ul className="mx-auto flex w-full flex-col gap-6 md:grid md:grid-cols-2">
      {Array.from({ length: PRODUCTS_PER_SCROLL }).map((_, index) => (
        <SnacksListItemSkeleton key={index} />
      ))}
    </ul>
  );
}

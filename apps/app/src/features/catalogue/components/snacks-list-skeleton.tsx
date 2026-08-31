import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { PRODUCTS_PER_SCROLL } from "#/const/image-const";

export function SnacksListItemSkeleton() {
  return (
    <li className="mx-auto w-full max-w-sm md:mx-0 md:max-w-none">
      <Card className="flex h-full w-full flex-col overflow-hidden pt-0 md:flex-row md:gap-0 md:py-0">
        <Skeleton className="aspect-4/5 w-full shrink-0 md:w-[42%] lg:w-[38%] rounded-none rounded-t-4xl md:rounded-tr-none md:rounded-l-4xl" />
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-(--card-spacing) py-(--card-spacing)">
          <CardHeader className="gap-2">
            <CardAction>
              <Skeleton className="mb-1 h-6 w-20 rounded-full" />
            </CardAction>
            <CardTitle className="w-full">
              <Skeleton className="h-5 w-3/4 md:h-[17px]" />
            </CardTitle>
            <CardDescription className="w-full space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto w-full">
            <Skeleton className="h-5 w-32" />
          </CardFooter>
        </div>
      </Card>
    </li>
  );
}

export function SnacksListSkeleton() {
  return (
    <ul className="mx-auto flex w-full flex-col gap-14 md:grid md:grid-cols-2">
      {Array.from({ length: PRODUCTS_PER_SCROLL }).map((_, index) => (
        <SnacksListItemSkeleton key={index} />
      ))}
    </ul>
  );
}

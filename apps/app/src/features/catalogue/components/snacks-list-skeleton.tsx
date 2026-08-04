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
    <li className="mx-auto w-full max-w-sm">
      <Card className="pt-0">
        <Skeleton className="h-full aspect-4/5 rounded-none w-xs md:w-sm" />
        <CardHeader>
          <CardAction>
            <Skeleton className="mb-2 h-6 w-20 rounded-full" />
          </CardAction>

          <CardTitle>
            <Skeleton className="h-6 w-3/4" />
          </CardTitle>

          <CardDescription className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Skeleton className="h-7.5 w-40" />
        </CardFooter>
      </Card>
    </li>
  );
}

export function SnacksListSkeleton() {
  return (
    <ul className="mx-auto flex flex-col gap-14">
      {Array.from({ length: PRODUCTS_PER_SCROLL }).map((_, index) => (
        <SnacksListItemSkeleton key={index} />
      ))}
    </ul>
  );
}

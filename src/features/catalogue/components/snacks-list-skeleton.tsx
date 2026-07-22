import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SnackItemSkeleton() {
  return (
    <li className="mx-auto w-[20rem] md:w-sm max-w-sm">
      <Card className="pt-0">
        <Skeleton className="aspect-4/5 w-full rounded-none bg-muted" />
        <CardHeader>
          <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-5 w-20" />
        </CardFooter>
      </Card>
    </li>
  );
}

export function SnacksListSkeleton() {
  return (
    <ul className="mx-auto flex flex-col gap-14">
      {Array.from({ length: 6 }).map((_, index) => (
        <SnackItemSkeleton key={index} />
      ))}
    </ul>
  );
}

import { Link } from "@tanstack/react-router";

import { Image } from "#/components/image/image";
import { SnackRating } from "#/components/snacks/snack-rating";
import { Badge } from "#/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";

type Props = {
  name: string;
  description: string | null;
  slug: string;
  rating: number;
  type: string;
  lazy?: boolean;
  images: {
    url: string;
  }[];
};

export function SnacksListItem({ name, description, slug, rating, type, lazy, images }: Props) {
  const isLongDescription = description && description.length > 100;
  const truncatedDescription = isLongDescription ? description.slice(0, 100) + "..." : description;

  return (
    <li className="mx-auto w-full max-w-sm md:mx-0 md:max-w-none">
      <Link
        style={{ viewTransitionName: `snack-image-${slug}` }}
        to="/produkt/$slug"
        params={{ slug }}
        className="block h-full rounded-4xl"
        viewTransition
      >
        <Card className="flex h-full flex-col overflow-hidden pt-0 transition-shadow hover:shadow-lg md:flex-row md:gap-0 md:py-0">
          <Image
            lazy={lazy}
            src={images[0]?.url}
            alt={name}
            blurBackground
            containerClassName="w-full aspect-4/5 shrink-0 md:w-[42%] lg:w-[38%]"
            className="h-full w-full object-cover rounded-t-4xl md:rounded-tr-none md:rounded-l-4xl"
          />
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-(--card-spacing) py-(--card-spacing)">
            <CardHeader className="gap-2">
              <CardAction>
                <Badge variant="default" className="mb-1">
                  {type}
                </Badge>
              </CardAction>
              <CardTitle className="pr-6 text-balance leading-tight md:text-[17px]">
                {name}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-pretty">
                {truncatedDescription ?? "Ten produkt nie ma jeszcze opisu."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <SnackRating rating={rating} withText />
            </CardFooter>
          </div>
        </Card>
      </Link>
    </li>
  );
}

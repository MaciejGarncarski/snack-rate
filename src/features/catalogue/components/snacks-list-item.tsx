import { Link } from "@tanstack/react-router";

import { ImageWithPlaceholder } from "#/components/layout/image-with-placeholder";
import { SnackRating } from "#/components/snacks/snack-rating";
import { Card, CardContent } from "#/components/ui/card";

type Props = {
  name: string;
  description: string | null;
  slug: string;
  rating: number;
  images: {
    url: string;
  }[];
};

export function SnacksListItem({ name, description, slug, rating, images }: Props) {
  return (
    <li className="mx-auto w-full max-w-sm">
      <Link to="/produkt/$slug" params={{ slug: slug }}>
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-10">
              <ImageWithPlaceholder
                src={images[0]?.url}
                containerClassName="w-full aspect-4/5 flex justify-center items-center rounded-md bg-muted shrink-0"
                className="h-full w-full rounded-md object-cover"
              />
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-md text-muted-foreground">{description}</p>
                <div className="mt-auto">
                  <SnackRating rating={rating} withText />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}

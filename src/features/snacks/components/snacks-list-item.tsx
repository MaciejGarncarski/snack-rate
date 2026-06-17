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
    <li>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-10 lg:flex-row">
            <ImageWithPlaceholder
              src={images[0]?.url}
              containerClassName="size-48 flex justify-center items-center rounded-md bg-muted shrink-0"
              className="h-full w-full rounded-md object-cover"
            />
            <div className="flex flex-col gap-2">
              <Link to="/snack/$slug" params={{ slug: slug }}>
                <h2 className="text-xl font-bold">{name}</h2>
              </Link>
              <p className="text-md text-muted-foreground">{description}</p>
              <div className="mt-auto">
                <SnackRating rating={rating} withText />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

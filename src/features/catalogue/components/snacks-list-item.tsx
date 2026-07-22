import { ImageWithPlaceholder } from "#/components/layout/image-with-placeholder";
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
import { Link } from "@tanstack/react-router";

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
  return (
    <li className="mx-auto w-full max-w-sm">
      <Link to="/produkt/$slug" params={{ slug }} className="rounded-4xl">
        <Card className="pt-0">
          <ImageWithPlaceholder
            lazy={lazy}
            src={images[0]?.url}
            alt={name}
            containerClassName="w-full aspect-4/5 bg-muted"
            className="h-full w-full object-cover"
          />
          <CardHeader>
            <CardAction>
              <Badge variant="default" className="mb-2">
                {type}
              </Badge>
            </CardAction>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description ?? "Brak opisu"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <SnackRating rating={rating} withText />
          </CardFooter>
        </Card>
      </Link>
    </li>
  );
}

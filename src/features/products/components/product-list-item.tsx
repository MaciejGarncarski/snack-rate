import { Link } from "@tanstack/react-router";

import { ImageWithPlaceholder } from "#/components/layout/image-with-placeholder";
import { ProductRating } from "#/components/product/product-rating";
import { Card } from "#/components/ui/card";

type Props = {
  name: string;
  description: string | null;
  slug: string;
  rating: string;
  images: {
    url: string;
  }[];
};

export function ProductListItem({ name, description, slug, rating, images }: Props) {
  const ratingNumber = parseFloat(rating);

  return (
    <li>
      <Link to="/product/$slug" params={{ slug: slug }}>
        <Card className="p-4">
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="mx-auto h-48 w-72 overflow-hidden rounded-md">
            <ImageWithPlaceholder src={images[0].url} alt={name} />
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          <ProductRating rating={ratingNumber} withText size="sm" />
        </Card>
      </Link>
    </li>
  );
}

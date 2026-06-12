import { Link } from "@tanstack/react-router";

import { ProductListItemImage } from "#/components/layout/image-with-placeholder";
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
            <ProductListItemImage src={images[0].url} alt={name} />
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          <div className="flex items-center gap-4">
            <p className="text-lg font-bold">{rating}</p>
            <div className="text-xl">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={i < Math.round(ratingNumber) ? "text-yellow-500" : "text-gray-300"}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Link>
    </li>
  );
}

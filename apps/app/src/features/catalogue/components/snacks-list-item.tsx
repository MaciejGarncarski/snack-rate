import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

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
  ratingCount: number;
  type: string;
  lazy?: boolean;
  images: {
    id: string;
    url: string;
    storageKey: string;
    sortOrder: number;
    type: "thumbnail" | "default";
  }[];
};

export function SnacksListItem({ name, description, slug, rating, type, lazy, images }: Props) {
  const isLongDescription = description && description.length > 100;
  const truncatedDescription = isLongDescription ? description.slice(0, 100) + "..." : description;

  const imageThumbnail = images.filter((image) => image.type === "thumbnail")[0];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full max-w-sm md:mx-0 md:max-w-none"
    >
      <Link
        to="/produkt/$slug"
        params={{ slug }}
        viewTransition
        className="block h-full rounded-4xl"
        style={{ viewTransitionName: `snack-card-${slug}` }}
      >
        <Card className="flex h-full flex-col overflow-hidden pt-0 transition-shadow hover:shadow-lg md:flex-row md:gap-0 md:py-0">
          <Image
            lazy={lazy}
            placeholderSrc={imageThumbnail?.url}
            src={images[0]?.url}
            alt={name}
            blurBackground
            containerClassName="w-full aspect-4/5 shrink-0 md:w-[42%] lg:w-[38%] md:rounded-r-sm"
            className="h-full w-full object-cover rounded-t-4xl md:rounded-tr-none md:p-1 md:rounded-l-4xl md:rounded-r-xl"
          />
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-(--card-spacing) py-(--card-spacing)">
            <CardHeader className="gap-2">
              <CardAction>
                <Badge
                  variant={"outline"}
                  className="text-sm bg-primary/20 border-primary/30 rounded-full h-6 px-2 py-1 font-semibold"
                >
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
    </motion.li>
  );
}

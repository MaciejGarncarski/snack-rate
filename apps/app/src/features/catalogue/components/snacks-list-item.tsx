import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { Image } from "#/components/image/image";
import { GlowingImgBorder } from "#/components/layout/glowing-img-border";
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

export function SnacksListItem({
  name,
  description,
  slug,
  rating,
  type,
  lazy,
  images,
  ratingCount,
}: Props) {
  const isLongDescription = description && description.length > 100;
  const truncatedDescription = isLongDescription ? description.slice(0, 100) + "..." : description;

  const imageThumbnail = images.filter((image) => image.type === "thumbnail")[0];

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.96 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Link
        to="/produkt/$slug"
        params={{ slug }}
        className="block h-full rounded-3xl sm:rounded-4xl relative overflow-hidden p-0.75 group"
      >
        <GlowingImgBorder imgSrc={images[0]?.url} />
        <Card className="flex h-full flex-row items-stretch relative overflow-hidden p-0 rounded-3xl sm:rounded-4xl gap-2 sm:gap-1 transition-all duration-500 ease-out group-hover:shadow-lg group-hover:bg-card/85 backdrop-blur-3xl">
          <Image
            lazy={lazy}
            placeholderSrc={imageThumbnail?.url}
            src={images[0]?.url}
            alt={name}
            blurBackground
            containerClassName="w-28 sm:w-32 lg:w-40 shrink-0 aspect-[4/5] rounded-xl overflow-hidden p-1"
            className="h-full w-full object-cover rounded-xl sm:rounded-3xl"
          />

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:gap-(--card-spacing) py-2.5 sm:py-(--card-spacing) pr-3 sm:px-3 relative z-10">
            <CardHeader className="gap-1.5 sm:gap-2 p-0">
              <CardAction>
                <Badge
                  variant={"outline"}
                  className="bg-primary/20 border-primary/30 rounded-full font-semibold text-xs sm:text-sm h-5 sm:h-6 px-2 sm:px-2 py-0 sm:py-1"
                >
                  {type}
                </Badge>
              </CardAction>
              <CardTitle className="pr-8 sm:pr-6 text-[15px] sm:text-[17px] leading-tight line-clamp-2 text-balance">
                {name}
              </CardTitle>
              <CardDescription className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-snug sm:leading-normal text-pretty">
                {truncatedDescription ?? "Ten produkt nie ma jeszcze opisu."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto p-0">
              <div className="sm:hidden">
                <SnackRating rating={rating} withText ratingCount={ratingCount} size="sm" />
              </div>
              <div className="hidden sm:block">
                <SnackRating rating={rating} withText ratingCount={ratingCount} size="md" />
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </motion.li>
  );
}

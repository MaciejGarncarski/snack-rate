import { Link } from "@tanstack/react-router";
import { cn } from "cn";
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
import { useIsMobile } from "#/hooks/use-mobile";

const itemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

type Props = {
  name: string;
  description: string | null;
  slug: string;
  rating: number;
  ratingCount: number;
  type: string;
  layout: "1col" | "2col";
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
  layout,
}: Props) {
  const isLongDescription = description && description.length > 100;
  const truncatedDescription = isLongDescription ? description.slice(0, 100) + "..." : description;

  const isMobile = useIsMobile();
  const imageThumbnail = images.filter((image) => image.type === "thumbnail")[0];
  const isOneColumnLayout = layout === "1col";

  return (
    <motion.li
      layout={isMobile ? false : "position"}
      variants={itemVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Link
        to="/produkt/$slug"
        params={{ slug }}
        className="block h-full rounded-3xl sm:rounded-4xl relative overflow-hidden p-0.75 group"
      >
        <GlowingImgBorder imgSrc={images[0]?.url} />
        <Card
          className={cn(
            "flex h-full flex-row items-stretch relative overflow-hidden p-0 rounded-3xl sm:rounded-4xl gap-2 sm:gap-1 transition-all duration-500 ease-out group-hover:shadow-lg group-hover:bg-card/85 backdrop-blur-3xl",
            isOneColumnLayout && "sm:gap-4",
          )}
        >
          <Image
            lazy={lazy}
            placeholderSrc={imageThumbnail?.url}
            src={images[0]?.url}
            alt={name}
            blurBackground
            containerClassName={cn(
              "w-28 sm:w-32 lg:w-40 shrink-0 aspect-4/5 rounded-xl overflow-hidden p-1",
              isOneColumnLayout && "lg:w-48",
            )}
            className="h-full w-full object-cover rounded-xl sm:rounded-3xl"
          />

          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col justify-between gap-2 sm:gap-(--card-spacing) py-2.5 sm:py-(--card-spacing) pr-3 sm:px-3 relative z-10",
              isOneColumnLayout && "lg:pr-6",
            )}
          >
            <CardHeader className="gap-1.5 sm:gap-2 p-0">
              <CardAction>
                <Badge
                  variant={"outline"}
                  className="bg-primary/80 ring border-0 ring-primary/50 rounded-full font-semibold text-white text-xs sm:text-sm h-5 sm:h-6 px-2 sm:px-2 py-0 sm:py-1"
                >
                  {type}
                </Badge>
              </CardAction>
              <CardTitle
                className={cn(
                  "pr-8 sm:pr-6 text-xs sm:text-base leading-tight line-clamp-2 text-balance",
                  isOneColumnLayout && "sm:text-xl",
                )}
              >
                {name}
              </CardTitle>
              <CardDescription
                className={cn(
                  "line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-snug sm:leading-normal text-pretty",
                  isOneColumnLayout && "sm:text-base max-w-[40ch]",
                )}
              >
                {truncatedDescription ?? "Ten produkt nie ma jeszcze opisu."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto p-0">
              <div className="sm:hidden">
                <SnackRating rating={rating} withText ratingCount={ratingCount} size="sm" />
              </div>
              <div className="hidden sm:block">
                <SnackRating
                  rating={rating}
                  withText
                  ratingCount={ratingCount}
                  size={isOneColumnLayout ? "lg" : "md"}
                />
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </motion.li>
  );
}

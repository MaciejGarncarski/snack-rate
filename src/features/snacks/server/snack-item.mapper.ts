import { Image } from "#/features/snacks/server/image.entity";
import { SnackAggregate } from "#/features/snacks/server/snack.aggregate";
import { TagEntity } from "#/features/snacks/server/tag.entity";
import { AvgRating } from "#/features/snacks/server/value-objects/avg-rating.vo";
import { Price } from "#/features/snacks/server/value-objects/price.vo";
import { Slug } from "#/features/snacks/server/value-objects/slug.vo";

type DbImage = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  snackItemId: string;
  storageKey: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
};

type DbTag = {
  tag: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type DbBrand = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type DbBareSnackItem = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  brandId: string | null;
  slug: string;
  description: string | null;
  price: string | null;
  barcode: string | null;
  avgRating: string;
};

type DbSnackItem = DbBareSnackItem & {
  images: DbImage[];
  tags: DbTag[];
  brand: DbBrand | null;
};

export type SnackDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: { id: string; url: string; isPrimary: boolean; sortOrder: number }[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  brandId: string | null;
  tags: { id: string; name: string; slug: string }[];
  slug: string;
  barcode: string | null;
  avgRating: string;
};

export type SnackItemForPersistence = {
  snack: DbBareSnackItem;
  tags: DbTag[];
  images: DbImage[];
};

export const snackMapper = {
  toDomain(snack: DbSnackItem): SnackAggregate {
    const rawPrice = snack.price === null ? null : parseFloat(snack.price);
    const snackPrice = Price.create(rawPrice);

    const snackTags = snack.tags
      .filter((t): t is { tag: NonNullable<typeof t.tag> } => t.tag !== null)
      .map((t) => TagEntity.create({ id: t.tag.id, name: t.tag.name, slug: t.tag.slug }));

    const slug = Slug.create(snack.slug);
    const rating = AvgRating.create(snack.avgRating);

    const snackImages = snack.images.map((img) =>
      Image.fromPersistence({
        id: img.id,
        url: img.url,
        storageKey: img.storageKey,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
        deletedAt: img.deletedAt,
      }),
    );

    return new SnackAggregate(
      snack.id,
      snack.name,
      snack.description,
      snackPrice,
      snackImages,
      snack.createdAt,
      snack.updatedAt,
      snack.deletedAt,
      snack.brandId,
      snackTags,
      slug,
      snack.barcode,
      rating,
    );
  },

  toPersistence(snack: SnackAggregate): SnackItemForPersistence {
    return {
      snack: {
        id: snack.getId(),
        name: snack.getName(),
        description: snack.getDescription(),
        price: snack.getPrice().getValue().toString(),
        createdAt: snack.getCreatedAt(),
        updatedAt: snack.getUpdatedAt(),
        deletedAt: snack.getDeletedAt(),
        brandId: snack.getBrandId(),
        slug: snack.getSlug(),
        barcode: snack.getBarcode(),
        avgRating: snack.getRating().getValue().toString(),
      },
      tags: snack
        .getTags()
        .map((tag) => ({ tag: { id: tag.getId(), name: tag.getName(), slug: tag.getSlug() } })),
      images: snack.getImages().map((img) => ({
        id: img.id,
        storageKey: img.storageKey,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
        deletedAt: img.deletedAt,
        snackItemId: snack.getId(),
      })),
    };
  },

  toDTO(snack: SnackAggregate): SnackDTO {
    return {
      id: snack.getId(),
      name: snack.getName(),
      description: snack.getDescription(),
      price: snack.getPrice().getValue(),
      images: snack.getImages().map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      createdAt: snack.getCreatedAt(),
      updatedAt: snack.getUpdatedAt(),
      deletedAt: snack.getDeletedAt(),
      brandId: snack.getBrandId(),
      tags: snack.getTags().map((tag) => ({
        id: tag.getId(),
        name: tag.getName(),
        slug: tag.getSlug(),
      })),
      slug: snack.getSlug(),
      barcode: snack.getBarcode(),
      avgRating: snack.getRating().getValue().toString(),
    };
  },
};

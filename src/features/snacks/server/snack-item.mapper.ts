import { SnackAggregate } from "#/features/snacks/server/snack.aggregate";
import { TagEntity } from "#/features/snacks/server/tag.entity";
import { Image } from "#/features/snacks/server/value-objects/image.vo";
import { Price } from "#/features/snacks/server/value-objects/price.vo";
import { Rating } from "#/features/snacks/server/value-objects/rating.vo";
import { Slug } from "#/features/snacks/server/value-objects/slug.vo";
import { getPrivateFileUrl } from "#/infrastructure/s3-client";

type DbImage = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  snackItemId: string;
  storageKey: string;
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

type SnackItemForPersistence = {
  snack: DbBareSnackItem;
  tags: DbTag[] | null;
  images: DbImage[] | null;
  brandId: string | null;
};

export class SnackMapper {
  public static toDomain(snack: DbSnackItem[]): Promise<SnackAggregate[]> {
    const snackPromises = snack.map(async (s) => {
      if (!s.price) {
        throw new Error("Invalid snack price");
      }

      const snackPrice = Price.create(parseFloat(s.price));
      const snackTags =
        s.tags?.map((t) => new TagEntity(t.tag!.id, t.tag!.name, t.tag!.slug)) || [];
      const slug = Slug.create(s.slug);
      const rating = Rating.create(parseFloat(s.avgRating));

      const snackImages = await Promise.all(
        s.images.map(async (img) => {
          const url = await getPrivateFileUrl(img.storageKey);
          return new Image(
            img.id,
            url,
            img.storageKey,
            img.isPrimary,
            img.sortOrder,
            img.createdAt,
            img.updatedAt,
            img.deletedAt,
          );
        }),
      );

      return new SnackAggregate(
        s.id,
        s.name,
        s.description,
        snackPrice,
        snackImages,
        s.createdAt,
        s.updatedAt,
        s.deletedAt,
        s.brandId,
        snackTags,
        slug,
        s.barcode,
        rating,
      );
    });

    return Promise.all(snackPromises);
  }

  public static toPersistence(snack: SnackAggregate): SnackItemForPersistence {
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
        avgRating: snack.getRating(),
      },
      tags: snack
        .getTags()
        .map((tag) => ({ tag: { id: tag.getId(), name: tag.getName(), slug: tag.getSlug() } })),
      images: snack.getImages().map((img) => ({
        storageKey: img.getStorageKey(),
        isPrimary: img.getIsPrimary(),
        sortOrder: img.getSortOrder(),
        createdAt: img.getCreatedAt(),
        updatedAt: img.getUpdatedAt(),
        deletedAt: img.getDeletedAt(),
        id: img.getId(),
        snackItemId: snack.getId(),
      })),
      brandId: snack.getBrandId(),
    };
  }

  public static toDTO(snack: SnackAggregate) {
    return {
      id: snack.getId(),
      name: snack.getName(),
      description: snack.getDescription(),
      price: snack.getPrice().getValue(),
      images: snack.getImages().map((img) => ({
        id: img.getId(),
        url: img.getUrl(),
        isPrimary: img.getIsPrimary(),
        sortOrder: img.getSortOrder(),
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
      avgRating: snack.getRating(),
    };
  }
}

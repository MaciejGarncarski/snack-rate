import { ORPCError } from "@orpc/client";

import { DomainError } from "@/server/errors/domain-error";

type PgError = {
  code?: string;
  constraint?: string;
};

export function mapError(err: unknown): never {
  if (err instanceof DomainError) {
    switch (err.type) {
      case "SNACK_NOT_FOUND":
        throw new ORPCError("NOT_FOUND", err.toJSON());

      case "SNACK_ALREADY_EXISTS":
        throw new ORPCError("CONFLICT", err.toJSON());

      case "INVALID_SNACK_DATA":
        throw new ORPCError("BAD_REQUEST", err.toJSON());
    }
  }

  const pgErr = extractPgError(err);

  if (pgErr?.code === "23505") {
    const known = pgErr.constraint ? UNIQUE_CONSTRAINT_MAP[pgErr.constraint] : undefined;

    if (known) {
      throw new ORPCError("CONFLICT", {
        message: known.message,
        data: known.field ? { field: known.field } : undefined,
      });
    }

    throw new ORPCError("CONFLICT", {
      message: "Ten produkt już istnieje.",
    });
  }

  throw new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Nieznany błąd",
    cause: err,
  });
}

function extractPgError(err: unknown): PgError | null {
  if (!err || typeof err !== "object") return null;
  const e = err as Record<string, unknown>;
  const cause = (e.cause ?? e.original ?? e) as Record<string, unknown>;
  return {
    code: cause.code as string | undefined,
    constraint: cause.constraint as string | undefined,
  };
}

const UNIQUE_CONSTRAINT_MAP: Record<string, { message: string; field?: string }> = {
  // users
  users_email_unique_idx: {
    message: "Ten adres e-mail jest już zajęty.",
    field: "email",
  },

  // snack_types (column-level .unique() → drizzle default name "<table>_<column>_unique")
  snack_types_name_unique: {
    message: "Ta kategoria już istnieje.",
    field: "name",
  },
  snack_types_slug_unique: {
    message: "Ta kategoria już istnieje.",
    field: "slug",
  },

  // snack_items
  snack_items_slug_unique_idx: {
    message: "Ten produkt już istnieje.",
    field: "slug",
  },
  snack_items_barcode_unique_idx: {
    message: "Produkt z tym kodem kreskowym już istnieje.",
    field: "barcode",
  },

  // snack_reviews (composite — one user, one review per snack)
  snack_reviews_snack_user_unique_idx: {
    message: "Już dodałeś recenzję tego produktu.",
  },

  // reactions
  review_reactions_user_review_unique_idx: {
    message: "Już zareagowałeś na tę recenzję.",
  },
  comment_reactions_user_comment_unique_idx: {
    message: "Już zareagowałeś na ten komentarz.",
  },

  // reports
  review_reports_reporter_review_unique_idx: {
    message: "Już zgłosiłeś tę recenzję.",
  },
  comment_reports_reporter_comment_unique_idx: {
    message: "Już zgłosiłeś ten komentarz.",
  },

  // auth (unlikely to be hit via normal user flow, but covered)
  sessions_token_hash_unique: {
    message: "Wystąpił konflikt sesji.",
  },
  password_resets_token_hash_unique: {
    message: "Wystąpił konflikt żądania resetu hasła.",
  },
  email_verifications_token_hash_unique: {
    message: "Wystąpił konflikt weryfikacji e-mail.",
  },
};

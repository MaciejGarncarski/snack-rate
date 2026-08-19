import { ORPCError } from "@orpc/client";

type PgErrorCandidate = {
  code?: string;
  constraint?: string;
  cause?: PgErrorCandidate;
  original?: PgErrorCandidate;
};

function isKnownConstraint(constraint: string): constraint is keyof typeof UNIQUE_CONSTRAINT_MAP {
  return constraint in UNIQUE_CONSTRAINT_MAP;
}

export function mapError(cause: unknown): never {
  if (cause instanceof ORPCError) {
    throw cause;
  }

  const pgErr = extractPgError(cause);

  if (pgErr?.code === "23505") {
    const constraint = pgErr.constraint;

    if (constraint !== undefined && isKnownConstraint(constraint)) {
      const known: { message: string; field?: string } = UNIQUE_CONSTRAINT_MAP[constraint];

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
    cause,
  });
}

function extractPgError(cause: unknown): PgErrorCandidate | null {
  if (cause === null || cause === undefined) return null;
  // SAFETY: caught errors are objects; property access on boxed primitives yields undefined, never throws.
  const candidate = cause as PgErrorCandidate;
  return candidate.cause ?? candidate.original ?? candidate;
}

const UNIQUE_CONSTRAINT_MAP = {
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

  // reactions
  comment_reactions_user_comment_unique_idx: {
    message: "Już zareagowałeś na ten komentarz.",
  },

  // reports
  comment_reports_reporter_comment_unique_idx: {
    message: "Już zgłosiłeś ten komentarz.",
  },

  // comments
  snack_comments_author_snack_unique_idx: {
    message: "Już oceniłeś ten produkt.",
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
} satisfies Record<string, { message: string; field?: string }>;

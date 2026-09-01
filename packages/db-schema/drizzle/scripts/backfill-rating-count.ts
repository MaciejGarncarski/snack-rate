// oxlint-disable no-console
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

const DRY_RUN = process.argv.includes("--dry-run");

// Matches logic in apps/app/src/features/comments/server/repositories/ratings.ts:recalculateAvgRating
// Canonical definition: rating_count = COUNT(snack_comments) WHERE rating IS NOT NULL AND deleted_at IS NULL
//                       avg_rating   = ROUND(AVG(rating)::numeric, 2) or 0 when no ratings
async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Run with --env-file=.env.*");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL!);

  console.log(`Backfill snack_items.rating_count / avg_rating ${DRY_RUN ? "(dry-run)" : ""}`);

  // -------------------------------------------------------------------------
  // 1. Inspect current drift before backfill
  // -------------------------------------------------------------------------
  const drift = await db.execute(sql`
    SELECT
      si.id,
      si.slug,
      si.avg_rating AS current_avg,
      si.rating_count AS current_count,
      COALESCE(sub.cnt, 0)::int AS expected_count,
      COALESCE(sub.avg_val, 0)::numeric AS expected_avg
    FROM snack_items si
    LEFT JOIN (
      SELECT
        snack_item_id,
        COUNT(*)::int AS cnt,
        ROUND(AVG(rating)::numeric, 2) AS avg_val
      FROM snack_comments
      WHERE rating IS NOT NULL
        AND deleted_at IS NULL
      GROUP BY snack_item_id
    ) sub ON sub.snack_item_id = si.id
    WHERE si.rating_count IS DISTINCT FROM COALESCE(sub.cnt, 0)
       OR si.avg_rating::numeric IS DISTINCT FROM COALESCE(sub.avg_val, 0)::numeric
  `);

  console.log(
    `Found ${drift.rowCount ?? drift.rows.length} snack_items with drift (rating_count or avg_rating mismatch).`,
  );

  if ((drift.rowCount ?? drift.rows.length) > 0) {
    const preview = drift.rows.slice(0, 20) as Record<string, unknown>[];
    for (const row of preview) {
      console.log(
        `  - ${String(row.slug)} (${String(row.id).slice(0, 8)}): count ${String(row.current_count)} -> ${String(row.expected_count)}, avg ${String(row.current_avg)} -> ${String(row.expected_avg)}`,
      );
    }
    if ((drift.rows.length as number) > 20) {
      console.log(`  ... and ${Number(drift.rows.length) - 20} more`);
    }
  } else {
    console.log("No drift detected — nothing to backfill.");
    process.exit(0);
  }

  if (DRY_RUN) {
    console.log("Dry-run: no changes written. Re-run without --dry-run to apply.");
    process.exit(0);
  }

  // -------------------------------------------------------------------------
  // 2. Apply backfill inside a transaction
  // -------------------------------------------------------------------------
  // Two-step update so snacks with zero ratings are zeroed correctly.
  // Step 1: update snacks that have ratings
  // Step 2: zero out snacks with no ratings but stale values
  const updatedWithRatings = await db.execute(sql`
    WITH counts AS (
      SELECT
        snack_item_id,
        COUNT(*)::int AS cnt,
        ROUND(AVG(rating)::numeric, 2) AS avg_val
      FROM snack_comments
      WHERE rating IS NOT NULL
        AND deleted_at IS NULL
      GROUP BY snack_item_id
    )
    UPDATE snack_items si
    SET
      rating_count = counts.cnt,
      avg_rating   = counts.avg_val
    FROM counts
    WHERE si.id = counts.snack_item_id
      AND (
        si.rating_count IS DISTINCT FROM counts.cnt
        OR si.avg_rating::numeric IS DISTINCT FROM counts.avg_val::numeric
      )
  `);
  console.log(`  Updated ${updatedWithRatings.rowCount ?? 0} snack_items that have ratings.`);

  const zeroed = await db.execute(sql`
    UPDATE snack_items si
    SET
      rating_count = 0,
      avg_rating   = '0'
    WHERE NOT EXISTS (
      SELECT 1 FROM snack_comments sc
      WHERE sc.snack_item_id = si.id
        AND sc.rating IS NOT NULL
        AND sc.deleted_at IS NULL
    )
    AND (si.rating_count <> 0 OR si.avg_rating::numeric <> 0)
  `);
  console.log(`  Zeroed ${zeroed.rowCount ?? 0} snack_items with no ratings but stale values.`);

  const total = Number(updatedWithRatings.rowCount ?? 0) + Number(zeroed.rowCount ?? 0);
  console.log(`Backfill complete. Total rows updated: ${total}`);

  // -------------------------------------------------------------------------
  // 3. Verify
  // -------------------------------------------------------------------------
  const remaining = await db.execute(sql`
    SELECT COUNT(*)::int AS remaining
    FROM snack_items si
    LEFT JOIN (
      SELECT snack_item_id, COUNT(*)::int AS cnt, ROUND(AVG(rating)::numeric, 2) AS avg_val
      FROM snack_comments
      WHERE rating IS NOT NULL AND deleted_at IS NULL
      GROUP BY snack_item_id
    ) sub ON sub.snack_item_id = si.id
    WHERE si.rating_count IS DISTINCT FROM COALESCE(sub.cnt, 0)
       OR si.avg_rating::numeric IS DISTINCT FROM COALESCE(sub.avg_val, 0)::numeric
  `);
  const remainingCount = Number((remaining.rows[0] as Record<string, number>).remaining ?? 0);
  if (remainingCount === 0) {
    console.log("Verification passed: all snack_items now in sync.");
  } else {
    console.warn(`Verification failed: ${remainingCount} snack_items still out of sync.`);
    process.exit(1);
  }
}

try {
  await main();
  process.exit(0);
} catch (e) {
  console.error("Backfill failed:", e);
  process.exit(1);
}

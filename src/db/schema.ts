import * as pg from "drizzle-orm/pg-core";

export const todos = pg.pgTable("todos", {
  id: pg.serial().primaryKey(),
  title: pg.text().notNull(),
  createdAt: pg.timestamp("created_at").defaultNow(),
});

import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const overlays = sqliteTable(
  'overlays',
  {
    id: text('id').primaryKey(),
    data: text('data', { mode: 'json' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [index('expires_at_idx').on(table.expiresAt)],
);

export type Overlay = typeof overlays.$inferSelect;
export type NewOverlay = typeof overlays.$inferInsert;

import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { TOverlay } from '../types/OverlayType';

export const overlays = sqliteTable(
  'overlays',
  {
    id: text('id').primaryKey(),
    data: text('data', { mode: 'json' }).$type<TOverlay>().notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }),
  },
  (table) => [index('expires_at_idx').on(table.expiresAt)],
);

export type OverlayEntity = typeof overlays.$inferSelect;
export type NewOverlayEntity = typeof overlays.$inferInsert;

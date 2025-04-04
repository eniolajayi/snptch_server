import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const reports = table('reports', {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    imageUrl: t.text('image_url').notNull(),
    location: t.geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
    description: t.text('description'),
    address: t.text('address'),
    updated_at: t.timestamp().defaultNow().notNull(),
    created_at: t.timestamp().defaultNow().notNull(),
    deleted_at: t.timestamp(),
}, (table) => [
    t.index('spatial_index').using('gist', table.location),
]);
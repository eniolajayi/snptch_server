import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from './schema.js';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({ client: pool, casing: "snake_case", schema });

// await migrate(db);
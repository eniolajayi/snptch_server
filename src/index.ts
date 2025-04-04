import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HonoDiskStorage } from '@hono-storage/node-disk';
import type { NewReportBody } from './types/index.js';
import { db } from './db/index.js';
import { reports } from './db/schema.js';
import { eq } from 'drizzle-orm';

const app = new Hono();

const storage = new HonoDiskStorage({
  dest: "./src/uploads",
  filename: (c, file) => `${file.originalname}-${new Date().getTime()}.${file.extension}`
})

// routes
app.use('/api/*', cors())
app.get('/api/', (c) => {
  return c.json({
    ok: true,
    message: "Snappatch_server is live!"
  })
})

app.get("api/reports/", async (c) => {
  const result = await db.select().from(reports);

  return c.json({
    ok: true,
    message: "",
    data: result
  })
});

app.post("api/reports/", storage.single("image"), async (c) => {

  const body = await c.req.parseBody() as NewReportBody;

  if (!body.description || !body.latitude || !body.longitude || !body.address || !body.image) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await db.insert(reports).values({
    description: body.description,
    address: body.address,
    location: { x: body.latitude, y: body.longitude },
    imageUrl: `/uploads/${body.image.name}`
  }).returning();

  return c.json({
    ok: true,
    message: "Report submitted successfully",
    data: result
  }, 200);
});

app.delete("/api/reports/:id", async (c) => {
  const id = c.req.param("id");

  const result = await db.delete(reports).where(eq(reports.id, parseInt(id))).returning();

  if (result.length === 0) {
    return c.json({
      ok: false,
      message: "Report not found"
    }, 404);
  }

  return c.json({
    ok: true,
    message: "Report deleted successfully",
    data: result
  });
});


// start server
const port = 3000;
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})

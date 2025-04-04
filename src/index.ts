import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HonoDiskStorage } from '@hono-storage/node-disk';
import type { NewReportBody } from './types/index.js';
import { db } from './db/index.js';
import { reports } from './db/schema.js';
import { eq, isNull } from 'drizzle-orm';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

const storage = new HonoDiskStorage({
  dest: "./src/uploads",
  filename: (c, file) => `${file.originalname}-${new Date().getTime()}.${file.extension}`
})

// routes
app.use('/api/*', cors())

// serve static files (uploaded images)
app.use('/uploads/*', serveStatic({
  root: './src/',
}));


app.get('/api/', (c) => {
  return c.json({
    ok: true,
    message: "Snappatch_server is live!"
  })
})

// GET all reports route
app.get("api/reports/", async (c) => {

  try {
    const result = await db.select()
      .from(reports)
      .where(isNull(reports.deleted_at)); // Only fetch reports where deleted_at IS NULL

    return c.json({
      ok: true,
      message: "Reports retrieved successfully",
      data: result
    });

  } catch (error) {
    console.error("Error fetching reports:", error);
    return c.json({ ok: false, message: "Failed to fetch reports" }, 500);
  }

});

// POST add new report
app.post("api/reports/", storage.single("image"), async (c) => {

  try {

    const body = await c.req.parseBody() as NewReportBody;

    if (!body.image) {
      return c.json({ ok: false, message: "Missing image file" }, 400);
    }

    if (!body.description || !body.latitude || !body.longitude || !body.address || !body.image) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Convert lat/lon to numbers
    const longitude = parseFloat(body.longitude);
    const latitiude = parseFloat(body.latitude);

    if (isNaN(latitiude) || isNaN(longitude)) {
      return c.json({ ok: false, message: "Invalid latitude or longitude format" })
    }

    // --- Construct Image URL and Geometry ---
    const imageUrl = `/uploads/${body.image.name}`;

    const result = await db.insert(reports).values({
      description: body.description,
      address: body.address,
      location: { x: latitiude, y: longitude },
      imageUrl: imageUrl,
    }).returning();

    return c.json({
      ok: true,
      message: "Report submitted successfully",
      data: result[0],
    }, 200);

  } catch (error) {
    console.error("Error creating report:", error);
    return c.json({ ok: false, message: "Failed to submit report" }, 500);
  }
});

// DELETE single report
app.delete("/api/reports/:id", async (c) => {
  const idParam = c.req.param("id");
  const id = parseInt(idParam);

  // Validate ID
  if (isNaN(id)) {
    return c.json({ ok: false, message: "Invalid report ID format" }, 400);
  }

  try {
    // (Soft Delete)
    // Will still return success even if item is deleted, but we filter out soft-deleted items
    const result = await db.update(reports)
      .set({ deleted_at: new Date() })
      .where(eq(reports.id, id))
      .returning({ id: reports.id });


    if (result.length === 0) {
      return c.json({
        ok: false,
        message: "Report not found"
      }, 404);
    }

    return c.json({
      ok: true,
      message: "Report deleted successfully",
      data: { id: result[0].id }
    });

  } catch (error) {
    console.error("Error soft deleting report:", error);
    return c.json({ ok: false, message: "Failed to delete report" }, 500);
  }
});


// start server
const port = 3000;
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})

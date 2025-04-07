import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const nearbyQuerySchema = z.object({
    lat: z.coerce
        .number({ required_error: "Latitude (lat) is required", invalid_type_error: "Latitude must be a number" })
        .min(-90).max(90),
    lon: z.coerce
        .number({ required_error: "Longitude (lon) is required", invalid_type_error: "Longitude must be a number" })
        .min(-180).max(180),
    radius: z.coerce
        .number({ required_error: "Radius is required", invalid_type_error: "Radius must be a number" })
        .positive({ message: "Radius must be a positive number" })
});
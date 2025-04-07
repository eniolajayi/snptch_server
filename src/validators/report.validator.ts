import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const reportSchema = z.object({
    description: z.string({ required_error: "Description is required" })
        .min(1, { message: "Description cannot be empty" }),
    latitude: z.coerce
        .number({ invalid_type_error: "Latitude must be a number" })
        .min(-90, { message: "Latitude must be between -90 and 90" })
        .max(90, { message: "Latitude must be between -90 and 90" }),

    longitude: z.coerce
        .number({ invalid_type_error: "Longitude must be a number" })
        .min(-180, { message: "Longitude must be between -180 and 180" })
        .max(180, { message: "Longitude must be between -180 and 180" }),

    address: z.string({ required_error: "Address is required" })
        .min(1, { message: "Address cannot be empty" }),
});
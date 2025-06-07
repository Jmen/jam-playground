import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

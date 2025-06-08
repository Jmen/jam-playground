import { z } from "zod";

export const addLoopSchema = z.object({
  audioId: z.string().uuid(),
});

import { z } from "zod";

export const portalInput = z.object({
  returnPath: z.string().optional(),
});

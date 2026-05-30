import { z } from "zod"

export const accountSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }).trim(),
  bankName: z.string().trim().optional(),
  currency: z.string().length(3, { error: "Must be a 3-letter currency code" }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Invalid color" }),
})

export type AccountInput = z.infer<typeof accountSchema>

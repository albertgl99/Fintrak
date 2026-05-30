import { z } from "zod"

export const CATEGORY_ICONS = [
  "circle", "shopping-cart", "home", "car", "utensils", "heart",
  "briefcase", "trending-up", "trending-down", "credit-card", "gift",
  "plane", "book", "zap", "coffee", "music", "bus", "shirt",
  "baby", "dumbbell",
] as const

export const categorySchema = z.object({
  name: z.string().min(1, { error: "Name is required" }).trim(),
  icon: z.string().min(1, { error: "Icon is required" }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Invalid color" }),
  type: z.enum(["INCOME", "EXPENSE", "BOTH"]),
})

export type CategoryInput = z.infer<typeof categorySchema>

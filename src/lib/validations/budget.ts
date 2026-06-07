import { z } from "zod"

export const budgetSchema = z.object({
  categoryId: z.string().min(1, { error: "Category is required" }),
  amount: z.number({ error: "Must be a number" }).positive({ error: "Must be positive" }),
  period: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
})

export type BudgetInput = z.infer<typeof budgetSchema>

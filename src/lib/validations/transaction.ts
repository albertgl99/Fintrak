import { z } from "zod"

export const transactionSchema = z.object({
  accountId: z.string().min(1, { error: "Account is required" }),
  categoryId: z.string().optional(),
  amount: z.number({ error: "Must be a number" }).positive({ error: "Must be positive" }),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  description: z.string().min(1, { error: "Description is required" }).trim(),
  date: z.string().min(1, { error: "Date is required" }),
  notes: z.string().trim().optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>

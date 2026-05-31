import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkRowSchema = z.object({
  accountId: z.string().min(1),
  categoryId: z.string().optional(),
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  description: z.string().min(1).trim(),
  rawDescription: z.string().optional(),
  date: z.string().min(1),
  notes: z.string().optional(),
})

const bulkSchema = z.object({
  transactions: z.array(bulkRowSchema).min(1).max(500),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const validated = bulkSchema.safeParse(body)
  if (!validated.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 })
  }

  const { transactions } = validated.data

  const accountIds = [...new Set(transactions.map((t) => t.accountId))]
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds }, userId: user.id },
    select: { id: true },
  })
  if (accounts.length !== accountIds.length) {
    return Response.json({ error: "Account not found" }, { status: 404 })
  }

  const result = await prisma.transaction.createMany({
    data: transactions.map(({ date, ...rest }) => ({
      ...rest,
      date: new Date(date),
      source: "CSV_IMPORT" as const,
    })),
  })

  return Response.json({ count: result.count }, { status: 201 })
}

import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { budgetSchema } from "@/lib/validations/budget"
import { BudgetPeriod } from "@/generated/prisma/enums"
import { getPeriodRange } from "@/lib/budget-period"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const [budgets, accounts] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.account.findMany({ where: { userId: user.id }, select: { id: true } }),
  ])

  const accountIds = accounts.map(a => a.id)

  const byPeriod: Record<BudgetPeriod, string[]> = {
    [BudgetPeriod.WEEKLY]: [],
    [BudgetPeriod.MONTHLY]: [],
    [BudgetPeriod.YEARLY]: [],
  }
  for (const b of budgets) byPeriod[b.period].push(b.categoryId)

  const spentMap: Record<BudgetPeriod, Record<string, number>> = {
    [BudgetPeriod.WEEKLY]: {},
    [BudgetPeriod.MONTHLY]: {},
    [BudgetPeriod.YEARLY]: {},
  }

  await Promise.all(
    Object.values(BudgetPeriod).map(async (period) => {
      const catIds = byPeriod[period]
      if (catIds.length === 0) return
      const range = getPeriodRange(period)
      const rows = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { categoryId: { in: catIds }, accountId: { in: accountIds }, type: "EXPENSE", date: range },
        _sum: { amount: true },
      })
      spentMap[period] = Object.fromEntries(rows.map(r => [r.categoryId!, Number(r._sum.amount ?? 0)]))
    })
  )

  const result = budgets.map(b => ({
    ...b,
    amount: Number(b.amount),
    spent: spentMap[b.period]?.[b.categoryId] ?? 0,
  }))

  return Response.json(result)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const validated = budgetSchema.safeParse(body)
  if (!validated.success) return Response.json({ error: "Invalid data" }, { status: 400 })

  try {
    const budget = await prisma.budget.create({
      data: { userId: user.id, ...validated.data },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    })
    return Response.json({ ...budget, amount: Number(budget.amount), spent: 0 }, { status: 201 })
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return Response.json({ error: "Budget already exists for this category and period" }, { status: 409 })
    }
    return Response.json({ error: "Failed to create budget" }, { status: 500 })
  }
}

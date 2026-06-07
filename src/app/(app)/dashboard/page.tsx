import { Suspense } from "react"
import { redirect } from "next/navigation"
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { SpendingByCategory } from "@/components/dashboard/spending-by-category"
import { BalanceOverTime } from "@/components/dashboard/balance-over-time"
import { PeriodSelector } from "@/components/dashboard/period-selector"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.year ?? "") || now.getFullYear()
  const month = parseInt(params.month ?? "") || now.getMonth() + 1
  const safeMonth = Math.max(1, Math.min(12, month))

  const periodStart = startOfMonth(new Date(year, safeMonth - 1))
  const periodEnd = endOfMonth(new Date(year, safeMonth - 1))
  const prevPeriodStart = startOfMonth(new Date(year, safeMonth - 2))
  const prevPeriodEnd = endOfMonth(new Date(year, safeMonth - 2))

  const [currentTxs, prevTxs, allTimeIncome, allTimeExpenses] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        account: { userId: user.id },
        date: { gte: periodStart, lte: periodEnd },
        type: { in: ["INCOME", "EXPENSE"] },
      },
      include: { category: { select: { id: true, name: true, color: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.transaction.findMany({
      where: {
        account: { userId: user.id },
        date: { gte: prevPeriodStart, lte: prevPeriodEnd },
        type: { in: ["INCOME", "EXPENSE"] },
      },
      select: { amount: true, type: true },
    }),
    prisma.transaction.aggregate({
      where: { account: { userId: user.id }, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { account: { userId: user.id }, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ])

  const totalBalance =
    Number(allTimeIncome._sum.amount ?? 0) - Number(allTimeExpenses._sum.amount ?? 0)

  const income = currentTxs
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = currentTxs
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const net = income - expenses

  const prevIncome = prevTxs
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const prevExpenses = prevTxs
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const prevNet = prevIncome - prevExpenses

  // Spending by category
  const categoryMap = new Map<string, { name: string; color: string; amount: number }>()
  for (const t of currentTxs) {
    if (t.type !== "EXPENSE") continue
    const key = t.category?.id ?? "__uncategorized__"
    const existing = categoryMap.get(key)
    if (existing) {
      existing.amount += Number(t.amount)
    } else {
      categoryMap.set(key, {
        name: t.category?.name ?? "Uncategorized",
        color: t.category?.color ?? "#94a3b8",
        amount: Number(t.amount),
      })
    }
  }
  const spendingByCategory = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount)

  // Net flow over time (cumulative within period)
  const days = eachDayOfInterval({ start: periodStart, end: periodEnd })
  const txsByDay = new Map<string, number>()
  for (const t of currentTxs) {
    const day = format(t.date, "yyyy-MM-dd")
    const delta = t.type === "INCOME" ? Number(t.amount) : -Number(t.amount)
    txsByDay.set(day, (txsByDay.get(day) ?? 0) + delta)
  }
  let running = 0
  const balanceOverTime = days.map((day) => {
    running += txsByDay.get(format(day, "yyyy-MM-dd")) ?? 0
    return { date: format(day, "MMM d"), value: running }
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Your financial overview</p>
        </div>
        <Suspense>
          <PeriodSelector year={year} month={safeMonth} />
        </Suspense>
      </div>

      <SummaryCards
        summary={{ totalBalance, income, expenses, net, prevIncome, prevExpenses, prevNet }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpendingByCategory data={spendingByCategory} />
        <BalanceOverTime data={balanceOverTime} />
      </div>
    </div>
  )
}

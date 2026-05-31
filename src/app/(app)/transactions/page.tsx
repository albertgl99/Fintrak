import { Suspense } from "react"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionPagination } from "@/components/transactions/transaction-pagination"

interface PageProps {
  searchParams: Promise<{
    accountId?: string
    type?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const filters = await searchParams
  const page = Math.max(1, Number(filters.page ?? 1))
  const limit = 50

  const where = {
    account: { userId: user.id },
    ...(filters.accountId && { accountId: filters.accountId }),
    ...(filters.type && {
      type: filters.type as "INCOME" | "EXPENSE" | "TRANSFER",
    }),
    ...(filters.dateFrom || filters.dateTo
      ? {
          date: {
            ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
            ...(filters.dateTo && {
              lte: new Date(filters.dateTo + "T23:59:59"),
            }),
          },
        }
      : {}),
  }

  const [transactions, total, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, color: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
    prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({
      where: { OR: [{ userId: user.id }, { userId: null }] },
      orderBy: { name: "asc" },
    }),
  ])

  const serialized = transactions.map((t) => ({
    ...t,
    amount: t.amount.toString(),
    date: t.date.toISOString(),
  }))

  const accountsForForm = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    currency: a.currency,
    color: a.color,
  }))

  const categoriesForForm = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type as "INCOME" | "EXPENSE" | "BOTH",
  }))

  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "No transactions"
              : total <= limit
              ? `${total} transaction${total !== 1 ? "s" : ""}`
              : `Showing ${from}–${to} of ${total}`}
          </p>
        </div>
        <TransactionDialog
          accounts={accountsForForm}
          categories={categoriesForForm}
          trigger={
            <Button size="sm" disabled={accounts.length === 0}>
              <Plus className="size-4 mr-1.5" />
              Add
            </Button>
          }
        />
      </div>

      <div className="mb-4">
        <Suspense>
          <TransactionFilters accounts={accountsForForm} />
        </Suspense>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          Create an account first before adding transactions.
        </p>
      ) : (
        <>
          <TransactionList
            transactions={serialized}
            accounts={accountsForForm}
            categories={categoriesForForm}
          />
          <Suspense>
            <TransactionPagination page={page} total={total} limit={limit} />
          </Suspense>
        </>
      )}
    </div>
  )
}

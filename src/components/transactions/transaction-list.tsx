"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "@/components/categories/category-icon"
import { TransactionDialog } from "./transaction-dialog"
import { cn } from "@/lib/utils"

interface Account {
  id: string
  name: string
  color: string
  currency: string
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: "INCOME" | "EXPENSE" | "BOTH"
}

interface Transaction {
  id: string
  accountId: string
  categoryId: string | null
  amount: string
  type: "INCOME" | "EXPENSE" | "TRANSFER"
  description: string
  date: string
  notes: string | null
  account: { id: string; name: string; color: string }
  category: { id: string; name: string; icon: string; color: string } | null
}

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
}

export function TransactionList({
  transactions,
  accounts,
  categories,
}: TransactionListProps) {
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const allIds = transactions.map((t) => t.id)
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(allIds))

  const clearSelection = () => setSelected(new Set())

  const handleDelete = (id: string) => {
    if (!confirm("Delete this transaction?")) return
    startTransition(async () => {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next })
      router.refresh()
    })
  }

  const handleBulkDelete = () => {
    const ids = Array.from(selected)
    if (!confirm(`Delete ${ids.length} transaction${ids.length !== 1 ? "s" : ""}?`)) return
    startTransition(async () => {
      await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      setSelected(new Set())
      router.refresh()
    })
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">
        No transactions found.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {/* Bulk action toolbar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted border border-border text-sm">
          <span className="font-medium flex-1">
            {selected.size} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={clearSelection}
            disabled={isPending}
          >
            Clear
          </Button>
          {!allSelected && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={toggleAll}
              disabled={isPending}
            >
              Select all
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleBulkDelete}
            disabled={isPending}
          >
            <Trash2 className="size-3 mr-1" />
            Delete selected
          </Button>
        </div>
      )}

      {/* Header row with select-all */}
      <div className="flex items-center gap-3 px-3 pb-1">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected && !allSelected
          }}
          onChange={toggleAll}
          className="size-4 cursor-pointer accent-primary"
          aria-label="Select all transactions"
        />
        <span className="text-xs text-muted-foreground">
          {allSelected ? "Deselect all" : "Select all"}
        </span>
      </div>

      <ul className="space-y-1">
        {transactions.map((t) => {
          const amount = parseFloat(t.amount)
          const isIncome = t.type === "INCOME"
          const isTransfer = t.type === "TRANSFER"
          const isSelected = selected.has(t.id)

          return (
            <li
              key={t.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 group transition-colors",
                isSelected && "bg-muted/70"
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOne(t.id)}
                className="size-4 cursor-pointer accent-primary shrink-0"
                aria-label={`Select ${t.description}`}
              />

              <div
                className="flex items-center justify-center size-8 rounded-lg shrink-0"
                style={
                  t.category
                    ? { backgroundColor: t.category.color + "20", color: t.category.color }
                    : { backgroundColor: t.account.color + "20", color: t.account.color }
                }
              >
                {t.category ? (
                  <CategoryIcon name={t.category.icon} className="size-4" />
                ) : (
                  <div className="size-2 rounded-full bg-current" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <p className="text-xs text-muted-foreground">
                  {t.account.name}
                  {t.category && ` · ${t.category.name}`}
                  {" · "}
                  {format(new Date(t.date), "MMM d, yyyy")}
                </p>
              </div>

              <span
                className={cn(
                  "text-sm font-medium tabular-nums shrink-0",
                  isIncome ? "text-emerald-600 dark:text-emerald-400" : "",
                  isTransfer ? "text-muted-foreground" : "",
                  !isIncome && !isTransfer ? "text-destructive" : ""
                )}
              >
                {isIncome ? "+" : isTransfer ? "" : "-"}
                {amount.toFixed(2)}
              </span>

              <div className="flex sm:hidden sm:group-hover:flex items-center gap-1 shrink-0">
                <TransactionDialog
                  accounts={accounts}
                  categories={categories}
                  transaction={t}
                  trigger={
                    <Button variant="ghost" size="icon" className="size-7">
                      <Pencil className="size-3.5" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

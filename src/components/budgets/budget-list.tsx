"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "@/components/categories/category-icon"
import { BudgetDialog } from "./budget-dialog"
import { formatCurrency } from "@/components/dashboard/format"

interface BudgetCategory {
  id: string
  name: string
  icon: string
  color: string
}

interface FormCategory {
  id: string
  name: string
  type: "INCOME" | "EXPENSE" | "BOTH"
}

interface Budget {
  id: string
  categoryId: string
  amount: number
  period: "WEEKLY" | "MONTHLY" | "YEARLY"
  category: BudgetCategory
  spent: number
}

const PERIOD_LABELS = { WEEKLY: "Weekly", MONTHLY: "Monthly", YEARLY: "Yearly" }

function ProgressBar({ spent, budget, color }: { spent: number; budget: number; color: string }) {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0
  const isOver = spent > budget
  const isWarning = !isOver && pct >= 0.8
  const barColor = isOver ? "#ef4444" : isWarning ? "#f59e0b" : color

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(spent)} spent</span>
        <span>{formatCurrency(budget)} limit</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct * 100}%`, backgroundColor: barColor }}
        />
      </div>
      {isOver && (
        <p className="text-xs text-destructive font-medium">
          Over budget by {formatCurrency(spent - budget)}
        </p>
      )}
    </div>
  )
}

export function BudgetList({
  budgets,
  categories,
}: {
  budgets: Budget[]
  categories: FormCategory[]
}) {
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const handleDelete = (id: string) => {
    if (!confirm("Delete this budget?")) return
    startTransition(async () => {
      await fetch(`/api/budgets/${id}`, { method: "DELETE" })
      router.refresh()
    })
  }

  if (budgets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No budgets yet. Add one to start tracking your spending.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {budgets.map(budget => (
        <li key={budget.id} className="p-4 rounded-lg border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center size-8 rounded-lg shrink-0"
                style={{ backgroundColor: budget.category.color + "20", color: budget.category.color }}
              >
                <CategoryIcon name={budget.category.icon} className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{budget.category.name}</p>
                <p className="text-xs text-muted-foreground">{PERIOD_LABELS[budget.period]}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <BudgetDialog
                budget={budget}
                categories={categories}
                trigger={
                  <Button variant="ghost" size="icon" className="size-8">
                    <Pencil className="size-3.5" />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={() => handleDelete(budget.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
          <ProgressBar spent={budget.spent} budget={budget.amount} color={budget.category.color} />
        </li>
      ))}
    </ul>
  )
}

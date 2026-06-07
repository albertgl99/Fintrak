"use client"

import React, { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BudgetForm } from "./budget-form"
import type { BudgetInput } from "@/lib/validations/budget"

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE" | "BOTH"
}

interface Budget {
  id: string
  categoryId: string
  amount: number
  period: "WEEKLY" | "MONTHLY" | "YEARLY"
}

interface BudgetDialogProps {
  trigger: React.ReactElement
  categories: Category[]
  budget?: Budget
}

export function BudgetDialog({ trigger, categories, budget }: BudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const handleOpen = () => {
    setError(null)
    setOpen(true)
  }

  const onSubmit = async (data: BudgetInput) => {
    setError(null)
    startTransition(async () => {
      try {
        const url = budget ? `/api/budgets/${budget.id}` : "/api/budgets"
        const method = budget ? "PATCH" : "POST"

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? "Something went wrong")
          return
        }

        setOpen(false)
        router.refresh()
      } catch {
        setError("Network error, please try again")
      }
    })
  }

  const triggerEl = React.cloneElement(
    trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
    { onClick: handleOpen }
  )

  return (
    <>
      {triggerEl}
      {mounted && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{budget ? "Edit budget" : "New budget"}</DialogTitle>
            </DialogHeader>
            {error && (
              <p className="text-sm text-destructive -mt-2">{error}</p>
            )}
            <BudgetForm
              categories={categories}
              defaultValues={budget}
              onSubmit={onSubmit}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

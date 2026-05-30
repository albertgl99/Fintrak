"use client"

import React, { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TransactionForm } from "./transaction-form"
import type { TransactionInput } from "@/lib/validations/transaction"
import { format } from "date-fns"

interface Account {
  id: string
  name: string
  currency: string
}

interface Category {
  id: string
  name: string
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
}

interface TransactionDialogProps {
  trigger: React.ReactElement
  accounts: Account[]
  categories: Category[]
  transaction?: Transaction
}

export function TransactionDialog({
  trigger,
  accounts,
  categories,
  transaction,
}: TransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const onSubmit = async (data: TransactionInput) => {
    startTransition(async () => {
      const url = transaction
        ? `/api/transactions/${transaction.id}`
        : "/api/transactions"
      const method = transaction ? "PATCH" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      setOpen(false)
      router.refresh()
    })
  }

  const defaultValues: Partial<TransactionInput> = transaction
    ? {
        accountId: transaction.accountId,
        categoryId: transaction.categoryId ?? undefined,
        amount: parseFloat(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        date: format(new Date(transaction.date), "yyyy-MM-dd"),
        notes: transaction.notes ?? undefined,
      }
    : {}

  const triggerEl = React.cloneElement(
    trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
    { onClick: () => setOpen(true) }
  )

  return (
    <>
      {triggerEl}
      {mounted && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {transaction ? "Edit transaction" : "New transaction"}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              accounts={accounts}
              categories={categories}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AccountForm } from "./account-form"
import type { AccountInput } from "@/lib/validations/account"

interface Account {
  id: string
  name: string
  bankName: string | null
  currency: string
  color: string
}

interface AccountDialogProps {
  trigger: React.ReactElement
  account?: Account
}

export function AccountDialog({ trigger, account }: AccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const onSubmit = async (data: AccountInput) => {
    startTransition(async () => {
      const url = account ? `/api/accounts/${account.id}` : "/api/accounts"
      const method = account ? "PATCH" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      setOpen(false)
      router.refresh()
    })
  }

  const defaultValues = account
    ? { ...account, bankName: account.bankName ?? undefined }
    : { currency: "EUR", color: "#6366f1" }

  const triggerEl = React.cloneElement(
    trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
    { onClick: () => setOpen(true) }
  )

  return (
    <>
      {triggerEl}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{account ? "Edit account" : "New account"}</DialogTitle>
          </DialogHeader>
          <AccountForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

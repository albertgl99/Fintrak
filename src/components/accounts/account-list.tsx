"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountDialog } from "./account-dialog"

interface Account {
  id: string
  name: string
  bankName: string | null
  currency: string
  color: string
}

export function AccountList({ accounts }: { accounts: Account[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (id: string) => {
    if (!confirm("Delete this account? All its transactions will be deleted too.")) return
    startTransition(async () => {
      await fetch(`/api/accounts/${id}`, { method: "DELETE" })
      router.refresh()
    })
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No accounts yet. Add one to get started.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {accounts.map((account) => (
        <li
          key={account.id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            <div
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: account.color }}
            />
            <div>
              <p className="text-sm font-medium">{account.name}</p>
              {account.bankName && (
                <p className="text-xs text-muted-foreground">{account.bankName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">{account.currency}</span>
            <AccountDialog
              account={account}
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
              onClick={() => handleDelete(account.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

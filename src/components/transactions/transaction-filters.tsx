"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface Account {
  id: string
  name: string
}

interface TransactionFiltersProps {
  accounts: Account[]
}

export function TransactionFilters({ accounts }: TransactionFiltersProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearFilters = () => {
    router.push(pathname)
  }

  const hasFilters = searchParams.size > 0

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(v) => setParam("type", v ?? "all")}
      >
        <SelectTrigger size="sm" className="w-32">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="EXPENSE">Expense</SelectItem>
          <SelectItem value="INCOME">Income</SelectItem>
          <SelectItem value="TRANSFER">Transfer</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("accountId") ?? "all"}
        onValueChange={(v) => setParam("accountId", v ?? "all")}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="All accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="h-7 w-36 text-xs"
        defaultValue={searchParams.get("dateFrom") ?? ""}
        onChange={(e) => setParam("dateFrom", e.target.value)}
      />
      <span className="text-xs text-muted-foreground">to</span>
      <Input
        type="date"
        className="h-7 w-36 text-xs"
        defaultValue={searchParams.get("dateTo") ?? ""}
        onChange={(e) => setParam("dateTo", e.target.value)}
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      )}
    </div>
  )
}

"use client"

import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction"

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

interface TransactionFormProps {
  accounts: Account[]
  categories: Category[]
  defaultValues?: Partial<TransactionInput>
  onSubmit: (data: TransactionInput) => Promise<void>
  isPending: boolean
}

export function TransactionForm({
  accounts,
  categories,
  defaultValues,
  onSubmit,
  isPending,
}: TransactionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: format(new Date(), "yyyy-MM-dd"),
      ...defaultValues,
    },
  })

  const selectedType = useWatch({ control, name: "type" })

  const filteredCategories = categories.filter((c) => {
    if (selectedType === "TRANSFER") return false
    if (selectedType === "INCOME") return c.type === "INCOME" || c.type === "BOTH"
    return c.type === "EXPENSE" || c.type === "BOTH"
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            disabled={isPending}
            aria-invalid={!!errors.amount}
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Account</Label>
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => {
            const acct = accounts.find((a) => a.id === field.value)
            return (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full" aria-invalid={!!errors.accountId}>
                <SelectValue placeholder="Select account">
                  {acct ? `${acct.name} (${acct.currency})` : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}}
        />
        {errors.accountId && (
          <p className="text-xs text-destructive">{errors.accountId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Supermarket"
          disabled={isPending}
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            disabled={isPending}
            aria-invalid={!!errors.date}
            {...register("date")}
          />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>

        {selectedType !== "TRANSFER" && (
          <div className="space-y-1.5">
            <Label>Category <span className="text-muted-foreground">(optional)</span></Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => {
                const cat = filteredCategories.find((c) => c.id === field.value)
                return (
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None">
                      {cat ? cat.name : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                )
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea
          id="notes"
          placeholder="Add a note..."
          rows={2}
          disabled={isPending}
          {...register("notes")}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save transaction"}
      </Button>
    </form>
  )
}

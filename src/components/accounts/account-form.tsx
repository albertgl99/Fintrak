"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { accountSchema, type AccountInput } from "@/lib/validations/account"

interface AccountFormProps {
  defaultValues?: Partial<AccountInput>
  onSubmit: (data: AccountInput) => Promise<void>
  isPending: boolean
}

export function AccountForm({ defaultValues, onSubmit, isPending }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      currency: "EUR",
      color: "#6366f1",
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Account name</Label>
        <Input
          id="name"
          placeholder="e.g. Santander Checking"
          disabled={isPending}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bankName">Bank name <span className="text-muted-foreground">(optional)</span></Label>
        <Input
          id="bankName"
          placeholder="e.g. Santander"
          disabled={isPending}
          {...register("bankName")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            placeholder="EUR"
            maxLength={3}
            disabled={isPending}
            aria-invalid={!!errors.currency}
            {...register("currency")}
          />
          {errors.currency && (
            <p className="text-xs text-destructive">{errors.currency.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            disabled={isPending}
            className="h-8 px-1 py-0.5 cursor-pointer"
            {...register("color")}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save account"}
      </Button>
    </form>
  )
}

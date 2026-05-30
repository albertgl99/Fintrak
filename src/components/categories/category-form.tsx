"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPicker } from "./icon-picker"
import { categorySchema, type CategoryInput } from "@/lib/validations/category"

interface CategoryFormProps {
  defaultValues?: Partial<CategoryInput>
  onSubmit: (data: CategoryInput) => Promise<void>
  isPending: boolean
}

export function CategoryForm({ defaultValues, onSubmit, isPending }: CategoryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      icon: "circle",
      color: "#6366f1",
      type: "BOTH",
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. Groceries"
          disabled={isPending}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

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
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
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

      <div className="space-y-1.5">
        <Label>Icon</Label>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <IconPicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.icon && (
          <p className="text-xs text-destructive">{errors.icon.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save category"}
      </Button>
    </form>
  )
}

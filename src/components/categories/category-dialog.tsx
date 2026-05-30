"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CategoryForm } from "./category-form"
import type { CategoryInput } from "@/lib/validations/category"

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: "INCOME" | "EXPENSE" | "BOTH"
  userId: string | null
}

interface CategoryDialogProps {
  trigger: React.ReactElement
  category?: Category
}

export function CategoryDialog({ trigger, category }: CategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const onSubmit = async (data: CategoryInput) => {
    startTransition(async () => {
      const url = category ? `/api/categories/${category.id}` : "/api/categories"
      const method = category ? "PATCH" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">{trigger}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            defaultValues={category}
            onSubmit={onSubmit}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

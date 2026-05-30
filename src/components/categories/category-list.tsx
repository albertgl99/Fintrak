"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryDialog } from "./category-dialog"
import { CategoryIcon } from "./category-icon"

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: "INCOME" | "EXPENSE" | "BOTH"
  userId: string | null
  isDefault: boolean
}

const TYPE_LABELS = { INCOME: "Income", EXPENSE: "Expense", BOTH: "Both" }

export function CategoryList({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (id: string) => {
    if (!confirm("Delete this category?")) return
    startTransition(async () => {
      await fetch(`/api/categories/${id}`, { method: "DELETE" })
      router.refresh()
    })
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No categories yet. Add one to get started.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {categories.map((cat) => {
        const isSystem = !cat.userId
        return (
          <li
            key={cat.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center size-8 rounded-lg shrink-0"
                style={{ backgroundColor: cat.color + "20", color: cat.color }}
              >
                <CategoryIcon name={cat.icon} className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{TYPE_LABELS[cat.type]}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isSystem ? (
                <Lock className="size-3.5 text-muted-foreground mx-2" />
              ) : (
                <>
                  <CategoryDialog
                    category={cat}
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
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

import { Plus } from "lucide-react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { CategoryList } from "@/components/categories/category-list"
import { CategoryDialog } from "@/components/categories/category-dialog"

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">Manage your spending categories</p>
        </div>
        <CategoryDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              Add category
            </Button>
          }
        />
      </div>

      <CategoryList categories={categories} />
    </div>
  )
}

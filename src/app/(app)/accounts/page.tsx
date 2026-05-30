import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AccountList } from "@/components/accounts/account-list"
import { AccountDialog } from "@/components/accounts/account-dialog"

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Accounts</h2>
          <p className="text-sm text-muted-foreground">Manage your bank accounts</p>
        </div>
        <AccountDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              Add account
            </Button>
          }
        />
      </div>

      <AccountList accounts={accounts} />
    </div>
  )
}

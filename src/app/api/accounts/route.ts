import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { accountSchema } from "@/lib/validations/account"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  })

  return Response.json(accounts)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const validated = accountSchema.safeParse(body)
  if (!validated.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 })
  }

  const account = await prisma.account.create({
    data: { ...validated.data, userId: user.id },
  })

  return Response.json(account, { status: 201 })
}

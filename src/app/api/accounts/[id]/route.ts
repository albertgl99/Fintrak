import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { accountSchema } from "@/lib/validations/account"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const validated = accountSchema.partial().safeParse(body)
  if (!validated.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 })
  }

  const account = await prisma.account.updateMany({
    where: { id, userId: user.id },
    data: validated.data,
  })

  if (account.count === 0) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await prisma.account.findUnique({ where: { id } })
  return Response.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const deleted = await prisma.account.deleteMany({
    where: { id, userId: user.id },
  })

  if (deleted.count === 0) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return new Response(null, { status: 204 })
}

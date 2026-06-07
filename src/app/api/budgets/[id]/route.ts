import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { budgetSchema } from "@/lib/validations/budget"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const validated = budgetSchema.partial().safeParse(body)
  if (!validated.success) return Response.json({ error: "Invalid data" }, { status: 400 })

  const result = await prisma.budget.updateMany({
    where: { id, userId: user.id },
    data: validated.data,
  })

  if (result.count === 0) return Response.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.budget.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  })
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 })

  return Response.json({ ...updated, amount: Number(updated.amount) })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const deleted = await prisma.budget.deleteMany({ where: { id, userId: user.id } })
  if (deleted.count === 0) return Response.json({ error: "Not found" }, { status: 404 })

  return new Response(null, { status: 204 })
}

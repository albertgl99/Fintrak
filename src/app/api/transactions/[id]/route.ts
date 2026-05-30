import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { transactionSchema } from "@/lib/validations/transaction"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const validated = transactionSchema.partial().safeParse(body)
  if (!validated.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 })
  }

  const { amount, date, ...rest } = validated.data

  const existing = await prisma.transaction.findFirst({
    where: { id, account: { userId: user.id } },
  })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...rest,
      ...(amount !== undefined && { amount }),
      ...(date !== undefined && { date: new Date(date) }),
    },
    include: {
      account: { select: { id: true, name: true, color: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  })

  return Response.json({ ...updated, amount: updated.amount.toString() })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.transaction.findFirst({
    where: { id, account: { userId: user.id } },
  })
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 })

  await prisma.transaction.delete({ where: { id } })

  return new Response(null, { status: 204 })
}

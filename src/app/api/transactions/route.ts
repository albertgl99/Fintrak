import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { transactionSchema } from "@/lib/validations/transaction"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const accountId = searchParams.get("accountId") ?? undefined
  const type = searchParams.get("type") ?? undefined
  const categoryId = searchParams.get("categoryId") ?? undefined
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = 50

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { userId: user.id },
      ...(accountId && { accountId }),
      ...(type && { type: type as "INCOME" | "EXPENSE" | "TRANSFER" }),
      ...(categoryId && { categoryId }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo + "T23:59:59") }),
            },
          }
        : {}),
    },
    include: {
      account: { select: { id: true, name: true, color: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: { date: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  })

  const serialized = transactions.map((t) => ({
    ...t,
    amount: t.amount.toString(),
  }))

  return Response.json(serialized)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const validated = transactionSchema.safeParse(body)
  if (!validated.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 })
  }

  const { amount, date, categoryId, ...rest } = validated.data

  const account = await prisma.account.findFirst({
    where: { id: rest.accountId, userId: user.id },
  })
  if (!account) return Response.json({ error: "Account not found" }, { status: 404 })

  const transaction = await prisma.transaction.create({
    data: {
      ...rest,
      amount,
      date: new Date(date),
      ...(categoryId ? { categoryId } : {}),
      source: "MANUAL",
    },
    include: {
      account: { select: { id: true, name: true, color: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  })

  return Response.json({ ...transaction, amount: transaction.amount.toString() }, { status: 201 })
}

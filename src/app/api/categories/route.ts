import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { categorySchema } from "@/lib/validations/category"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  })

  return Response.json(categories)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const validated = categorySchema.safeParse(body)
  if (!validated.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { ...validated.data, userId: user.id },
  })

  return Response.json(category, { status: 201 })
}

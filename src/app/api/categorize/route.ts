import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const bodySchema = z.object({
  rows: z.array(
    z.object({ index: z.number(), description: z.string(), type: z.string() })
  ),
  categories: z.array(
    z.object({ id: z.string(), name: z.string(), type: z.string() })
  ),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ error: "Invalid data" }, { status: 400 })

  const { rows, categories } = parsed.data
  if (!rows.length) return Response.json({ suggestions: [] })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return Response.json({ suggestions: [] })

  const categoryList = categories
    .map((c) => `${c.id} | ${c.name} | ${c.type}`)
    .join("\n")

  const rowList = rows
    .map((r) => `${r.index}. "${r.description}" (${r.type})`)
    .join("\n")

  const prompt = `You are a personal finance categorization assistant for a Spanish bank account.

Available categories (id | name | type — INCOME/EXPENSE/BOTH):
${categoryList}

Transactions to categorize:
${rowList}

Rules:
- Only assign a category whose type matches the transaction type (INCOME→INCOME or BOTH, EXPENSE→EXPENSE or BOTH).
- Be confident — skip if uncertain.
- Return ONLY a raw JSON array, no markdown, no explanation.

Format: [{"index":1,"categoryId":"..."},{"index":3,"categoryId":"..."}]`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    return Response.json({ suggestions })
  } catch {
    return Response.json({ suggestions: [] })
  }
}

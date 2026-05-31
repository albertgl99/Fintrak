import type { ParsedRow } from "./types"

type MinCategory = { id: string; name: string; type: string }

const RULES: { pattern: RegExp; slugs: string[] }[] = [
  {
    pattern: /mercadona|lidl|aldi|caprabo|carrefour|eroski|bonarea|bon.?area|dia\b|alcampo|consum|supermercat|supermercado|alimentaci/i,
    slugs: ["grocer", "food", "supermarket", "alimenta", "comida", "super"],
  },
  {
    pattern: /restauran|cafeter|bar\b|pizz|burger|sushi|mcdonalds|kfc|telepizza|kebab|marisquer|wonderful.cook/i,
    slugs: ["restaurant", "dining", "food", "bar", "comida", "restauran"],
  },
  {
    pattern: /salario|nomina|nómina|sueldo|salarios|pago.*nomina|concepto.*salario/i,
    slugs: ["salary", "income", "payroll", "nomina", "sueldo", "salario"],
  },
  {
    pattern: /bizum\s+(a favor|de)\b/i,
    slugs: ["transfer", "transferen", "bizum"],
  },
  {
    pattern: /transferencia\s+(inmediata|de|a favor)/i,
    slugs: ["transfer", "transferen"],
  },
  {
    pattern: /netflix|spotify|hbo|disney|apple\.com|google.*play|amazon.*prime|prime.*video|youtube.*premium/i,
    slugs: ["subscription", "suscri", "streaming", "entertainment", "ocio"],
  },
  {
    pattern: /amazon(?!.*prime)|aliexpress|zara\b|h&m|primark|mango\b|corte.ingles|mediamarkt|fnac|shopify/i,
    slugs: ["shopping", "compra", "ropa", "retail"],
  },
  {
    pattern: /renfe|taxi|uber\b|cabify|bus\b|metro\b|emt\b|tmb\b|bicing|gasolina|repsol|bp\b|cepsa|galp|llevicome/i,
    slugs: ["transport", "travel", "transporte", "gasolina"],
  },
  {
    pattern: /farmacia|pharmacy|clinica|médico|medico|dentista|doctor|hospital|sanitas|adeslas|nyx\b/i,
    slugs: ["health", "medical", "salud", "farmacia"],
  },
  {
    pattern: /endesa|iberdrola|naturgy|engie|aguas\b|agua\b|electricidad|luz\b|gas\b|internet|telefon|vodafone|movistar|orange\b/i,
    slugs: ["utilities", "bills", "suministro", "hogar", "home"],
  },
  {
    pattern: /playtomic|gym\b|fitness|padel|tenis|deporte|sport|decathlon|nike|adidas|omega.barber|barber/i,
    slugs: ["sport", "fitness", "leisure", "ocio", "deporte", "personal"],
  },
  {
    pattern: /renting|hipoteca|alquiler|comunidad|ibi\b|seguro/i,
    slugs: ["housing", "rent", "home", "hogar", "vivienda"],
  },
  {
    pattern: /liquidacion.*tarjeta|tarjeta.*credito|amortizacion|prestamo/i,
    slugs: ["finance", "bank", "credit", "finanzas", "banco"],
  },
  {
    pattern: /bonificacion|cashback|devolucion.*compra|reembolso|refund/i,
    slugs: ["income", "cashback", "other", "otros"],
  },
]

export function categorize(
  description: string,
  type: "INCOME" | "EXPENSE" | "TRANSFER",
  categories: MinCategory[]
): string | undefined {
  const eligible = categories.filter(
    (c) => c.type === "BOTH" || c.type === type
  )
  for (const rule of RULES) {
    if (!rule.pattern.test(description)) continue
    for (const slug of rule.slugs) {
      const match = eligible.find((c) => c.name.toLowerCase().includes(slug))
      if (match) return match.id
    }
  }
  return undefined
}

export function autoCategorize(
  rows: ParsedRow[],
  categories: MinCategory[]
): ParsedRow[] {
  return rows.map((row) => {
    if (row.parseError || row.categoryId) return row
    const categoryId = categorize(row.description, row.type as "INCOME" | "EXPENSE" | "TRANSFER", categories)
    return categoryId ? { ...row, categoryId } : row
  })
}

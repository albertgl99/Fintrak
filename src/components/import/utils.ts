import { parse, isValid, format } from "date-fns"
import type { ColumnMapping, ParsedRow, TransactionType } from "./types"

export function parseAmountStr(
  raw: string,
  decimalSeparator: "." | ","
): { amount: number; type: TransactionType } {
  let cleaned = raw.trim()
  if (decimalSeparator === ",") {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".")
  } else {
    cleaned = cleaned.replace(/,/g, "")
  }
  const value = parseFloat(cleaned)
  if (isNaN(value)) throw new Error(`Cannot parse amount: "${raw}"`)
  if (value === 0) throw new Error(`Amount cannot be zero`)
  return {
    amount: Math.abs(value),
    type: value >= 0 ? "INCOME" : "EXPENSE",
  }
}

export function parseDateStr(raw: string, dateFormat: string): string {
  const parsed = parse(raw.trim(), dateFormat, new Date())
  if (!isValid(parsed)) throw new Error(`Cannot parse date: "${raw}"`)
  return format(parsed, "yyyy-MM-dd")
}

export function processRows(
  data: Record<string, string>[],
  mapping: ColumnMapping
): ParsedRow[] {
  return data.map((row, i) => {
    const id = String(i)
    try {
      const rawDescription = (row[mapping.descriptionCol] ?? "").trim()
      if (!rawDescription) throw new Error("Description is empty")
      const dateStr = parseDateStr(row[mapping.dateCol] ?? "", mapping.dateFormat)
      const { amount, type } = parseAmountStr(
        row[mapping.amountCol] ?? "",
        mapping.decimalSeparator
      )
      return {
        id,
        date: dateStr,
        description: rawDescription,
        rawDescription,
        amount,
        type,
        selected: true,
      }
    } catch (err) {
      return {
        id,
        date: "",
        description: "",
        rawDescription: "",
        amount: 0,
        type: "EXPENSE" as TransactionType,
        selected: false,
        parseError: err instanceof Error ? err.message : "Parse error",
      }
    }
  })
}

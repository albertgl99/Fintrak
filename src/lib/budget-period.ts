import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns"
import { BudgetPeriod } from "@/generated/prisma/enums"

export function getPeriodRange(period: BudgetPeriod) {
  const now = new Date()
  if (period === BudgetPeriod.WEEKLY)
    return { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) }
  if (period === BudgetPeriod.YEARLY)
    return { gte: startOfYear(now), lte: endOfYear(now) }
  return { gte: startOfMonth(now), lte: endOfMonth(now) }
}

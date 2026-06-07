"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths } from "date-fns"

interface Props {
  year: number
  month: number
}

export function PeriodSelector({ year, month }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = new Date(year, month - 1)
  const now = new Date()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  function navigate(date: Date) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("year", String(date.getFullYear()))
    params.set("month", String(date.getMonth() + 1))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(subMonths(current, 1))}
        className="size-8 flex items-center justify-center rounded-lg border hover:bg-muted transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="text-sm font-medium w-28 text-center">
        {format(current, "MMMM yyyy")}
      </span>
      <button
        onClick={() => navigate(addMonths(current, 1))}
        disabled={isCurrentMonth}
        className="size-8 flex items-center justify-center rounded-lg border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

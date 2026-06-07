"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "./format"
import type { DashboardData } from "./types"

interface Props {
  data: DashboardData["balanceOverTime"]
}

export function BalanceOverTime({ data }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="rounded-xl border bg-card p-5 h-80 animate-pulse" />

  const hasData = data.some((d) => d.value !== 0)

  if (!hasData) {
    return (
      <div className="rounded-xl border bg-card p-5 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Net Flow</h3>
        <div className="flex-1 flex items-center justify-center h-60 text-sm text-muted-foreground">
          No transactions this period
        </div>
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.1 || 100

  // Show every ~5th label to avoid overlap
  const tickInterval = Math.ceil(data.length / 6)

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Net Flow</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            interval={tickInterval - 1}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v) =>
              new Intl.NumberFormat("en-IE", {
                style: "currency",
                currency: "EUR",
                notation: "compact",
              }).format(v)
            }
            domain={[min - padding, max + padding]}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value ?? 0)), "Net flow"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatCurrency } from "./format"
import type { DashboardData } from "./types"

interface Props {
  data: DashboardData["spendingByCategory"]
}

export function SpendingByCategory({ data }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="rounded-xl border bg-card p-5 h-80 animate-pulse" />

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Spending by Category</h3>
        <div className="flex-1 flex items-center justify-center h-60 text-sm text-muted-foreground">
          No expenses this period
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="amount"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value ?? 0))}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              fontSize: "12px",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "hsl(var(--foreground))" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

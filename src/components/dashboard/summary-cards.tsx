"use client"

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency } from "./format"
import type { DashboardData } from "./types"

interface Props {
  summary: DashboardData["summary"]
}

function pctChange(current: number, prev: number) {
  if (prev === 0) return null
  return ((current - prev) / Math.abs(prev)) * 100
}

interface CardProps {
  title: string
  value: number
  icon: React.ReactNode
  iconBg: string
  valueColor?: string
  change?: number | null
  invertChangeColor?: boolean
}

function SummaryCard({ title, value, icon, iconBg, valueColor, change, invertChangeColor }: CardProps) {
  const rawPositive = change !== null && change !== undefined && change >= 0
  const isGood = invertChangeColor ? !rawPositive : rawPositive

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className={`size-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={`text-2xl font-bold tabular-nums ${valueColor ?? ""}`}>
          {formatCurrency(value)}
        </span>
        {change !== null && change !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium mb-0.5 ${
              isGood ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {rawPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {Math.abs(change).toFixed(1)}% vs last month
          </span>
        )}
      </div>
    </div>
  )
}

export function SummaryCards({ summary }: Props) {
  const { totalBalance, income, expenses, net, prevIncome, prevExpenses, prevNet } = summary

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Balance"
        value={totalBalance}
        icon={<Wallet className="size-4 text-violet-600" />}
        iconBg="bg-violet-100 dark:bg-violet-900/30"
        valueColor={totalBalance >= 0 ? "text-foreground" : "text-red-500"}
      />
      <SummaryCard
        title="Income"
        value={income}
        icon={<TrendingUp className="size-4 text-emerald-600" />}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        change={pctChange(income, prevIncome)}
      />
      <SummaryCard
        title="Expenses"
        value={expenses}
        icon={<TrendingDown className="size-4 text-red-500" />}
        iconBg="bg-red-100 dark:bg-red-900/30"
        valueColor="text-red-500"
        change={pctChange(expenses, prevExpenses)}
        invertChangeColor
      />
      <SummaryCard
        title="Net"
        value={net}
        icon={
          net >= 0 ? (
            <ArrowUpRight className="size-4 text-blue-600" />
          ) : (
            <ArrowDownRight className="size-4 text-orange-500" />
          )
        }
        iconBg={net >= 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-orange-100 dark:bg-orange-900/30"}
        valueColor={net >= 0 ? "text-blue-600" : "text-orange-500"}
        change={pctChange(net, prevNet)}
      />
    </div>
  )
}

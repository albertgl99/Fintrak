export interface DashboardData {
  summary: {
    totalBalance: number
    income: number
    expenses: number
    net: number
    prevIncome: number
    prevExpenses: number
    prevNet: number
  }
  spendingByCategory: { name: string; color: string; amount: number }[]
  balanceOverTime: { date: string; value: number }[]
}

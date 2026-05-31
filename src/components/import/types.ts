export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER"

export type ColumnMapping = {
  dateCol: string
  descriptionCol: string
  amountCol: string
  dateFormat: string
  decimalSeparator: "." | ","
}

export type ParsedRow = {
  id: string
  date: string
  description: string
  rawDescription: string
  amount: number
  type: TransactionType
  selected: boolean
  parseError?: string
}

export type Account = {
  id: string
  name: string
  currency: string
}

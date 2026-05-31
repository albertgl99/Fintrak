"use client"

import { useState } from "react"
import { parseISO, format } from "date-fns"
import type { ParsedRow } from "./types"

type MinCategory = { id: string; name: string; type: string }

interface Props {
  rows: ParsedRow[]
  accountId: string
  categories: MinCategory[]
  onBack: () => void
  onDone: () => void
}

export function StepPreview({ rows: initialRows, accountId, categories, onBack, onDone }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ count: number } | null>(null)
  const [error, setError] = useState("")

  const validRows = rows.filter((r) => !r.parseError)
  const selectedRows = validRows.filter((r) => r.selected)
  const errorRows = rows.filter((r) => r.parseError)
  const allSelected = validRows.length > 0 && validRows.every((r) => r.selected)

  function toggleRow(id: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)))
  }

  function toggleAll() {
    setRows((rs) =>
      rs.map((r) => (r.parseError ? r : { ...r, selected: !allSelected }))
    )
  }

  function setCategoryId(id: string, categoryId: string | undefined) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, categoryId } : r)))
  }

  async function handleImport() {
    if (!selectedRows.length) {
      setError("No rows selected")
      return
    }
    setImporting(true)
    setError("")
    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: selectedRows.map((r) => ({
            accountId,
            categoryId: r.categoryId || undefined,
            amount: r.amount,
            type: r.type,
            description: r.description,
            rawDescription: r.rawDescription,
            date: r.date,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Import failed")
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setImporting(false)
    }
  }

  if (result) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="text-5xl">✓</div>
        <p className="text-lg font-semibold">{result.count} transactions imported</p>
        <button
          onClick={onDone}
          className="rounded-md bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          View Transactions
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedRows.length} of {validRows.length} transactions selected
          {errorRows.length > 0 && (
            <span className="text-destructive ml-1">
              · {errorRows.length} rows failed to parse
            </span>
          )}
        </p>
        <button onClick={toggleAll} className="text-xs text-primary underline">
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      <div className="rounded-md border overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left w-8">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="px-3 py-2 text-left font-medium">Date</th>
              <th className="px-3 py-2 text-left font-medium">Description</th>
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-t ${
                  row.parseError ? "bg-destructive/5 text-muted-foreground" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={row.selected && !row.parseError}
                    disabled={!!row.parseError}
                    onChange={() => toggleRow(row.id)}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {row.date ? format(parseISO(row.date), "dd/MM/yyyy") : "—"}
                </td>
                <td className="px-3 py-2 max-w-[180px] truncate">
                  {row.parseError ? (
                    <span className="text-xs text-destructive">{row.parseError}</span>
                  ) : (
                    row.description
                  )}
                </td>
                <td className="px-3 py-2">
                  {!row.parseError && (
                    <select
                      value={row.categoryId ?? ""}
                      onChange={(e) =>
                        setCategoryId(row.id, e.target.value || undefined)
                      }
                      className="text-xs rounded border border-input bg-background px-1 py-0.5 max-w-[130px]"
                    >
                      <option value="">None</option>
                      {categories
                        .filter(
                          (c) => c.type === "BOTH" || c.type === row.type
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  )}
                </td>
                <td
                  className={`px-3 py-2 text-right font-medium tabular-nums ${
                    row.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {row.parseError
                    ? "—"
                    : `${row.type === "INCOME" ? "+" : "-"}${row.amount.toFixed(2)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleImport}
          disabled={importing || !selectedRows.length}
          className="flex-1 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {importing
            ? "Importing…"
            : `Import ${selectedRows.length} transaction${selectedRows.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  )
}

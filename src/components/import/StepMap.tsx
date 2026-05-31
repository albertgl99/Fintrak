"use client"

import { useState } from "react"
import { processRows } from "./utils"
import type { ColumnMapping, ParsedRow } from "./types"
import type { Preset } from "./presets"

interface Props {
  headers: string[]
  data: Record<string, string>[]
  preset: Preset
  onNext: (rows: ParsedRow[], mapping: ColumnMapping) => void
  onBack: () => void
}

const DATE_FORMATS = [
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY (28/04/2024)" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY (04/28/2024)" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD (2024-04-28)" },
  { value: "dd-MM-yyyy", label: "DD-MM-YYYY (28-04-2024)" },
  { value: "d/M/yyyy", label: "D/M/YYYY (8/4/2024)" },
]

function findHeader(headers: string[], target: string): string | undefined {
  if (!target) return undefined
  return headers.find((h) => h.toLowerCase() === target.toLowerCase())
}

export function StepMap({ headers, data, preset, onNext, onBack }: Props) {
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateCol: findHeader(headers, preset.dateCol) ?? headers[0] ?? "",
    descriptionCol: findHeader(headers, preset.descriptionCol) ?? headers[1] ?? "",
    amountCol: findHeader(headers, preset.amountCol) ?? headers[2] ?? "",
    dateFormat: preset.dateFormat,
    decimalSeparator: preset.decimalSeparator,
  })
  const [error, setError] = useState("")

  function handleNext() {
    if (!mapping.dateCol || !mapping.descriptionCol || !mapping.amountCol) {
      setError("Please map all required columns")
      return
    }
    const rows = processRows(data, mapping)
    const validCount = rows.filter((r) => !r.parseError).length
    if (validCount === 0) {
      setError(
        "No rows could be parsed. Check your column mapping and date format."
      )
      return
    }
    onNext(rows, mapping)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {data.length} rows detected. Map the CSV columns to the required fields.
      </p>

      <div className="grid gap-4">
        <Field label="Date column">
          <select
            value={mapping.dateCol}
            onChange={(e) => setMapping((m) => ({ ...m, dateCol: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date format">
          <select
            value={mapping.dateFormat}
            onChange={(e) =>
              setMapping((m) => ({ ...m, dateFormat: e.target.value }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {DATE_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description column">
          <select
            value={mapping.descriptionCol}
            onChange={(e) =>
              setMapping((m) => ({ ...m, descriptionCol: e.target.value }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Amount column">
          <select
            value={mapping.amountCol}
            onChange={(e) =>
              setMapping((m) => ({ ...m, amountCol: e.target.value }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Decimal separator">
          <select
            value={mapping.decimalSeparator}
            onChange={(e) =>
              setMapping((m) => ({
                ...m,
                decimalSeparator: e.target.value as "." | ",",
              }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value=",">Comma — 1.234,56</option>
            <option value=".">Period — 1,234.56</option>
          </select>
        </Field>
      </div>

      <p className="text-xs text-muted-foreground">
        Negative amounts are imported as Expenses; positive as Income.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Preview →
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

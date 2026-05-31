"use client"

import { useEffect, useRef, useState } from "react"
import type { DragEvent } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { PRESETS, type Preset } from "./presets"
import type { Account } from "./types"

interface Props {
  accounts: Account[]
  onNext: (params: {
    headers: string[]
    data: Record<string, string>[]
    preset: Preset
    accountId: string
  }) => void
}
export function StepUpload({ accounts, onNext }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "")

  useEffect(() => {
    if (!accountId && accounts[0]?.id) setAccountId(accounts[0].id)
  }, [accounts])
  const [presetId, setPresetId] = useState("santander")
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]

  const ALLOWED_EXTENSIONS = [".csv", ".tsv", ".txt", ".xlsx", ".xls"]

  function getExt(f: File) {
    return "." + (f.name.split(".").pop()?.toLowerCase() ?? "")
  }

  function handleFile(f: File) {
    if (!ALLOWED_EXTENSIONS.includes(getExt(f))) {
      setError(`Unsupported format. Accepted: ${ALLOWED_EXTENSIONS.join(", ")}`)
      return
    }
    setFile(f)
    setError("")
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleParse() {
    if (!file) {
      setError("Please select a file")
      return
    }
    if (!accountId) {
      setError("Please select an account")
      return
    }

    const ext = getExt(file)

    if (ext === ".xlsx" || ext === ".xls") {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer)
          const wb = XLSX.read(data, { type: "array", cellDates: true })
          const sheet = wb.Sheets[wb.SheetNames[0]]
          // cellDates: true → date cells become JS Date objects (avoids locale-format guessing)
          const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" })
          if (rows.length < 2) {
            setError("Spreadsheet is empty or has no data rows")
            return
          }
          // Use the row with the most non-empty cells in the first 10 rows as the header row
          // (bank exports have metadata preambles — the real header row is always the densest)
          let headerRowIdx = 0
          let maxNonEmpty = 0
          for (let i = 0; i < Math.min(rows.length - 1, 10); i++) {
            const nonEmpty = (rows[i] as unknown[]).filter((c) => String(c).trim() !== "").length
            if (nonEmpty > maxNonEmpty) { maxNonEmpty = nonEmpty; headerRowIdx = i }
          }
          const rawHeaders = (rows[headerRowIdx] as unknown[]).map(String)
          const validCols = rawHeaders
            .map((h, i) => ({ h: h.trim(), i }))
            .filter(({ h }) => h !== "")
          const headers = validCols.map((c) => c.h)
          const dataRows = (rows.slice(headerRowIdx + 1) as unknown[][]).map((row) => {
            const obj: Record<string, string> = {}
            validCols.forEach(({ h, i }) => {
              const val = row[i]
              if (val instanceof Date) {
                const yyyy = val.getFullYear()
                const mm = String(val.getMonth() + 1).padStart(2, "0")
                const dd = String(val.getDate()).padStart(2, "0")
                obj[h] = `${yyyy}-${mm}-${dd}`
              } else if (typeof val === "number") {
                // Numeric cells: convert to a string that matches the preset's decimal separator
                // so parseAmountStr handles them consistently with text amounts
                const s = String(val)
                obj[h] = preset.decimalSeparator === "," ? s.replace(".", ",") : s
              } else {
                obj[h] = val == null ? "" : String(val)
              }
            })
            return obj
          })
          const excelPreset = { ...preset }
          onNext({ headers, data: dataRows, preset: excelPreset, accountId })
        } catch {
          setError("Could not read spreadsheet. Make sure it is a valid Excel file.")
        }
      }
      reader.readAsArrayBuffer(file)
      return
    }

    // CSV / TSV / TXT — Papa Parse
    let delimiter = preset.delimiter
    if (ext === ".tsv") delimiter = "\t"
    else if (ext === ".txt") delimiter = "" // auto-detect

    Papa.parse<Record<string, string>>(file, {
      header: true,
      delimiter,
      skipEmptyLines: true,
      complete(results) {
        if (!results.data.length) {
          setError("File is empty or could not be parsed")
          return
        }
        const headers = results.meta.fields ?? []
        onNext({ headers, data: results.data, preset, accountId })
      },
      error(err) {
        setError(`Parse error: ${err.message}`)
      },
    })
  }

  if (!accounts.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Please{" "}
        <a href="/accounts" className="underline text-primary">
          create an account
        </a>{" "}
        before importing transactions.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
        {file ? (
          <p className="text-sm font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              .csv · .tsv · .txt · .xlsx · .xls
            </p>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Bank preset</label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        onClick={handleParse}
        disabled={!file}
        className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
      >
        Continue →
      </button>
    </div>
  )
}

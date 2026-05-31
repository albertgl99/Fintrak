"use client"

import { useRef, useState } from "react"
import type { DragEvent } from "react"
import Papa from "papaparse"
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
  const [presetId, setPresetId] = useState("santander")
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]

  function handleFile(f: File) {
    if (!f.name.endsWith(".csv") && f.type !== "text/csv") {
      setError("Please select a CSV file")
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
      setError("Please select a CSV file")
      return
    }
    if (!accountId) {
      setError("Please select an account")
      return
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      delimiter: preset.delimiter,
      skipEmptyLines: true,
      complete(results) {
        if (!results.data.length) {
          setError("CSV file is empty or could not be parsed")
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
          accept=".csv,text/csv"
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
              Drop your CSV file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">.csv files only</p>
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

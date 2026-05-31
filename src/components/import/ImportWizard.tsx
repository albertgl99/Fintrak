"use client"

import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"
import { StepUpload } from "./StepUpload"
import { StepMap } from "./StepMap"
import { StepPreview } from "./StepPreview"
import type { ColumnMapping, ParsedRow, Account } from "./types"
import type { Preset } from "./presets"
import { autoCategorize } from "./categorize"

type MinCategory = { id: string; name: string; type: string }

type Step1Data = {
  headers: string[]
  data: Record<string, string>[]
  preset: Preset
  accountId: string
}

type Step2Data = {
  rows: ParsedRow[]
  mapping: ColumnMapping
}

const STEP_LABELS = ["Upload", "Map columns", "Preview & import"]

export function ImportWizard() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<MinCategory[]>([])
  const [step, setStep] = useState(1)
  const [step1, setStep1] = useState<Step1Data | null>(null)
  const [step2, setStep2] = useState<Step2Data | null>(null)

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then(setAccounts)
      .catch(() => {})
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  async function handleStepMapNext(rows: ParsedRow[], mapping: ColumnMapping) {
    // Pass 1: keyword rules (instant)
    let categorized = autoCategorize(rows, categories)

    // Pass 2 (Gemini) — disabled for now, enable when GEMINI_API_KEY is set
    // const unmatched = categorized
    //   .map((r, i) => ({ r, i }))
    //   .filter(({ r }) => !r.parseError && !r.categoryId)
    //   .map(({ r, i }) => ({ index: i, description: r.description, type: r.type }))
    // if (unmatched.length && categories.length) {
    //   setCategorizing(true)
    //   try {
    //     const res = await fetch("/api/categorize", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ rows: unmatched, categories }),
    //     })
    //     const { suggestions } = await res.json()
    //     categorized = categorized.map((r, i) => {
    //       const s = (suggestions as { index: number; categoryId: string }[]).find(
    //         (s) => s.index === i
    //       )
    //       return s ? { ...r, categoryId: s.categoryId } : r
    //     })
    //   } catch { /* proceed with keyword-only results */ }
    //   setCategorizing(false)
    // }

    setStep2({ rows: categorized, mapping })
    setStep(3)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-1 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step >= n
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {n}
            </div>
            {n < 3 && (
              <div
                className={`h-px w-10 transition-colors ${
                  step > n ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
        <span className="ml-3 text-sm text-muted-foreground">
          {STEP_LABELS[step - 1]}
        </span>
      </div>

      {step === 1 && (
        <StepUpload
          accounts={accounts}
          onNext={(data) => {
            setStep1(data)
            setStep(2)
          }}
        />
      )}

      {step === 2 && step1 && (
        <StepMap
          headers={step1.headers}
          data={step1.data}
          preset={step1.preset}
          onNext={handleStepMapNext}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && step1 && step2 && (
        <StepPreview
          rows={step2.rows}
          accountId={step1.accountId}
          categories={categories}
          onBack={() => setStep(2)}
          onDone={() => router.push("/transactions")}
        />
      )}
    </div>
  )
}

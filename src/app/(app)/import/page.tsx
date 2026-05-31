import { ImportWizard } from "@/components/import/ImportWizard"

export default function ImportPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-1">Import transactions</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Import transactions from a bank CSV file
      </p>
      <ImportWizard />
    </div>
  )
}

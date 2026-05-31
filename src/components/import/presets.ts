export type Preset = {
  id: string
  name: string
  delimiter: string
  dateCol: string
  dateFormat: string
  descriptionCol: string
  amountCol: string
  decimalSeparator: "." | ","
}

export const PRESETS: Preset[] = [
  {
    id: "santander",
    name: "Santander",
    delimiter: ";",
    dateCol: "Fecha operación",
    dateFormat: "dd/MM/yyyy",
    descriptionCol: "Concepto",
    amountCol: "Importe",
    decimalSeparator: ",",
  },
  {
    id: "custom",
    name: "Custom / Other",
    delimiter: ",",
    dateCol: "",
    dateFormat: "yyyy-MM-dd",
    descriptionCol: "",
    amountCol: "",
    decimalSeparator: ".",
  },
]

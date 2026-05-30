"use client"

import dynamicIconImports from "lucide-react/dynamicIconImports"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { CATEGORY_ICONS } from "@/lib/validations/category"

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {CATEGORY_ICONS.map((iconName) => {
        const LucideIcon = dynamic(dynamicIconImports[iconName as keyof typeof dynamicIconImports])
        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onChange(iconName)}
            className={cn(
              "flex items-center justify-center size-8 rounded-md transition-colors",
              value === iconName
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            title={iconName}
          >
            <LucideIcon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

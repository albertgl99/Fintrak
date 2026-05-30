import { Circle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ICON_MAP } from "./icon-picker"

interface CategoryIconProps {
  name: string
  className?: string
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon: LucideIcon = ICON_MAP[name] ?? Circle
  return <Icon className={className} />
}

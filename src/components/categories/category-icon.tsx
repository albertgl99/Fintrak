import dynamic from "next/dynamic"
import dynamicIconImports from "lucide-react/dynamicIconImports"
import { Circle } from "lucide-react"

interface CategoryIconProps {
  name: string
  className?: string
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const iconKey = name as keyof typeof dynamicIconImports
  if (!dynamicIconImports[iconKey]) {
    return <Circle className={className} />
  }
  const Icon = dynamic(dynamicIconImports[iconKey])
  return <Icon className={className} />
}

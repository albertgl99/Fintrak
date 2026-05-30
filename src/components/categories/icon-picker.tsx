"use client"

import {
  Circle, ShoppingCart, Home, Car, Utensils, Heart,
  Briefcase, TrendingUp, TrendingDown, CreditCard, Gift,
  Plane, Book, Zap, Coffee, Music, Bus, Shirt,
  Baby, Dumbbell,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORY_ICONS } from "@/lib/validations/category"

export const ICON_MAP: Record<string, LucideIcon> = {
  "circle": Circle,
  "shopping-cart": ShoppingCart,
  "home": Home,
  "car": Car,
  "utensils": Utensils,
  "heart": Heart,
  "briefcase": Briefcase,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "credit-card": CreditCard,
  "gift": Gift,
  "plane": Plane,
  "book": Book,
  "zap": Zap,
  "coffee": Coffee,
  "music": Music,
  "bus": Bus,
  "shirt": Shirt,
  "baby": Baby,
  "dumbbell": Dumbbell,
}

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {CATEGORY_ICONS.map((iconName) => {
        const Icon = ICON_MAP[iconName] ?? Circle
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
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL! }),
})

const SYSTEM_CATEGORIES = [
  { name: "Groceries",       icon: "shopping-cart", color: "#10b981", type: "EXPENSE" },
  { name: "Restaurants",     icon: "utensils",       color: "#f59e0b", type: "EXPENSE" },
  { name: "Transport",       icon: "car",            color: "#64748b", type: "EXPENSE" },
  { name: "Shopping",        icon: "shirt",          color: "#3b82f6", type: "EXPENSE" },
  { name: "Health",          icon: "heart",          color: "#ef4444", type: "EXPENSE" },
  { name: "Utilities",       icon: "zap",            color: "#f97316", type: "EXPENSE" },
  { name: "Housing",         icon: "home",           color: "#84cc16", type: "EXPENSE" },
  { name: "Sports",          icon: "dumbbell",       color: "#06b6d4", type: "EXPENSE" },
  { name: "Subscriptions",   icon: "music",          color: "#ec4899", type: "EXPENSE" },
  { name: "Finance",         icon: "credit-card",    color: "#6b7280", type: "EXPENSE" },
  { name: "Entertainment",   icon: "coffee",         color: "#a855f7", type: "EXPENSE" },
  { name: "Salary",          icon: "briefcase",      color: "#6366f1", type: "INCOME"  },
  { name: "Other Income",    icon: "trending-up",    color: "#059669", type: "INCOME"  },
  { name: "Transfers",       icon: "circle",         color: "#94a3b8", type: "BOTH"    },
] as const

async function main() {
  console.log("Seeding system categories…")

  for (const cat of SYSTEM_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        // upsert by name among system categories
        // there's no unique constraint, so we check manually
        id: (
          await prisma.category.findFirst({
            where: { name: cat.name, userId: null },
            select: { id: true },
          })
        )?.id ?? "nonexistent",
      },
      update: { icon: cat.icon, color: cat.color },
      create: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        isDefault: true,
        userId: null,
      },
    })
    console.log(`  ✓ ${cat.name}`)
  }

  console.log("Done.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

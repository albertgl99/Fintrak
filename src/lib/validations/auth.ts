import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email" }),
  password: z.string().min(1, { error: "Password is required" }),
})

export const registerSchema = z.object({
  name: z.string().min(2, { error: "At least 2 characters" }).trim(),
  email: z.email({ error: "Invalid email" }).trim(),
  password: z.string().min(8, { error: "At least 8 characters" }).trim(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { loginSchema, registerSchema } from "@/lib/validations/auth"

export async function loginAction(formData: { email: string; password: string }) {
  const validated = loginSchema.safeParse(formData)
  if (!validated.success) {
    return { error: "Invalid data" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(validated.data)

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Please confirm your email before signing in" }
    }
    return { error: "Invalid email or password" }
  }

  redirect("/dashboard")
}

export async function registerAction(formData: {
  name: string
  email: string
  password: string
}) {
  const validated = registerSchema.safeParse(formData)
  if (!validated.success) {
    return { error: "Invalid data" }
  }

  const { name, email, password } = validated.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "This email is already registered" }
    }
    return { error: "Failed to create account" }
  }

  if (!data.user) {
    return { error: "Failed to create account" }
  }

  try {
    await prisma.user.create({
      data: { id: data.user.id, email, name },
    })
  } catch {
    // User record may already exist
  }

  redirect("/dashboard")
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

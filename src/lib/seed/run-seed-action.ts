"use server"

import { currentUser } from "@clerk/nextjs/server"
import { runInitialSeed } from "./initial-seed"

export async function runSeedIfNeeded(): Promise<{ seeded: boolean }> {
  const user = await currentUser()
  if (!user) return { seeded: false }

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? ""

  try {
    const result = await runInitialSeed(user.id, email)
    return result
  } catch (err) {
    console.error("[seed] failed:", err)
    return { seeded: false }
  }
}

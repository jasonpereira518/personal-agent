// Plain server utility — NOT a Server Action.
// Called from the dashboard layout (a Server Component) directly.
import { currentUser } from "@clerk/nextjs/server"
import { runInitialSeed } from "./initial-seed"

export async function runSeedIfNeeded(): Promise<{ seeded: boolean }> {
  try {
    const user = await currentUser()
    if (!user) return { seeded: false }

    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? ""

    const result = await runInitialSeed(user.id, email)
    if (result.seeded) {
      console.log(`[seed] seeded profile for ${user.id}`)
    }
    return result
  } catch (err) {
    // Log but never crash the layout render
    console.error("[seed] failed:", err)
    return { seeded: false }
  }
}

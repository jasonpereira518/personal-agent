"use client"

import { useEffect, useState } from "react"

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 17) return "Good afternoon"
  return "Good evening"
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function Greeting() {
  const [greeting, setGreeting] = useState("Good morning")
  const [dateStr, setDateStr] = useState("")

  useEffect(() => {
    const now = new Date()
    setGreeting(getGreeting(now.getHours()))
    setDateStr(formatDate(now))
  }, [])

  return (
    <div>
      <h1 className="font-medium text-xl">{greeting}, Jason</h1>
      {dateStr && (
        <p className="font-mono text-sm text-muted-foreground">{dateStr}</p>
      )}
    </div>
  )
}

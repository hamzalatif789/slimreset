import { NextResponse } from "next/server"

// In a real app, you'd use a database. For demo purposes, we'll use in-memory storage
let weightData = []

export async function POST(req) {
  try {
    const { weight, userId } = await req.json()

    if (!weight || !userId) {
      return NextResponse.json({ error: "Weight and userId are required" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Remove existing entry for today if it exists
    weightData = weightData.filter((entry) => !(entry.userId === userId && entry.date === today))

    // Add new entry
    weightData.push({
      weight: Number.parseFloat(weight),
      date: today,
      userId,
    })

    return NextResponse.json({ success: true, message: "Weight recorded successfully" })
  } catch (error) {
    console.error("Weight API error:", error)
    return NextResponse.json({ error: "Failed to record weight" }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const userWeightData = weightData
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ weightData: userWeightData })
  } catch (error) {
    console.error("Weight GET API error:", error)
    return NextResponse.json({ error: "Failed to get weight data" }, { status: 500 })
  }
}

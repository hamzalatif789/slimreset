import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    if (!type) {
      return NextResponse.json({ error: "Type parameter is required" }, { status: 400 })
    }

    const validTypes = [
      "food-intolerances",
      "nutrient-deficiencies",
      "toxins-metals",
      "slimreset-foods",
      "medical-profile",
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "public", "data", `${type}.json`)

    try {
      const fileContent = fs.readFileSync(filePath, "utf8")
      const data = JSON.parse(fileContent)
      return NextResponse.json(data)
    } catch (fileError) {
      return NextResponse.json({ error: `File not found: ${type}.json` }, { status: 404 })
    }
  } catch (error) {
    console.error("PDF Data API error:", error)
    return NextResponse.json({ error: "Failed to fetch PDF data" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { type, data } = await req.json()

    if (!type || !data) {
      return NextResponse.json({ error: "Type and data are required" }, { status: 400 })
    }

    const validTypes = [
      "food-intolerances",
      "nutrient-deficiencies",
      "toxins-metals",
      "slimreset-foods",
      "medical-profile",
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "public", "data", `${type}.json`)

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      return NextResponse.json({ success: true, message: `${type}.json updated successfully` })
    } catch (fileError) {
      return NextResponse.json({ error: `Failed to write file: ${type}.json` }, { status: 500 })
    }
  } catch (error) {
    console.error("PDF Data API error:", error)
    return NextResponse.json({ error: "Failed to update PDF data" }, { status: 500 })
  }
}

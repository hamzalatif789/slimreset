import { NextResponse } from "next/server"
import { PDFProcessor } from "@/lib/pdf-processor"

export async function POST(req) {
  try {
    const { query, category, limit = 10 } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const processor = new PDFProcessor()
    const results = await processor.searchInExtractedData(query, category)

    // Limit results
    const limitedResults = results.slice(0, limit)

    return NextResponse.json({
      query,
      category,
      results: limitedResults,
      totalFound: results.length,
    })
  } catch (error) {
    console.error("PDF search error:", error)
    return NextResponse.json(
      {
        error: "Failed to search PDF data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

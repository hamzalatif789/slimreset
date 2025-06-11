import { NextResponse } from "next/server"
import { PDFProcessor } from "@/lib/pdf-processor"
import fs from "fs"
import path from "path"

export async function POST(req) {
  try {
    const { fileName, category, forceReprocess = false } = await req.json()

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 })
    }

    const processor = new PDFProcessor()
    const extractedDataPath = path.join(
      process.cwd(),
      "public",
      "data",
      "extracted",
      `${fileName.replace(".pdf", "")}.json`,
    )

    // Check if already processed and not forcing reprocess
    if (!forceReprocess && fs.existsSync(extractedDataPath)) {
      const existingData = JSON.parse(fs.readFileSync(extractedDataPath, "utf8"))
      return NextResponse.json({
        message: "PDF already processed",
        data: existingData,
        fromCache: true,
      })
    }

    // Process the PDF
    const extractedData = await processor.processPDFFile(fileName, category)

    return NextResponse.json({
      message: "PDF processed successfully",
      data: extractedData,
      fromCache: false,
    })
  } catch (error) {
    console.error("PDF extraction error:", error)
    return NextResponse.json(
      {
        error: "Failed to extract PDF data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get("fileName")

    if (!fileName) {
      // Return list of all processed PDFs
      const indexPath = path.join(process.cwd(), "public", "data", "pdf-index.json")

      if (fs.existsSync(indexPath)) {
        const index = JSON.parse(fs.readFileSync(indexPath, "utf8"))
        return NextResponse.json({ index })
      } else {
        return NextResponse.json({ index: {} })
      }
    }

    // Return specific PDF data
    const extractedDataPath = path.join(
      process.cwd(),
      "public",
      "data",
      "extracted",
      `${fileName.replace(".pdf", "")}.json`,
    )

    if (!fs.existsSync(extractedDataPath)) {
      return NextResponse.json({ error: "PDF data not found" }, { status: 404 })
    }

    const data = JSON.parse(fs.readFileSync(extractedDataPath, "utf8"))
    return NextResponse.json({ data })
  } catch (error) {
    console.error("PDF retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve PDF data" }, { status: 500 })
  }
}

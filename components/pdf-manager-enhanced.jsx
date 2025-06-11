"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Search, RefreshCw, Eye, Database } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

export function PDFManagerEnhanced() {
  const [pdfIndex, setPdfIndex] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPDF, setSelectedPDF] = useState(null)

  const predefinedPDFs = [
    { fileName: "liliana-gut-dna-report.pdf", category: "medical-profile", title: "Complete Gut DNA Report" },
    { fileName: "food-intolerances-report.pdf", category: "food-intolerances", title: "Food Intolerances Analysis" },
    {
      fileName: "nutrient-deficiencies-report.pdf",
      category: "nutrient-deficiencies",
      title: "Nutrient Deficiencies Report",
    },
    { fileName: "toxins-metals-report.pdf", category: "toxins-metals", title: "Toxins & Metals Analysis" },
    { fileName: "slimreset-foods-guide.pdf", category: "food-guide", title: "SlimReset Food Guide" },
  ]

  useEffect(() => {
    loadPDFIndex()
  }, [])

  const loadPDFIndex = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/pdf-extract")
      if (response.ok) {
        const data = await response.json()
        setPdfIndex(data.index || {})
      }
    } catch (error) {
      console.error("Error loading PDF index:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const processPDF = async (fileName, category, forceReprocess = false) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/pdf-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, category, forceReprocess }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`PDF ${fileName} processed:`, data.fromCache ? "from cache" : "newly processed")
        await loadPDFIndex() // Refresh the index
      } else {
        const error = await response.json()
        console.error("Error processing PDF:", error)
      }
    } catch (error) {
      console.error("Error processing PDF:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchPDFs = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch("/api/pdf-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, limit: 10 }),
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      }
    } catch (error) {
      console.error("Error searching PDFs:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const viewPDFData = async (fileName) => {
    try {
      const response = await fetch(`/api/pdf-extract?fileName=${fileName}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedPDF(data.data)
      }
    } catch (error) {
      console.error("Error viewing PDF data:", error)
    }
  }

  const processAllPDFs = async () => {
    setIsLoading(true)
    for (const pdf of predefinedPDFs) {
      await processPDF(pdf.fileName, pdf.category)
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* PDF Processing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            PDF Data Extraction & Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Process All Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Extract and process all PDF files for AI analysis</p>
            <div className="flex gap-2">
              <Button onClick={processAllPDFs} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Process All PDFs
              </Button>
              <Button onClick={loadPDFIndex} variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Individual PDF Processing */}
          <div className="grid gap-3">
            {predefinedPDFs.map((pdf) => {
              const isProcessed = pdfIndex[pdf.fileName]
              return (
                <div key={pdf.fileName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">{pdf.title}</div>
                      <div className="text-xs text-gray-500">{pdf.fileName}</div>
                    </div>
                    {isProcessed && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Processed
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => processPDF(pdf.fileName, pdf.category)}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      {isProcessed ? "Reprocess" : "Process"}
                    </Button>
                    {isProcessed && (
                      <Button onClick={() => viewPDFData(pdf.fileName)} variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* PDF Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search PDF Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for foods, nutrients, symptoms, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPDFs()}
            />
            <Button onClick={searchPDFs} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Search Results ({searchResults.length})</h4>
              {searchResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{result.fileName}</div>
                    <Badge variant="outline">{result.category}</Badge>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{result.matchedContent.substring(0, 200)}...</div>
                  {result.relevantSections.length > 0 && (
                    <div className="text-xs">
                      <strong>Relevant sections:</strong> {result.relevantSections.map((s) => s.section).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Data Viewer */}
      {selectedPDF && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>PDF Data: {selectedPDF.fileName}</span>
              <Button onClick={() => setSelectedPDF(null)} variant="outline" size="sm">
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Category:</strong> {selectedPDF.category}
                </div>
                <div>
                  <strong>Pages:</strong> {selectedPDF.metadata?.pages}
                </div>
                <div>
                  <strong>Extracted:</strong> {new Date(selectedPDF.extractedAt).toLocaleDateString()}
                </div>
                <div>
                  <strong>File Size:</strong> {Math.round(selectedPDF.metadata?.fileSize / 1024)} KB
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Extracted Sections:</h4>
                <div className="max-h-64 overflow-y-auto bg-gray-50 p-3 rounded text-xs">
                  <pre>{JSON.stringify(selectedPDF.sections, null, 2)}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">📁 Setup Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>
              1. Create a <code>/public/pdfs/</code> folder in your project
            </li>
            <li>2. Add your PDF files to this folder</li>
            <li>3. Click "Process All PDFs" to extract and structure the data</li>
            <li>4. Use the search function to test content retrieval</li>
            <li>5. The AI chat will now reference PDF content in responses</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

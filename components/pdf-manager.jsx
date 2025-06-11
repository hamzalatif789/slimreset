"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye, Database, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

export function PDFManager() {
  const [pdfData, setPdfData] = useState({})
  const [activeFile, setActiveFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const pdfFiles = [
    {
      id: "food-intolerances",
      title: "Food Intolerances Report",
      description: "High and medium intolerance levels",
      icon: "🚫",
      color: "red",
    },
    {
      id: "nutrient-deficiencies",
      title: "Nutrient Deficiencies Report",
      description: "Optimal, fair, and low nutrient levels",
      icon: "💊",
      color: "blue",
    },
    {
      id: "toxins-metals",
      title: "Toxins & Metals Report",
      description: "Environmental exposure analysis",
      icon: "⚠️",
      color: "orange",
    },
    {
      id: "slimreset-foods",
      title: "SlimReset Food Lists",
      description: "Complete approved food database",
      icon: "🍽️",
      color: "green",
    },
    {
      id: "medical-profile",
      title: "Medical Profile",
      description: "Personal and medical information",
      icon: "🏥",
      color: "purple",
    },
  ]

  useEffect(() => {
    loadAllPDFData()
  }, [])

  const loadAllPDFData = async () => {
    setIsLoading(true)
    const data = {}

    for (const file of pdfFiles) {
      try {
        const response = await fetch(`/api/pdf-data?type=${file.id}`)
        if (response.ok) {
          data[file.id] = await response.json()
        }
      } catch (error) {
        console.error(`Error loading ${file.id}:`, error)
      }
    }

    setPdfData(data)
    setIsLoading(false)
  }

  const downloadPDFData = (fileId) => {
    const data = pdfData[fileId]
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${fileId}.json`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      red: "bg-red-50 border-red-200 text-red-800",
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
      green: "bg-green-50 border-green-200 text-green-800",
      purple: "bg-purple-50 border-purple-200 text-purple-800",
    }
    return colors[color] || "bg-gray-50 border-gray-200 text-gray-800"
  }

  const getDataSummary = (fileId) => {
    const data = pdfData[fileId]
    if (!data) return "No data loaded"

    switch (fileId) {
      case "food-intolerances":
        return `${data.high_intolerance?.length || 0} high, ${data.medium_intolerance?.length || 0} medium`
      case "nutrient-deficiencies":
        return `${data.low?.length || 0} low, ${data.fair?.length || 0} fair, ${data.optimal?.length || 0} optimal`
      case "toxins-metals":
        return `${data.high_traces?.length || 0} high, ${data.medium_traces?.length || 0} medium, ${data.low_traces?.length || 0} low`
      case "slimreset-foods":
        return `${data.rich_proteins?.length || 0} rich proteins, ${data.light_proteins?.length || 0} light proteins`
      case "medical-profile":
        return `${data.client_name || "Unknown"} - ${data.current_weight || "?"}→${data.goal_weight || "?"} lbs`
      default:
        return "Data available"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-purple-600" />
          PDF Data Manager
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Manage and view all PDF data files</p>
          <Button onClick={loadAllPDFData} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PDF Files Grid */}
        <div className="grid gap-3">
          {pdfFiles.map((file) => (
            <div key={file.id} className={`border rounded-lg p-4 ${getColorClasses(file.color)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{file.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm">{file.title}</h4>
                    <p className="text-xs opacity-80">{file.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => setActiveFile(activeFile === file.id ? null : file.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => downloadPDFData(file.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={!pdfData[file.id]}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="text-xs opacity-75 mb-2">
                <strong>Data:</strong> {getDataSummary(file.id)}
              </div>

              {/* Expanded Data View */}
              {activeFile === file.id && pdfData[file.id] && (
                <div className="mt-3 p-3 bg-white/50 rounded border">
                  <div className="max-h-48 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(pdfData[file.id], null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2 text-sm">📊 Data Summary</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-2 rounded">
              <div className="font-medium text-red-600">Food Restrictions</div>
              <div className="text-gray-600">
                {(pdfData["food-intolerances"]?.high_intolerance?.length || 0) +
                  (pdfData["food-intolerances"]?.medium_intolerance?.length || 0)}{" "}
                total
              </div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="font-medium text-blue-600">Nutrients Tracked</div>
              <div className="text-gray-600">
                {(pdfData["nutrient-deficiencies"]?.low?.length || 0) +
                  (pdfData["nutrient-deficiencies"]?.fair?.length || 0) +
                  (pdfData["nutrient-deficiencies"]?.optimal?.length || 0)}{" "}
                total
              </div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="font-medium text-green-600">Approved Foods</div>
              <div className="text-gray-600">
                {(pdfData["slimreset-foods"]?.rich_proteins?.length || 0) +
                  (pdfData["slimreset-foods"]?.light_proteins?.length || 0)}{" "}
                proteins
              </div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="font-medium text-purple-600">Weight Goal</div>
              <div className="text-gray-600">
                {pdfData["medical-profile"]?.current_weight || "?"} → {pdfData["medical-profile"]?.goal_weight || "?"}{" "}
                lbs
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">📁 File Locations:</p>
            <ul className="space-y-1 text-xs">
              <li>
                • <code>/public/data/food-intolerances.json</code>
              </li>
              <li>
                • <code>/public/data/nutrient-deficiencies.json</code>
              </li>
              <li>
                • <code>/public/data/toxins-metals.json</code>
              </li>
              <li>
                • <code>/public/data/slimreset-foods.json</code>
              </li>
              <li>
                • <code>/public/data/medical-profile.json</code>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

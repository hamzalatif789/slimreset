"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"
import { useState } from "react"

export function PDFViewer() {
  const [showPDF, setShowPDF] = useState(false)

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Your Gut DNA Report
        </CardTitle>
        <p className="text-sm text-gray-600">Liliana's complete analysis report</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-purple-800">SlimReset Gut DNA Report</h4>
              <p className="text-sm text-purple-600">Complete personalized analysis</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-purple-700">Liliana Kostic</div>
              <div className="text-xs text-purple-600">Generated: March 31, 2025</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-red-600">High Intolerances</div>
              <div className="text-xs text-gray-600">25 foods to avoid</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-yellow-600">Medium Intolerances</div>
              <div className="text-xs text-gray-600">12 foods - caution</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-red-600">Priority Deficiencies</div>
              <div className="text-xs text-gray-600">3 nutrients low</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-orange-600">Toxin Levels</div>
              <div className="text-xs text-gray-600">Mercury high</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowPDF(!showPDF)} className="flex-1 bg-purple-600 hover:bg-purple-700" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              {showPDF ? "Hide Report" : "View Report"}
            </Button>
            <Button
              onClick={() => {
                // Download the PDF
                const link = document.createElement("a")
                link.href = "/liliana-gut-dna-report.pdf"
                link.download = "Liliana-Kostic-Gut-DNA-Report.pdf"
                link.click()
              }}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {showPDF && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 text-center text-sm text-gray-600">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">PDF Report Viewer</p>
              <p className="text-xs">To view the complete report, please add the PDF file to the public folder</p>
              <div className="mt-2 text-xs bg-blue-50 p-2 rounded border">
                <strong>File location:</strong> /public/liliana-gut-dna-report.pdf
              </div>
            </div>

            {/* This would show the actual PDF when the file is added */}
            <div className="h-96 bg-white border-t">
              <iframe
                src="/liliana-gut-dna-report.pdf"
                className="w-full h-full"
                title="Gut DNA Report"
                onError={() => {
                  console.log("PDF not found - please add the file to public folder")
                }}
              />
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">📋 Report Includes:</p>
            <ul className="space-y-1 text-xs">
              <li>• Complete food intolerance analysis</li>
              <li>• Nutrient deficiency assessment</li>
              <li>• Toxin & metal level testing</li>
              <li>• Personalized SlimReset food lists</li>
              <li>• HCG protocol prescription details</li>
              <li>• Medical history & recommendations</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

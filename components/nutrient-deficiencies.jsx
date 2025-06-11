"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Pill } from "lucide-react"

const NUTRIENT_DATA = {
  optimal: [
    { name: "Vitamin E", level: "optimal", description: "Antioxidant protection" },
    { name: "Omega 3", level: "optimal", description: "Heart & brain health" },
    { name: "Vitamin C", level: "optimal", description: "Immune support" },
    { name: "Omega 6", level: "optimal", description: "Essential fatty acid" },
    { name: "Carnitine", level: "optimal", description: "Fat metabolism" },
  ],
  fair: [
    { name: "Meso-Inositol", level: "fair", description: "Insulin sensitivity" },
    { name: "Zinc", level: "fair", description: "Immune function" },
    { name: "Omega 9", level: "fair", description: "Heart health" },
    { name: "Vitamin D3", level: "fair", description: "Bone health" },
  ],
  low: [
    { name: "Vitamin A", level: "low", description: "Vision & immune health", priority: "high" },
    { name: "Magnesium", level: "low", description: "Muscle & nerve function", priority: "high" },
    { name: "Potassium", level: "low", description: "Heart & muscle function", priority: "high" },
  ],
}

const TOXIN_DATA = {
  high: [{ name: "Mercury (Hg)", level: "high", source: "Fish consumption", action: "Limit high-mercury fish" }],
  medium: [{ name: "Sodium (Na)", level: "medium", source: "Diet", action: "Reduce processed foods" }],
  low: [
    { name: "Beryllium (Be)", level: "low", source: "Environment", action: "Monitor" },
    { name: "Platinum (Pt)", level: "low", source: "Environment", action: "Monitor" },
  ],
}

export function NutrientDeficiencies() {
  const getLevelIcon = (level) => {
    switch (level) {
      case "optimal":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "fair":
        return <Minus className="h-4 w-4 text-yellow-500" />
      case "low":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case "optimal":
        return "bg-green-100 text-green-800 border-green-200"
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Nutrient Deficiencies */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            Nutrient Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">Based on your gut DNA report</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Priority Deficiencies */}
          <div>
            <h4 className="font-semibold text-red-700 mb-2 text-sm">🚨 Priority Deficiencies</h4>
            <div className="space-y-2">
              {NUTRIENT_DATA.low.map((nutrient, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(nutrient.level)}
                      <span className="font-medium text-sm">{nutrient.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getLevelColor(nutrient.level)}`}>
                      Low
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{nutrient.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fair Levels */}
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2 text-sm">⚠️ Monitor Closely</h4>
            <div className="space-y-2">
              {NUTRIENT_DATA.fair.map((nutrient, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(nutrient.level)}
                      <span className="font-medium text-sm">{nutrient.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getLevelColor(nutrient.level)}`}>
                      Fair
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{nutrient.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optimal Levels */}
          <div>
            <h4 className="font-semibold text-green-700 mb-2 text-sm">✅ Optimal Levels</h4>
            <div className="grid grid-cols-1 gap-1">
              {NUTRIENT_DATA.optimal.map((nutrient, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded text-xs">
                  <span className="font-medium">{nutrient.name}</span>
                  <Badge variant="outline" className={`text-xs ${getLevelColor(nutrient.level)}`}>
                    Optimal
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toxins & Metals */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            Toxins & Metals
          </CardTitle>
          <p className="text-sm text-gray-600">Environmental exposure analysis</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* High Toxins */}
          {TOXIN_DATA.high.map((toxin, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{toxin.name}</span>
                <Badge variant="outline" className={`text-xs ${getLevelColor(toxin.level)}`}>
                  High
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                <strong>Source:</strong> {toxin.source}
              </p>
              <p className="text-xs text-red-700 bg-red-100 p-1 rounded">
                <strong>Action:</strong> {toxin.action}
              </p>
            </div>
          ))}

          {/* Medium & Low Toxins */}
          <div className="space-y-2">
            {[...TOXIN_DATA.medium, ...TOXIN_DATA.low].map((toxin, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                <div>
                  <span className="font-medium">{toxin.name}</span>
                  <span className="text-gray-500 ml-2">({toxin.source})</span>
                </div>
                <Badge variant="outline" className={`text-xs ${getLevelColor(toxin.level)}`}>
                  {toxin.level}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

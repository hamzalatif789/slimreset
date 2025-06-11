"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const SAMPLE_SUGGESTIONS = [
  {
    name: "Skinless Chicken Breast",
    category: "protein",
    calories: 165,
    protein: 31,
    status: "approved",
  },
  {
    name: "Cod Fish",
    category: "protein",
    calories: 105,
    protein: 18,
    status: "approved",
  },
  {
    name: "Asparagus",
    category: "vegetable",
    calories: 27,
    protein: 3,
    status: "approved",
  },
  {
    name: "Spinach",
    category: "vegetable",
    calories: 23,
    protein: 3,
    status: "avoid",
    reason: "High intolerance detected in your gut analysis",
  },
  {
    name: "Bell Peppers",
    category: "vegetable",
    calories: 30,
    protein: 1,
    status: "caution",
    reason: "Medium intolerance - consume in small amounts",
  },
  {
    name: "Apple",
    category: "fruit",
    calories: 52,
    protein: 0.3,
    status: "approved",
  },
]

export function MealSuggestions() {
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "caution":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "avoid":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "caution":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "avoid":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Personalized Food Guide</CardTitle>
        <p className="text-sm text-gray-600">Based on your gut analysis</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {SAMPLE_SUGGESTIONS.map((food, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(food.status)}
                  <span className="font-medium text-sm">{food.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {food.category}
                </Badge>
              </div>

              <div className="flex gap-4 text-xs text-gray-600">
                <span>{food.calories} cal</span>
                <span>{food.protein}g protein</span>
              </div>

              <Badge variant="outline" className={`text-xs ${getStatusColor(food.status)}`}>
                {food.status.charAt(0).toUpperCase() + food.status.slice(1)}
              </Badge>

              {food.reason && <p className="text-xs text-gray-500 italic">{food.reason}</p>}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Remember:</strong> Stick to approved foods for optimal results on your SlimReset journey!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

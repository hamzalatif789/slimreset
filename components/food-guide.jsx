"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, ChefHat } from "lucide-react"
import { useState } from "react"

const FOOD_DATA = {
  lightProtein: [
    { name: "Egg Whites", protein: 13, calories: 63, serving: "0.5 cup", status: "approved" },
    { name: "Cod", protein: 18, calories: 105, serving: "3.5 oz", status: "approved" },
    { name: "Haddock", protein: 20, calories: 90, serving: "3.5 oz", status: "caution", reason: "Medium intolerance" },
    { name: "Halibut", protein: 22, calories: 111, serving: "3.5 oz", status: "approved" },
    { name: "Shrimp", protein: 24, calories: 99, serving: "3.5 oz", status: "avoid", reason: "High intolerance" },
    { name: "Tilapia", protein: 20, calories: 90, serving: "3.5 oz", status: "avoid", reason: "High intolerance" },
  ],
  richProtein: [
    { name: "Skinless Chicken Breast", protein: 31, calories: 165, serving: "3.5 oz", status: "approved" },
    { name: "Lean Ground Turkey", protein: 27, calories: 189, serving: "3.5 oz", status: "approved" },
    {
      name: "Lean Ground Beef",
      protein: 26,
      calories: 250,
      serving: "3.5 oz",
      status: "caution",
      reason: "Medium intolerance",
    },
    { name: "Bison", protein: 28, calories: 146, serving: "3.5 oz", status: "approved" },
  ],
  vegetables: [
    { name: "Asparagus", protein: 2.95, calories: 27, serving: "1 cup", status: "approved", gas: false },
    {
      name: "Bell Peppers",
      protein: 1.18,
      calories: 30,
      serving: "1 cup",
      status: "caution",
      reason: "Medium intolerance",
      gas: false,
    },
    {
      name: "Spinach",
      protein: 0.9,
      calories: 7,
      serving: "1 cup",
      status: "avoid",
      reason: "High intolerance",
      gas: false,
    },
    { name: "Broccoli", protein: 2.57, calories: 31, serving: "1 cup", status: "approved", gas: true },
    {
      name: "Cauliflower",
      protein: 2,
      calories: 25,
      serving: "1 cup",
      status: "avoid",
      reason: "High intolerance",
      gas: true,
    },
    { name: "Zucchini", protein: 1.37, calories: 17, serving: "1 cup", status: "approved", gas: false },
  ],
  fruits: [
    { name: "Apples", protein: 0.3, calories: 52, serving: "1 small", status: "approved" },
    { name: "Berries", protein: 1.4, calories: 43, serving: "2/3 cup", status: "approved" },
    { name: "Banana", protein: 1.1, calories: 89, serving: "1 medium", status: "avoid", reason: "High intolerance" },
    { name: "Grapefruit", protein: 0.8, calories: 42, serving: "1/2 medium", status: "approved" },
  ],
}

export function FoodGuide() {
  const [activeCategory, setActiveCategory] = useState("lightProtein")

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

  const categories = [
    { id: "lightProtein", label: "Light Protein", icon: "🐟" },
    { id: "richProtein", label: "Rich Protein", icon: "🍗" },
    { id: "vegetables", label: "Vegetables", icon: "🥬" },
    { id: "fruits", label: "Fruits", icon: "🍎" },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-purple-600" />
          Personalized Food Guide
        </CardTitle>
        <p className="text-sm text-gray-600">Based on Liliana's gut DNA analysis</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-2 text-xs font-medium rounded-lg border transition-colors ${
                activeCategory === category.id
                  ? "bg-purple-100 text-purple-700 border-purple-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{category.icon}</span>
                <span>{category.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Food Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {FOOD_DATA[activeCategory]?.map((food, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(food.status)}
                  <span className="font-medium text-sm">{food.name}</span>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusColor(food.status)}`}>
                  {food.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Serving:</span> {food.serving}
                </div>
                <div>
                  <span className="font-medium">Calories:</span> {food.calories}
                </div>
                <div>
                  <span className="font-medium">Protein:</span> {food.protein}g
                </div>
                {food.gas !== undefined && (
                  <div>
                    <span className="font-medium">Gas:</span> {food.gas ? "Yes" : "No"}
                  </div>
                )}
              </div>

              {food.reason && <p className="text-xs text-red-600 italic bg-red-50 p-2 rounded">{food.reason}</p>}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span>Caution</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>Avoid</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

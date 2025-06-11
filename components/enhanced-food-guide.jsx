"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, ChefHat, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

export function EnhancedFoodGuide() {
  const [foodData, setFoodData] = useState(null)
  const [intoleranceData, setIntoleranceData] = useState(null)
  const [activeCategory, setActiveCategory] = useState("rich_proteins")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFoodData()
  }, [])

  const loadFoodData = async () => {
    try {
      const [foodResponse, intoleranceResponse] = await Promise.all([
        fetch("/api/pdf-data?type=slimreset-foods"),
        fetch("/api/pdf-data?type=food-intolerances"),
      ])

      if (foodResponse.ok && intoleranceResponse.ok) {
        const foodData = await foodResponse.json()
        const intoleranceData = await intoleranceResponse.json()
        setFoodData(foodData)
        setIntoleranceData(intoleranceData)
      }
    } catch (error) {
      console.error("Error loading food data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFoodStatus = (foodName) => {
    if (!intoleranceData) return "approved"

    const name = foodName.toLowerCase()

    // Check high intolerances
    const highMatch = intoleranceData.high_intolerance?.find(
      (item) => name.includes(item.toLowerCase()) || item.toLowerCase().includes(name),
    )
    if (highMatch) return "avoid"

    // Check medium intolerances
    const mediumMatch = intoleranceData.medium_intolerance?.find(
      (item) => name.includes(item.toLowerCase()) || item.toLowerCase().includes(name),
    )
    if (mediumMatch) return "caution"

    return "approved"
  }

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

  const getIntoleranceReason = (foodName) => {
    if (!intoleranceData) return null

    const name = foodName.toLowerCase()

    const highMatch = intoleranceData.high_intolerance?.find(
      (item) => name.includes(item.toLowerCase()) || item.toLowerCase().includes(name),
    )
    if (highMatch) return `High intolerance to ${highMatch}`

    const mediumMatch = intoleranceData.medium_intolerance?.find(
      (item) => name.includes(item.toLowerCase()) || item.toLowerCase().includes(name),
    )
    if (mediumMatch) return `Medium intolerance to ${mediumMatch}`

    return null
  }

  const categories = [
    { id: "rich_proteins", label: "Rich Proteins", icon: "🥩" },
    { id: "light_proteins", label: "Light Proteins", icon: "🐟" },
    { id: "leafy_greens", label: "Leafy Greens", icon: "🥬" },
    { id: "vegetables", label: "Vegetables", icon: "🥕" },
    { id: "fruits", label: "Fruits", icon: "🍎" },
    { id: "spices", label: "Spices", icon: "🌿" },
  ]

  const filterFoods = (foods) => {
    if (!searchTerm) return foods
    return foods.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading food data...</p>
        </CardContent>
      </Card>
    )
  }

  if (!foodData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Failed to load food data</p>
          <Button onClick={loadFoodData} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentFoods = foodData[activeCategory] || []
  const filteredFoods = filterFoods(currentFoods)

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-purple-600" />
          Enhanced Food Guide
        </CardTitle>
        <p className="text-sm text-gray-600">Based on your gut DNA analysis with real-time intolerance checking</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

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
          {filteredFoods.map((food, index) => {
            const status = getFoodStatus(food.name)
            const reason = getIntoleranceReason(food.name)

            return (
              <div key={index} className="border rounded-lg p-3 space-y-2 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(status)}
                    <span className="font-medium text-sm">{food.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
                    {status}
                  </Badge>
                </div>

                {/* Nutritional Info */}
                {food.servings && food.servings.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <div className="font-medium mb-1">Serving Options:</div>
                    {food.servings.slice(0, 2).map((serving, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {serving.portion} ({serving.weight})
                        </span>
                        <span>
                          {serving.protein}g protein, {serving.calories} cal
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simple nutritional info for other categories */}
                {food.calories && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Calories:</span> {food.calories}
                    </div>
                    <div>
                      <span className="font-medium">Protein:</span> {food.protein}g
                    </div>
                  </div>
                )}

                {/* Gas warning for vegetables */}
                {food.gas !== undefined && (
                  <div className="text-xs">
                    <span className="font-medium text-gray-600">Gas:</span>
                    <span className={food.gas ? "text-yellow-600" : "text-green-600"}>
                      {food.gas ? " May cause gas" : " No gas"}
                    </span>
                  </div>
                )}

                {/* Flavor info for leafy greens */}
                {food.flavor && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Flavor:</span> {food.flavor}
                  </div>
                )}

                {/* Intolerance warning */}
                {reason && (
                  <p className="text-xs text-red-600 italic bg-red-50 p-2 rounded border border-red-200">⚠️ {reason}</p>
                )}
              </div>
            )
          })}
        </div>

        {filteredFoods.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No foods found matching "{searchTerm}"</p>
          </div>
        )}

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

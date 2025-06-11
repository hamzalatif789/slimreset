"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Utensils } from "lucide-react"

const SAMPLE_MEAL_PLAN = {
  breakfast: {
    protein: "Egg Whites (1 cup)",
    vegetables: "Asparagus (2 cups)",
    calories: 153,
    proteinG: 26,
  },
  lunch: {
    protein: "Skinless Chicken Breast (5.25 oz)",
    vegetables: "Mixed Greens (2 cups)",
    calories: 264,
    proteinG: 47,
  },
  dinner: {
    protein: "Cod Fish (5.25 oz)",
    vegetables: "Zucchini (2 cups)",
    calories: 192,
    proteinG: 27,
  },
  snack: {
    fruit: "Apple (1 small)",
    calories: 52,
    proteinG: 0.3,
  },
}

export function MealPlanner() {
  const totalCalories = Object.values(SAMPLE_MEAL_PLAN).reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = Object.values(SAMPLE_MEAL_PLAN).reduce((sum, meal) => sum + meal.proteinG, 0)

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "🌅"
      case "lunch":
        return "☀️"
      case "dinner":
        return "🌙"
      case "snack":
        return "🍎"
      default:
        return "🍽️"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Today's Meal Plan
        </CardTitle>
        <p className="text-sm text-gray-600">Personalized for your gut health</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{totalCalories}</div>
              <div className="text-xs text-gray-600">Total Calories</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{totalProtein.toFixed(1)}g</div>
              <div className="text-xs text-gray-600">Total Protein</div>
            </div>
          </div>
          <div className="mt-2 text-center">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
              Within 800-cal target
            </Badge>
          </div>
        </div>

        {/* Meal Schedule */}
        <div className="space-y-3">
          {Object.entries(SAMPLE_MEAL_PLAN).map(([mealType, meal]) => (
            <div key={mealType} className="border rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMealIcon(mealType)}</span>
                  <span className="font-medium text-sm capitalize">{mealType}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {mealType === "breakfast"
                      ? "7:00 AM"
                      : mealType === "lunch"
                        ? "12:00 PM"
                        : mealType === "dinner"
                          ? "6:00 PM"
                          : "3:00 PM"}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                {meal.protein && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-medium">{meal.protein}</span>
                  </div>
                )}
                {meal.vegetables && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vegetables:</span>
                    <span className="font-medium">{meal.vegetables}</span>
                  </div>
                )}
                {meal.fruit && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fruit:</span>
                    <span className="font-medium">{meal.fruit}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-600">
                  <strong>{meal.calories} cal</strong>
                </span>
                <span className="text-gray-600">
                  <strong>{meal.proteinG}g protein</strong>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Utensils className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">💡 Meal Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Drink water 30 min before meals</li>
                <li>• Avoid foods marked as high intolerance</li>
                <li>• Take HCG cream as prescribed</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

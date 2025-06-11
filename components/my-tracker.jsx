"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useState } from "react"

export function MyTracker() {
  const [currentDate, setCurrentDate] = useState(new Date("2025-06-03"))

  // Daily goals matching the image exactly
  const dailyGoals = {
    calories: { current: 0, target: 800, unit: "Kal" },
    protein: { current: 0, target: 11, unit: "oz" },
    water: { current: 0, target: 12, unit: "cups" },
    bowelMovements: { current: 0, target: 2, unit: "bm" },
  }

  // Weight data matching the image
  const weightData = {
    current: 0,
    goal: 86,
    lost: 97,
    toGo: 12,
    daysToGo: 0,
  }

  // Weekly data exactly as shown in image
  const weeklyData = [
    { day: "03", date: "Tue", weight: "-", loss: "-", protein: "0.00", calories: "0.00" },
    { day: "02", date: "Mon", weight: "-", loss: "-", protein: "0.00", calories: "0.00" },
    { day: "01", date: "Sun", weight: "-", loss: "-", protein: "0.00", calories: "0.00" },
    { day: "31", date: "Sat", weight: "98", loss: "-", protein: "0.00", calories: "0.00" },
    { day: "30", date: "Fri", weight: "-", loss: "98 ↓", protein: "0.00", calories: "0.00" },
  ]

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
  }

  const getLeftAmount = (current, target, unit) => {
    const left = target - current
    return `${left} ${unit} left`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Section - Daily Tracking */}
          <div className="xl:col-span-2 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-light text-gray-600 mb-6">let's track your day</h1>
            </div>

            {/* Daily Goals Cards - Exact match to image */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-white">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Calories</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {dailyGoals.calories.current} {dailyGoals.calories.unit}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    of {dailyGoals.calories.target} {dailyGoals.calories.unit}
                  </div>
                  <div className="text-sm font-medium text-red-500">
                    {getLeftAmount(dailyGoals.calories.current, dailyGoals.calories.target, dailyGoals.calories.unit)}
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-white">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Protein</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {dailyGoals.protein.current} {dailyGoals.protein.unit}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    of {dailyGoals.protein.target} {dailyGoals.protein.unit}
                  </div>
                  <div className="text-sm font-medium text-red-500">
                    {getLeftAmount(dailyGoals.protein.current, dailyGoals.protein.target, dailyGoals.protein.unit)}
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-white">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Water</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {dailyGoals.water.current} {dailyGoals.water.unit}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    of {dailyGoals.water.target} {dailyGoals.water.unit}
                  </div>
                  <div className="text-sm font-medium text-red-500">
                    {getLeftAmount(dailyGoals.water.current, dailyGoals.water.target, dailyGoals.water.unit)}
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-white">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">bowel Movements</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {dailyGoals.bowelMovements.current} {dailyGoals.bowelMovements.unit}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    of {dailyGoals.bowelMovements.target} {dailyGoals.bowelMovements.unit}
                  </div>
                  <div className="text-sm font-medium text-red-500">
                    {getLeftAmount(
                      dailyGoals.bowelMovements.current,
                      dailyGoals.bowelMovements.target,
                      dailyGoals.bowelMovements.unit,
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-4 py-6">
              <Button variant="ghost" size="sm" onClick={() => navigateDate(-1)} className="p-2">
                <ChevronLeft className="h-5 w-5 text-purple-500" />
              </Button>
              <div className="flex items-center gap-2 text-lg font-normal text-gray-600">
                <span className="text-purple-500">🎁</span>
                {formatDate(currentDate)}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigateDate(1)} className="p-2">
                <ChevronRight className="h-5 w-5 text-purple-500" />
              </Button>
            </div>

            {/* Meal Sections */}
            <div className="space-y-8">
              {/* Breakfast */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-xl font-light text-purple-600">breakfast</h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">#</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">food name</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">food quantity</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">calories</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">protein</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">fat</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-gray-400">
                            <div className="flex flex-col items-center">
                              <Plus className="h-8 w-8 mb-2 opacity-50" />
                              <p className="text-sm">No breakfast items added yet</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Lunch */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-xl font-light text-purple-600">lunch</h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">#</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">food name</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">food quantity</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">calories</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">protein</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">fat</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-gray-400">
                            <div className="flex flex-col items-center">
                              <Plus className="h-8 w-8 mb-2 opacity-50" />
                              <p className="text-sm">No lunch items added yet</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Weight Tracker */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 sticky top-6">
              <div className="text-center p-4 border-b border-gray-200">
                <h2 className="text-xl font-light text-gray-600">weight tracker</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Current Weight Display */}
                <div className="text-center">
                  <div className="text-5xl font-light text-purple-500 mb-2">{weightData.current}lbs</div>
                  <div className="text-sm text-gray-400">{weightData.goal}lbs goal weight</div>
                </div>

                {/* Weight Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-medium text-gray-900">-{weightData.lost}lbs</div>
                    <div className="text-xs text-gray-500">lost</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900">{weightData.toGo}lbs</div>
                    <div className="text-xs text-gray-500">to go</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900">{weightData.daysToGo}d</div>
                    <div className="text-xs text-gray-500">to go</div>
                  </div>
                </div>

                {/* Weekly Data Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-500 border-b pb-2">
                    <div className="text-center">days</div>
                    <div className="text-center">weight</div>
                    <div className="text-center">loss</div>
                    <div className="text-center">protein</div>
                    <div className="text-center">calories</div>
                  </div>

                  {weeklyData.map((day, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 text-xs py-2 border-b border-gray-100">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{day.day}</div>
                        <div className="text-gray-400">{day.date}</div>
                      </div>
                      <div className="text-center font-medium text-gray-900">{day.weight}</div>
                      <div className="text-center font-medium text-gray-900">{day.loss}</div>
                      <div className="text-center text-gray-600">{day.protein}</div>
                      <div className="text-center text-gray-600">{day.calories}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

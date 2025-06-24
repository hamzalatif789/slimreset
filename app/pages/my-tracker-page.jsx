"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react'
import { useState, useEffect } from "react"
import { fetchWeightData, fetchCaloriesData, fetchMealData } from "@/lib/api-client"

export default function MyTrackerPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [healthData, setHealthData] = useState({
    meals: [],
    weight: [],
    calories: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        const [mealsData, weightData, caloriesData] = await Promise.all([
          fetchMealData(),
          fetchWeightData(),
          fetchCaloriesData(),
        ])

        setHealthData({
          meals: mealsData.map((meal, index) => ({
            id: `${meal.foodId}_${index}`, // Unique ID per meal instance
            quantity: meal.amount,
            meal_type: meal.type,
            calories: Number.parseFloat(meal.calories),
            protein: Number.parseFloat(meal.protein),
            fat: Number.parseFloat(meal.totalFat),
            carbs: Number.parseFloat(meal.carbs),
            fiber: Number.parseFloat(meal.fiber),
            sugar: Number.parseFloat(meal.sugars),
            sodium: Number.parseFloat(meal.sodium),
            edamamEnriched: true,
            timestamp: meal.createdAt,
            foodId: meal.foodId,
            label: meal.label,
          })),
          weight: weightData.map((entry) => ({
            value: entry.weight,
            unit: "kg",
            timestamp: entry.createdAt,
            date: new Date(entry.createdAt).toLocaleDateString(),
          })),
          calories: caloriesData.map((entry) => ({
            value: entry.calories,
            type: "burned",
            timestamp: entry.createdAt,
            date: new Date(entry.createdAt).toLocaleDateString(),
          })),
        })
      } catch (error) {
        console.error("❌ error loading initial data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // get current date's data
  const getCurrentDateData = () => {
    const currentDateStr = currentDate.toLocaleDateString()

    // get today's calories from meals
    const todaysMeals = healthData.meals.filter((meal) => {
      const mealDate = new Date(meal.timestamp).toLocaleDateString()
      return mealDate === currentDateStr
    })

    const totalCaloriesFromMeals = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0)

    // get today's burned calories
    const todaysCaloriesBurned = healthData.calories.filter((entry) => {
      const entryDate = new Date(entry.timestamp).toLocaleDateString()
      return entryDate === currentDateStr
    })

    const totalCaloriesBurned = todaysCaloriesBurned.reduce((sum, entry) => sum + entry.value, 0)

    // get today's protein
    const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0)

    return {
      calories: totalCaloriesFromMeals,
      caloriesBurned: totalCaloriesBurned,
      protein: totalProtein,
      caloriesBurnedEntries: todaysCaloriesBurned,
    }
  }

  const currentDayData = getCurrentDateData()

  // daily goals with real-time data
  const dailyGoals = {
    calories: {
      current: Math.round(currentDayData.calories),
      target: 800,
      unit: "kcal",
      color: "bg-blue-500",
    },
    protein: {
      current: Math.round(currentDayData.protein),
      target: 11,
      unit: "g",
      color: "bg-green-500",
    },
    water: {
      current: 0,
      target: 12,
      unit: "cups",
      color: "bg-cyan-500",
    },
    bowelMovements: {
      current: 0,
      target: 2,
      unit: "bm",
      color: "bg-purple-500",
    },
  }

  // weight data with date-specific weight display
  const getWeightData = () => {
    if (healthData.weight.length === 0) {
      return {
        current: 0,
        goal: 86,
        lost: 0,
        toGo: 0,
        daysToGo: 0,
        hasData: false,
        currentWeight: null,
        hasWeightForDate: false,
        weightChange: { value: 0, isLoss: null },
      }
    }

    // sort weights by date (oldest first)
    const sortedWeights = [...healthData.weight].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // get weight for the selected date
    const currentDateStr = currentDate.toLocaleDateString()
    const currentDateWeight = healthData.weight.find(
      (w) => new Date(w.timestamp).toLocaleDateString() === currentDateStr,
    )

    const goalWeight = 86

    // if we have weight for the selected date, use it for display
    if (currentDateWeight) {
      const oldestWeight = sortedWeights[0]
      const weightLost = oldestWeight.value - currentDateWeight.value
      const weightToGo = goalWeight - currentDateWeight.value

      const isLoss = weightLost > 0
      const changeValue = Math.abs(weightLost)

      return {
        current: Math.round(currentDateWeight.value * 2.20462),
        goal: Math.round(goalWeight * 2.20462),
        lost: Math.round(weightLost * 2.20462),
        toGo: Math.round(weightToGo * 2.20462),
        daysToGo: 0,
        hasData: true,
        currentWeight: currentDateWeight,
        hasWeightForDate: true,
        weightChange: {
          value: Math.round(changeValue * 2.20462),
          isLoss: isLoss,
        },
      }
    }

    return {
      current: 0,
      goal: Math.round(goalWeight * 2.20462),
      lost: 0,
      toGo: 0,
      daysToGo: 30,
      hasData: false,
      currentWeight: null,
      hasWeightForDate: false,
      mostRecentWeight: sortedWeights[sortedWeights.length - 1],
      weightChange: { value: 0, isLoss: null },
    }
  }

  const weightData = getWeightData()

  // weekly data with real-time data - FIXED VERSION
  const getWeeklyData = () => {
    if (healthData.weight.length === 0) {
      return []
    }

    // sort all weights by date for proper comparison
    const sortedWeights = [...healthData.weight].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // get last 5 days of data relative to current selected date
    const last5Days = []
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString()

      // find weight for this date
      const dayWeight = healthData.weight.find((w) => new Date(w.timestamp).toLocaleDateString() === dateStr)

      // find meals for this date
      const dayMeals = healthData.meals.filter((meal) => new Date(meal.timestamp).toLocaleDateString() === dateStr)

      const dayCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0)
      const dayProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0)

      // calculate weight loss compared to previous day (chronologically)
      let weightChangeData = { value: 0, isLoss: null, display: "-" }
      
      if (dayWeight) {
        // find the previous weight entry chronologically (not by date navigation)
        const currentWeightIndex = sortedWeights.findIndex(w => w.timestamp === dayWeight.timestamp)
        const prevWeight = currentWeightIndex > 0 ? sortedWeights[currentWeightIndex - 1] : null
        
        if (prevWeight) {
          const change = (prevWeight.value - dayWeight.value) * 2.20462 // convert to lbs
          const roundedChange = Math.round(change * 10) / 10 // round to 1 decimal place
          
          if (roundedChange > 0) {
            weightChangeData = { 
              value: Math.abs(roundedChange), 
              isLoss: true, 
              display: `${Math.abs(roundedChange).toFixed(1)}` 
            }
          } else if (roundedChange < 0) {
            weightChangeData = { 
              value: Math.abs(roundedChange), 
              isLoss: false, 
              display: `${Math.abs(roundedChange).toFixed(1)}` 
            }
          } else {
            weightChangeData = { 
              value: 0, 
              isLoss: null, 
              display: "0.0" 
            }
          }
        }
      }

      last5Days.push({
        day: date.getDate().toString().padStart(2, "0"),
        date: date.toLocaleDateString("en-us", { weekday: "short" }),
        weight: dayWeight ? Math.round(dayWeight.value * 2.20462).toString() : "-",
        weightChange: weightChangeData,
        protein: dayProtein > 0 ? dayProtein.toFixed(1) : "-",
        calories: dayCalories > 0 ? Math.round(dayCalories).toString() : "-",
      })
    }

    return last5Days
  }

  const weeklyData = getWeeklyData()

  const formatDate = (date) => {
    return date.toLocaleDateString("en-us", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
  }

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const GoalCard = ({ title, current, target, unit, color }) => {
    const progress = getProgress(current, target)
    const remaining = Math.max(target - current, 0)

    return (
      <div className="bg-white rounded-xl shadow-sm border  border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">{current}</span>
              <span className="text-sm text-gray-500">{unit}</span>
            </div>
            <div className="text-xs text-gray-400">
              of {target} {unit}
            </div>
          </div>

          <div className="text-sm text-gray-500">{remaining > 0 ? `${remaining} ${unit} left` : "goal achieved!"}</div>
        </div>
      </div>
    )
  }

  const MealSection = ({ title, meals, currentDate }) => {
    const currentDateStr = currentDate ? currentDate.toLocaleDateString() : new Date().toLocaleDateString()
    const mealTypeMapping = {
      breakfast: "breakfast",
      lunch: "lunch",
      dinner: "dinner",
      snacks: "snack",
    }

    const filteredMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.timestamp).toLocaleDateString()
      const mealType = mealTypeMapping[title] || title
      return mealDate === currentDateStr && meal.meal_type?.toLowerCase() === mealType.toLowerCase()
    })

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        </div>

        <div className="p-6">
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
                </tr>
              </thead>
              <tbody>
                {filteredMeals.length > 0 ? (
                  filteredMeals.map((meal, index) => (
                    <tr key={`${meal.id}_${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-900">{index + 1}</td>
                      <td className="py-3 px-2 text-sm text-gray-900 font-medium">
                        {(meal.name || meal.label)?.toLowerCase()}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {meal.quantity || 1} {(meal.unit || "serving")?.toLowerCase()}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">{Math.round(meal.calories)} kcal</td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {meal.protein ? `${meal.protein.toFixed(1)}g` : "0g"}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">{meal.fat ? `${meal.fat.toFixed(1)}g` : "0g"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-sm text-gray-400">
                      no {title} items for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-500">loading your health data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-gray-700 mb-2">daily health tracker</h1>
          <p className="text-gray-500">track your journey to better health</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* main content */}
          <div className="xl:col-span-2 space-y-8">
            {/* daily goals */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(dailyGoals).map(([key, goal]) => (
                  <GoalCard
                    key={key}
                    title={key === "bowelMovements" ? "bowel movements" : key}
                    current={goal.current}
                    target={goal.target}
                    unit={goal.unit}
                    color={goal.color}
                  />
                ))}
              </div>
            </div>

            {/* date navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigateDate(-1)} className="p-3 hover:bg-purple-50">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-gray-700">{formatDate(currentDate).toLowerCase()}</span>
                </div>

                <Button variant="outline" size="sm" onClick={() => navigateDate(1)} className="p-3 hover:bg-purple-50">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* meals */}
            <MealSection
              title="breakfast"
              meals={healthData.meals}
              currentDate={currentDate}
            />
            <MealSection
              title="lunch"
              meals={healthData.meals}
              currentDate={currentDate}
            />
            <MealSection
              title="dinner"
              meals={healthData.meals}
              currentDate={currentDate}
            />
            <MealSection
              title="snacks"
              meals={healthData.meals}
              currentDate={currentDate}
            />
          </div>

          {/* weight tracker sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 xl:sticky xl:top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  weight tracker
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <>
                  {/* current weight for selected date */}
                  <div className="text-center">
                    <div className="text-4xl font-light text-purple-600 mb-2">
                      {weightData.hasWeightForDate ? weightData.current : 0}
                      <span className="text-xl text-gray-400">lbs</span>
                    </div>
                    <div className="text-sm text-gray-500">goal weight: {weightData.goal}lbs</div>
                    {!weightData.hasWeightForDate && (
                      <div className="text-xs text-gray-400 mt-1">
                        {weightData.mostRecentWeight ? "most recent weight" : "no weight data yet"}
                      </div>
                    )}
                  </div>

                  {/* progress stats with arrow indicators */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {weightData.hasWeightForDate && weightData.weightChange.isLoss !== null && (
                          <>
                            {weightData.weightChange.isLoss ? (
                              <ArrowDown className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowUp className="h-4 w-4 text-red-600" />
                            )}
                          </>
                        )}
                        <div
                          className={`text-lg font-bold ${
                            weightData.hasWeightForDate && weightData.weightChange.isLoss !== null
                              ? weightData.weightChange.isLoss
                                ? "text-green-600"
                                : "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {weightData.hasWeightForDate ? weightData.weightChange.value : 0}lbs
                        </div>
                      </div>
                      <div className="text-xs text-green-500 font-medium">
                        {weightData.hasWeightForDate && 
                        weightData.weightChange.isLoss === false ? "gained" : "lost"}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {weightData.hasWeightForDate ? weightData.toGo : 0}lbs
                      </div>
                      <div className="text-xs text-blue-500 font-medium">to go</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{weightData.daysToGo || 30}</div>
                      <div className="text-xs text-green-500 font-medium">days</div>
                    </div>
                  </div>

                  {/* weekly progress */}
                  <div className="space-y-3">
                    <div className="overflow-x-auto lowercase">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className=" text-left py-2 px-1 text-xs font-medium text-gray-500  tracking-wide">
                              days
                            </th>
                            <th className="text-center py-2 px-1 text-xs font-medium text-gray-500  tracking-wide">
                              weight
                            </th>
                            <th className="text-center py-2 px-1 text-xs font-medium text-gray-500  tracking-wide">
                              lost
                            </th>
                            <th className="text-center py-2 px-1 text-xs font-medium text-gray-500  tracking-wide">
                              protein
                            </th>
                            <th className="text-center py-2 px-1 text-xs font-medium text-gray-500 tracking-wide">
                              calories
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {weeklyData.length > 0
                            ? weeklyData.map((day, index) => (
                                <tr key={`${day.day}_${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-1">
                                    <div className="text-center">
                                      <div className="text-sm font-medium text-gray-900">{day.day}</div>
                                      <div className="text-xs text-gray-500">{day.date.toLowerCase()}</div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    <span className="font-medium text-gray-900">
                                      {day.weight !== "-" ? day.weight : "-"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    {day.weightChange.isLoss !== null ? (
                                      <div className="flex items-center justify-center gap-1">
                                        {day.weightChange.isLoss ? (
                                          <ArrowDown className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <ArrowUp className="h-3 w-3 text-red-600" />
                                        )}
                                        <span
                                          className={`font-medium text-xs ${
                                            day.weightChange.isLoss ? "text-green-600" : "text-red-600"
                                          }`}
                                        >
                                          {day.weightChange.display}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    <span className="font-medium text-gray-900">
                                      {day.protein !== "-" ? `${day.protein}g` : "-"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    <span className="font-medium text-gray-900">
                                      {day.calories !== "-" ? day.calories : "-"}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            : Array.from({ length: 5 }, (_, index) => (
                                <tr key={`empty_${index}`} className="border-b border-gray-100">
                                  <td className="py-3 px-1">
                                    <div className="text-center">
                                      <div className="text-sm font-medium text-gray-400">
                                        {String(new Date().getDate() - index).padStart(2, "0")}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {new Date(Date.now() - index * 24 * 60 * 60 * 1000)
                                          .toLocaleDateString("en-us", { weekday: "short" })
                                          .toLowerCase()}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    <span className="text-gray-400">-</span>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    <span className="text-gray-400">-</span>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    <span className="text-gray-400">-</span>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    <span className="text-gray-400">-</span>
                                  </td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
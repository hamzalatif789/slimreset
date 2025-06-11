"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, TrendingDown, TrendingUp, Target } from "lucide-react"

export function WeightTracker({ userId }) {
  const [currentWeight, setCurrentWeight] = useState("")
  const [weightHistory, setWeightHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Liliana's data from the PDF
  const currentWeightFromPDF = 166
  const goalWeight = 125
  const weightToLose = currentWeightFromPDF - goalWeight

  useEffect(() => {
    fetchWeightHistory()
  }, [])

  const fetchWeightHistory = async () => {
    try {
      const response = await fetch(`/api/weight?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setWeightHistory(data.weightData || [])
      }
    } catch (error) {
      console.error("Error fetching weight history:", error)
    }
  }

  const handleWeightSubmit = async (e) => {
    e.preventDefault()
    if (!currentWeight.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: Number.parseFloat(currentWeight),
          userId,
        }),
      })

      if (response.ok) {
        setCurrentWeight("")
        fetchWeightHistory()
      }
    } catch (error) {
      console.error("Error recording weight:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null
    const latest = weightHistory[weightHistory.length - 1].weight
    const previous = weightHistory[weightHistory.length - 2].weight
    return latest - previous
  }

  const trend = getWeightTrend()
  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : currentWeightFromPDF
  const progressPercentage = ((currentWeightFromPDF - latestWeight) / weightToLose) * 100

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-3">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Scale className="h-5 w-5 text-blue-600" />
          Weight Tracker
        </CardTitle>
        <p className="text-sm text-gray-600">Track your SlimReset progress</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 space-y-3">
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600">{latestWeight} lbs</div>
            <div className="text-sm text-gray-500">Current Weight</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">{goalWeight} lbs</div>
              <div className="text-xs text-gray-500">Goal Weight</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">{(latestWeight - goalWeight).toFixed(1)} lbs</div>
              <div className="text-xs text-gray-500">To Go</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress</span>
              <span>{Math.max(0, progressPercentage).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              ></div>
            </div>
          </div>

          {trend !== null && (
            <div
              className={`flex items-center justify-center gap-1 text-sm p-2 rounded ${
                trend < 0
                  ? "bg-green-100 text-green-700"
                  : trend > 0
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {trend < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : trend > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <Target className="h-4 w-4" />
              )}
              {trend < 0
                ? `${Math.abs(trend).toFixed(1)} lbs lost`
                : trend > 0
                  ? `${trend.toFixed(1)} lbs gained`
                  : "No change"}
            </div>
          )}
        </div>

        {/* Weight Entry Form */}
        <form onSubmit={handleWeightSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              placeholder="Enter weight (lbs)"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
            <Button type="submit" disabled={isLoading || !currentWeight.trim()} className="px-4">
              {isLoading ? "..." : "Log"}
            </Button>
          </div>
        </form>

        {/* Recent Entries */}
        {weightHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Recent Entries</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {weightHistory
                .slice(-5)
                .reverse()
                .map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">{entry.weight} lbs</span>
                    <span className="text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Motivation */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs text-purple-800 text-center">
            <strong>🎯 SlimReset Goal:</strong> Lose 0.5-1 lb per day with your personalized HCG protocol!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

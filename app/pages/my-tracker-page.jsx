"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchWeightData, fetchCaloriesData, fetchMealData } from "@/lib/api-client";

export default function MyTrackerPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2025-06-10"));
  const [healthData, setHealthData] = useState({
    meals: [],
    weight: [],
    calories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [mealsData, weightData, caloriesData] = await Promise.all([
          fetchMealData(),
          fetchWeightData(),
          fetchCaloriesData(),
        ]);

        setHealthData({
          meals: mealsData.map((meal) => ({
            name: meal.label,
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
        });

        console.log("✅ Successfully loaded initial data from APIs");
      } catch (error) {
        console.error("❌ Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);
  //meal section

  // Get current date's data
  const getCurrentDateData = () => {
    const currentDateStr = currentDate.toLocaleDateString();

    // Get today's calories from meals
    const todaysMeals = healthData.meals.filter(meal => {
      const mealDate = new Date(meal.timestamp).toLocaleDateString();
      return mealDate === currentDateStr;
    });

    const totalCaloriesFromMeals = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);

    // Get today's burned calories
    const todaysCaloriesBurned = healthData.calories.filter(entry => {
      const entryDate = new Date(entry.timestamp).toLocaleDateString();
      return entryDate === currentDateStr;
    });

    const totalCaloriesBurned = todaysCaloriesBurned.reduce((sum, entry) => sum + entry.value, 0);

    // Get today's protein
    const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);

    return {
      calories: totalCaloriesFromMeals,
      caloriesBurned: totalCaloriesBurned,
      protein: totalProtein,
      caloriesBurnedEntries: todaysCaloriesBurned,
    };
  };

  const currentDayData = getCurrentDateData();

  // Daily goals with real-time data
  const dailyGoals = {
    calories: {
      current: Math.round(currentDayData.calories),
      target: 800,
      unit: "kcal",
      color: "bg-blue-500"
    },
    protein: {
      current: Math.round(currentDayData.protein), // Convert grams to oz * 0.035274
      target: 11,
      unit: "g",
      color: "bg-green-500"
    },
    water: {
      current: 0,
      target: 12,
      unit: "cups",
      color: "bg-cyan-500"
    },
    bowelMovements: {
      current: 0,
      target: 2,
      unit: "bm",
      color: "bg-purple-500",
    },
  };

  // Weight data with date-specific weight display
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
      };
    }

    // Sort weights by date (oldest first)
    const sortedWeights = [...healthData.weight].sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Get weight for the selected date
    const currentDateStr = currentDate.toLocaleDateString();
    const currentDateWeight = healthData.weight.find(w =>
      new Date(w.timestamp).toLocaleDateString() === currentDateStr
    );

    const goalWeight = 86; // You can make this dynamic

    // If we have weight for the selected date, use it for display
    if (currentDateWeight) {
      // Calculate weight lost from oldest to current date weight
      const oldestWeight = sortedWeights[0]; // First entry (oldest)
      const weightLost = oldestWeight.value - currentDateWeight.value;
      const weightToGo = currentDateWeight.value - goalWeight;

      return {
        current: Math.round(currentDateWeight.value * 2.20462), // Convert kg to lbs
        goal: Math.round(goalWeight * 2.20462),
        lost: Math.round(weightLost * 2.20462),
        toGo: Math.round(weightToGo * 2.20462),
        daysToGo: 0, // Calculate based on your target
        hasData: true,
        currentWeight: currentDateWeight,
        hasWeightForDate: true,
      };
    }

    // If no weight for selected date, return structure indicating no data for this date
    return {
      current: 0,
      goal: Math.round(goalWeight * 2.20462),
      lost: 0,
      toGo: 0,
      daysToGo: 45,
      hasData: false,
      currentWeight: null,
      hasWeightForDate: false,
      mostRecentWeight: sortedWeights[sortedWeights.length - 1], // Most recent weight
    };
  };


  const weightData = getWeightData();

  // Weekly data with real-time data
  const getWeeklyData = () => {
  if (healthData.weight.length === 0) {
    return [];
  }

  // Get last 5 days of data relative to current selected date
  const last5Days = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();

    // Find weight for this date
    const dayWeight = healthData.weight.find(w =>
      new Date(w.timestamp).toLocaleDateString() === dateStr
    );

    // Find meals for this date
    const dayMeals = healthData.meals.filter(meal =>
      new Date(meal.timestamp).toLocaleDateString() === dateStr
    );

    const dayCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const dayProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);

    // Calculate weight loss compared to previous day
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDayWeight = healthData.weight.find(w => {
      return new Date(w.timestamp).toLocaleDateString() === prevDate.toLocaleDateString();
    });

    const weightLoss = prevDayWeight && dayWeight ?
      Math.round((prevDayWeight.value - dayWeight.value) * 2.20462) : 0;

    last5Days.push({
      day: date.getDate().toString().padStart(2, '0'),
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      weight: dayWeight ? Math.round(dayWeight.value * 2.20462).toString() : "-",
      loss: weightLoss > 0 ? `-${weightLoss}` : weightLoss < 0 ? `+${Math.abs(weightLoss)}` : "-",
      protein: dayProtein > 0 ? dayProtein.toFixed(1) : "-", // Fixed: removed conversion to oz
      calories: dayCalories > 0 ? Math.round(dayCalories).toString() : "-",
    });
  }

  return last5Days;
};

  const weeklyData = getWeeklyData();

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const GoalCard = ({ title, current, target, unit, color }) => {
    const progress = getProgress(current, target);
    const remaining = Math.max(target - current, 0);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 capitalize">
            {title}
          </h3>
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {current}
              </span>
              <span className="text-sm text-gray-500">{unit}</span>
            </div>
            <div className="text-xs text-gray-400">
              of {target} {unit}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${color} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="text-sm text-gray-500">
            {remaining > 0
              ? `${remaining} ${unit} remaining`
              : "Goal achieved!"}
          </div>
        </div>
      </div>
    );
  };

  const MealSection = ({ title, icon, meals, onAddMeal, currentDate }) => {
    // Filter meals for this specific meal type and current date
    const currentDateStr = currentDate ? currentDate.toLocaleDateString() : new Date().toLocaleDateString();
    const mealTypeMapping = {
      'breakfast': 'breakfast',
      'lunch': 'lunch',
      'dinner': 'dinner',
      'snacks': 'snack'
    };

    const filteredMeals = meals.filter(meal => {
      const mealDate = new Date(meal.timestamp).toLocaleDateString();
      const mealType = mealTypeMapping[title] || title;
      return mealDate === currentDateStr &&
        meal.meal_type?.toLowerCase() === mealType.toLowerCase();
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold text-gray-800 capitalize">
              {title}
            </h3>
            {/* Add button in header when no data */}
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
                    <tr key={meal.foodId || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-900">{index + 1}</td>
                      <td className="py-3 px-2 text-sm text-gray-900 font-medium">
                        {meal.name || meal.label}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {meal.quantity || 1} {meal.unit || 'serving'}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {Math.round(meal.calories)} kcal
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {meal.protein ? `${meal.protein.toFixed(1)}g` : '0g'}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {meal.fat ? `${meal.fat.toFixed(1)}g` : '0g'}
                      </td>

                    </tr>
                  ))
                ) : (
                  // Empty row when no data - keeps table structure
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-sm text-gray-400">
                      No {title} items for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-gray-700 mb-2">
            Daily Health Tracker
          </h1>
          <p className="text-gray-500">Track your journey to better health</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Daily Goals */}
            <div className="space-y-6">
              {/* <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Today's Goals
              </h2> */}

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

            {/* Date Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate(-1)}
                  className="p-3 hover:bg-purple-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-gray-700">
                    {formatDate(currentDate)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate(1)}
                  className="p-3 hover:bg-purple-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Meals */}
            <MealSection
              title="breakfast"
              // icon={<div className="text-2xl">🌅</div>}
              meals={healthData.meals}
              currentDate={currentDate}
              onAddMeal={(mealType) => console.log(`Add ${mealType} clicked`)}
            />
            <MealSection
              title="lunch"
              // icon={<div className="text-2xl">☀️</div>}
              meals={healthData.meals}
              currentDate={currentDate}
              onAddMeal={(mealType) => console.log(`Add ${mealType} clicked`)}
            />
            <MealSection
              title="dinner"
              // icon={<div className="text-2xl">🌙</div>}
              meals={healthData.meals}
              currentDate={currentDate}
              onAddMeal={(mealType) => console.log(`Add ${mealType} clicked`)}
            />
            <MealSection
              title="snacks"
              // icon={<div className="text-2xl">🍎</div>}
              meals={healthData.meals}
              currentDate={currentDate}
              onAddMeal={(mealType) => console.log(`Add ${mealType} clicked`)}
            />
          </div>

          {/* Weight Tracker Sidebar with date-specific weight display */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 xl:sticky xl:top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Weight Tracker
                </h2>
                {/* <div className="text-sm text-gray-500 mt-1">
                  {formatDate(currentDate)}
                </div> */}
              </div>

              <div className="p-6 space-y-6">
                {weightData.hasWeightForDate ? (
                  <>
                    {/* Current Weight for Selected Date */}
                    <div className="text-center">
                      <div className="text-4xl font-light text-purple-600 mb-2">
                        {weightData.current}
                        <span className="text-xl text-gray-400">lbs</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Goal: {weightData.goal}lbs
                      </div>
                      {/* <div className="text-xs text-gray-400 mt-1">
                        Recorded: {new Date(weightData.currentWeight.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div> */}
                    </div>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">
                          -{weightData.lost}lbs
                        </div>
                        <div className="text-xs text-red-500 font-medium">Lost</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {weightData.toGo}lbs
                        </div>
                        <div className="text-xs text-blue-500 font-medium">
                          To Go
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {weightData.daysToGo}
                        </div>
                        <div className="text-xs text-green-500 font-medium">
                          Days
                        </div>
                      </div>
                    </div>

                    {/* Weekly Progress */}
                    {weeklyData.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Recent Progress
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Days
                                </th>
                                <th className="text-center py-2 px-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Weight
                                </th>
                                <th className="text-center py-2 px-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Lost
                                </th>
                                <th className="text-center py-2 px-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Protein
                                </th>
                                <th className="text-center py-2 px-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Calories
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {weeklyData.map((day, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-1">
                                    <div className="text-center">
                                      <div className="text-sm font-medium text-gray-900">
                                        {day.day}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {day.date}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    <span className="font-medium text-gray-900">
                                      {day.weight !== "-" ? day.weight : "-"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-1 text-center">
                                    {day.loss !== "-" ? (
                                      <span className={`font-medium ${day.loss.startsWith('-') ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {day.loss}
                                      </span>
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
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">No weight data for this date</p>
                    <p className="text-gray-400 text-sm mb-4">
                      {formatDate(currentDate)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      Add weight entry
                    </Button>

                    {/* Show context if there's weight data available */}
                    {healthData.weight.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 mb-2">Most recent weight:</p>
                        <p className="text-sm font-medium text-blue-800">
                          {Math.round(healthData.weight.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].value * 2.20462)}lbs
                        </p>
                        <p className="text-xs text-blue-500">
                          {new Date(healthData.weight.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
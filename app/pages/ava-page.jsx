"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import {
  storeMealData,
  storeWeightData,
  storeCaloriesData,
  fetchMealData,
  fetchWeightData,
  fetchCaloriesData,
} from "../../lib/api-client";

export default function AvaPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [healthData, setHealthData] = useState({
    meals: [],
    calories: [],
    weight: [],
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial data from APIs
  // useEffect(() => {
  //   async function loadInitialData() {
  //     try {
  //       const [mealsData, weightData, caloriesData] = await Promise.all([
  //         fetchMealData(),
  //         fetchWeightData(),
  //         fetchCaloriesData(),
  //       ])

  //       setHealthData({
  //         meals: mealsData.map((meal) => ({
  //           name: meal.label,
  //           quantity: meal.amount,
  //           meal_type: meal.type,
  //           calories: Number.parseFloat(meal.calories),
  //           protein: Number.parseFloat(meal.protein),
  //           fat: Number.parseFloat(meal.totalFat),
  //           carbs: Number.parseFloat(meal.carbs),
  //           fiber: Number.parseFloat(meal.fiber),
  //           sugar: Number.parseFloat(meal.sugars),
  //           sodium: Number.parseFloat(meal.sodium),
  //           edamamEnriched: true,
  //           timestamp: meal.createdAt,
  //           foodId: meal.foodId,
  //           label: meal.label,
  //         })),
  //         weight: weightData.map((entry) => ({
  //           value: entry.weight,
  //           unit: "kg",
  //           timestamp: entry.createdAt,
  //           date: new Date(entry.createdAt).toLocaleDateString(),
  //         })),
  //         calories: caloriesData.map((entry) => ({
  //           value: entry.calories,
  //           type: "burned",
  //           timestamp: entry.createdAt,
  //           date: new Date(entry.createdAt).toLocaleDateString(),
  //         })),
  //       })

  //       console.log("✅ Successfully loaded initial data from APIs")
  //     } catch (error) {
  //       console.error("❌ Error loading initial data:", error)
  //     }
  //   }

  //   loadInitialData()
  // }, [])

  // Enhanced logging for health data
  useEffect(() => {
    if (
      healthData.meals.length > 0 ||
      healthData.calories.length > 0 ||
      healthData.weight.length > 0
    ) {
      logHealthDataSummary();
    }
  }, [healthData]);

  const logHealthDataSummary = () => {
    console.log("=== COMPLETE HEALTH DATA SUMMARY ===");

    const enrichedMeals = healthData.meals.filter(
      (meal) => meal.edamamEnriched
    );
    const totalNutrition = calculateTotalNutrition(enrichedMeals);

    // Main summary
    console.log("📊 Full Health Tracking State:", {
      meals: {
        count: healthData.meals.length,
        enrichedWithEdamam: enrichedMeals.length,
        foods: healthData.meals.map((m) => m.name),
        data: healthData.meals,
        totalNutrition:
          enrichedMeals.length > 0
            ? formatNutrition(totalNutrition)
            : "No detailed nutrition data available",
      },
      calories: {
        count: healthData.calories.length,
        values: healthData.calories.map((c) => c.value),
        total: healthData.calories.reduce(
          (sum, entry) => sum + (entry.value || 0),
          0
        ),
        data: healthData.calories,
      },
      weight: {
        count: healthData.weight.length,
        values: healthData.weight.map((w) => w.value),
        current:
          healthData.weight.length > 0
            ? healthData.weight[healthData.weight.length - 1].value
            : null,
        data: healthData.weight,
      },
    });

    // Detailed nutrition breakdown
    if (enrichedMeals.length > 0) {
      console.log("🥗 DETAILED NUTRITION BREAKDOWN:");
      enrichedMeals.forEach((meal, index) => {
        console.log(
          `${index + 1}. ${meal.label || meal.name}:`,
          formatMealNutrition(meal)
        );
      });
    }

    console.log("=====================================");
  };

  const calculateTotalNutrition = (meals) => {
    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.calories || 0),
        protein: totals.protein + (meal.protein || 0),
        fat: totals.fat + (meal.fat || 0),
        carbs: totals.carbs + (meal.carbs || 0),
        fiber: totals.fiber + (meal.fiber || 0),
        sugar: totals.sugar + (meal.sugar || 0),
        sodium: totals.sodium + (meal.sodium || 0),
      }),
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );
  };

  const formatNutrition = (nutrition) => ({
    calories: Math.round(nutrition.calories),
    protein: Math.round(nutrition.protein * 10) / 10,
    fat: Math.round(nutrition.fat * 10) / 10,
    carbs: Math.round(nutrition.carbs * 10) / 10,
    fiber: Math.round(nutrition.fiber * 10) / 10,
    sugar: Math.round(nutrition.sugar * 10) / 10,
    sodium: Math.round(nutrition.sodium * 10) / 10,
  });

  const formatMealNutrition = (meal) => ({
    calories: Math.round(meal.calories || 0),
    protein: `${Math.round((meal.protein || 0) * 10) / 10}g`,
    fat: `${Math.round((meal.fat || 0) * 10) / 10}g`,
    carbs: `${Math.round((meal.carbs || 0) * 10) / 10}g`,
    fiber: `${Math.round((meal.fiber || 0) * 10) / 10}g`,
    sugar: `${Math.round((meal.sugar || 0) * 10) / 10}g`,
    sodium: `${Math.round((meal.sodium || 0) * 10) / 10}mg`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const analysis = await analyzeUserData(input.trim());
      let nutritionData = null;

      if (analysis?.meals_eaten?.length > 0) {
        console.log("📥 Analysis received:", analysis);

        const enrichedMeals = await enrichMealsWithNutrition(
          analysis.meals_eaten,
          input.trim()
        );
        nutritionData = enrichedMeals.filter((meal) => meal.edamamEnriched);

        // Store meals in the external API
        for (const meal of enrichedMeals) {
          if (meal.edamamEnriched) {
            try {
              await storeMealData(meal);
            } catch (error) {
              console.error(`Failed to store meal ${meal.name}:`, error);
            }
          }
        }

        updateHealthData({
          meals: enrichedMeals,
          weight: analysis.current_weight ? [analysis.current_weight] : [],
          calories: analysis.calories_burned ? [analysis.calories_burned] : [],
        });
      } else if (analysis) {
        // Store weight and calories if present
        if (analysis.current_weight) {
          try {
            await storeWeightData(analysis.current_weight);
          } catch (error) {
            console.error("Failed to store weight:", error);
          }
        }

        if (analysis.calories_burned) {
          try {
            await storeCaloriesData(analysis.calories_burned);
          } catch (error) {
            console.error("Failed to store calories:", error);
          }
        }

        updateHealthData({
          weight: analysis.current_weight ? [analysis.current_weight] : [],
          calories: analysis.calories_burned ? [analysis.calories_burned] : [],
        });
      }

      const assistantMessage = await getChatResponse(
        userMessage,
        nutritionData
      );
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, createErrorMessage()]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeUserData = async (userInput) => {
    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error("Error analyzing user data:", error);
      return null;
    }
  };

  const enrichMealsWithNutrition = async (meals, fallbackInput) => {
    return Promise.all(
      meals.map(async (meal) => {
        try {
          const response = await fetch("/api/food-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              foodItem: meal.name || fallbackInput,
              quantity: meal.quantity || "1",
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.nutritionInfo) {
              console.log(
                `🥗 Edamam nutrition for ${meal.name}:`,
                data.nutritionInfo
              );
              return {
                ...meal,
                ...data.nutritionInfo,
                edamamEnriched: true,
                timestamp: new Date().toISOString(),
              };
            }
          }
        } catch (error) {
          console.error(`Error getting nutrition for ${meal.name}:`, error);
        }
        return { ...meal, timestamp: new Date().toISOString() };
      })
    );
  };

  const updateHealthData = async (newData) => {
    setHealthData((prev) => {
      const updated = { ...prev };

      if (newData.meals) {
        updated.meals = [...prev.meals, ...newData.meals];
      }

      if (newData.weight?.length > 0) {
        const weightEntry = {
          value: newData.weight[0],
          unit: "kg",
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
        };
        updated.weight = [...prev.weight, weightEntry];

        // Store weight in external API
        storeWeightData(newData.weight[0])
          .then(() => console.log("✅ Weight data stored successfully"))
          .catch((error) =>
            console.error("❌ Failed to store weight data:", error)
          );
      }

      if (newData.calories?.length > 0) {
        const calorieEntry = {
          value: newData.calories[0],
          type: "burned",
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
        };

        const today = new Date().toLocaleDateString();
        const existingIndex = prev.calories.findIndex(
          (entry) => entry.date === today && entry.type === "burned"
        );

        if (existingIndex >= 0) {
          updated.calories = [...prev.calories];
          updated.calories[existingIndex] = calorieEntry;
        } else {
          updated.calories = [...prev.calories, calorieEntry];
        }

        // Store calories in external API
        storeCaloriesData(newData.calories[0])
          .then(() => console.log("✅ Calories data stored successfully"))
          .catch((error) =>
            console.error("❌ Failed to store calories data:", error)
          );
      }

      return updated;
    });
  };

  const getChatResponse = async (userMessage, nutritionData) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        mealsEaten: healthData.meals,
        calories: healthData.calories,
        weight: healthData.weight,
        nutritionDetails: nutritionData,
      }),
    });

    if (!response.ok) throw new Error("Failed to get chat response");

    const data = await response.json();
    let content = data.message;

    // if (nutritionData?.length > 0) {
    //   const nutritionSummary = nutritionData
    //     .map(
    //       (meal) =>
    //         `<div class="nutrition-summary bg-blue-50 p-3 rounded-lg mt-2 mb-2">
    //       <strong>🥗 ${meal.label}</strong><br/>
    //       <div class="grid grid-cols-2 gap-2 text-sm mt-1">
    //         <span>Calories: <strong>${Math.round(
    //           meal.calories || 0
    //         )}</strong></span>
    //         <span>Protein: <strong>${Math.round(
    //           meal.protein || 0
    //         )}g</strong></span>
    //         <span>Carbs: <strong>${Math.round(meal.carbs || 0)}g</strong></span>
    //         <span>Fat: <strong>${Math.round(meal.fat || 0)}g</strong></span>
    //       </div>
    //     </div>`
    //     )
    //     .join("");
    //   content += nutritionSummary;
    // }

    return {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content,
    };
  };

  const createErrorMessage = () => ({
    id: (Date.now() + 1).toString(),
    role: "assistant",
    content:
      "Sorry, I encountered an error while processing your request. Please try again.",
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] p-4 md:p-5 rounded-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : message.role === "system"
                    ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                <span className="text-sm md:text-base">
                  SlimCoach Ava is analyzing nutrition data...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="flex gap-3 md:gap-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about your meals, calories, weight, or ask any health questions..."
              className="flex-1 min-h-[60px] md:min-h-[70px] resize-none text-sm md:text-base border-2 border-gray-200 focus:border-purple-400 rounded-xl"
              disabled={isLoading}
            />
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

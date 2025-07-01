"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import { storeMealData, storeWeightData, storeCaloriesData } from "../../lib/api-client"

// ==================== CONSTANTS ====================
const STORAGE_KEYS = {
  CHAT: "ava_chat_messages",
  HEALTH_DATA: "ava_health_data",
  SESSION_FLAG: "ava_session_flag",
}

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Your SlimCoach Ava! A weight loss advisor and motivating AI coach for the SlimReset program — a gut-personalized fat loss system that combines the HCG 800-calorie protocol with support for food intolerances, nutrient deficiencies, and preferences.",
}

const INITIAL_HEALTH_DATA = {
  meals: [],
  calories: [],
  weight: [],
}

// Global variable for console history
const inputConsoleHistory = []

// ==================== MAIN COMPONENT ====================
export default function AvaPage() {
  // ==================== STATE MANAGEMENT ====================
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [healthData, setHealthData] = useState(INITIAL_HEALTH_DATA)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [pendingMeal, setPendingMeal] = useState(null)
  const [awaitingQuantity, setAwaitingQuantity] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeAnimation, setWelcomeAnimation] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [showThinking, setShowThinking] = useState(false)

  // ==================== REFS ====================
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // ==================== UTILITY FUNCTIONS ====================

  // Convert weight between units
  const convertWeight = (weight, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return weight

    if (fromUnit === "kg" && toUnit === "lbs") {
      return weight * 2.20462
    } else if (fromUnit === "lbs" && toUnit === "kg") {
      return weight / 2.20462
    }

    return weight
  }

  // Create weight confirmation card HTML
  const createWeightConfirmationCard = (weight, unit, originalWeight, originalUnit) => {
    const displayWeight = Math.round(weight)
    const displayUnit = unit === "kg" ? "kg" : "lb"
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    return `
      <div class="weight-confirmation-card" style="
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        border-radius: 16px;
        padding: 20px;
        margin: 16px 0;
        color: white;
        box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
        max-width: 280px;
        position: relative;
        overflow: hidden;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          opacity: 0.9;
        ">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 4V2a1 1 0 0 1 2 0v2h6V2a1 1 0 0 1 2 0v2h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1Z"/>
              <path d="M7 10h10"/>
              <path d="M7 14h6"/>
            </svg>
            <span>Added to weight on ${formattedDate}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style="opacity: 0.7;">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div style="
          font-size: 36px;
          font-weight: bold;
          line-height: 1;
          margin-bottom: 4px;
        ">
          ${displayWeight}<span style="font-size: 24px; opacity: 0.8;">${displayUnit}</span>
        </div>
        ${
          originalUnit !== unit
            ? `
          <div style="
            font-size: 12px;
            opacity: 0.8;
            margin-top: 4px;
          ">
            (${Math.round(originalWeight)} ${originalUnit === "kg" ? "kg" : "lbs"})
          </div>
        `
            : ""
        }
        <div style="
          position: absolute;
          top: -20px;
          right: -20px;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          opacity: 0.3;
        "></div>
      </div>
    `
  }

  // Create meals summary card
  // const createMealsSummaryCard = (meals) => {
  //   if (!meals || meals.length === 0) return ""

  //   const mealsByType = meals.reduce((acc, meal) => {
  //     const type = meal.meal_type || "other"
  //     if (!acc[type]) acc[type] = []
  //     acc[type].push(meal)
  //     return acc
  //   }, {})

  //   const mealTypeColors = {
  //     breakfast: "#4CAF50",
  //     lunch: "#FF9800",
  //     dinner: "#2196F3",
  //     snack: "#9C27B0",
  //     other: "#607D8B",
  //   }

  //   let summaryHtml = `
  //     <div class="meals-summary-card" style="
  //       background: linear-gradient(135deg, #667eea, #764ba2);
  //       border-radius: 16px;
  //       padding: 20px;
  //       margin: 16px 0;
  //       color: white;
  //       box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  //       max-width: 400px;
  //     ">
  //       <div style="
  //         display: flex;
  //         align-items: center;
  //         gap: 8px;
  //         margin-bottom: 16px;
  //         font-size: 16px;
  //         font-weight: bold;
  //       ">
  //         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  //           <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  //         </svg>
  //         <span>Meals Added (${meals.length} items)</span>
  //       </div>
  //   `

  //   Object.entries(mealsByType).forEach(([mealType, mealList]) => {
  //     const color = mealTypeColors[mealType] || mealTypeColors.other
  //     summaryHtml += `
  //       <div style="
  //         background: rgba(255, 255, 255, 0.1);
  //         border-radius: 8px;
  //         padding: 12px;
  //         margin-bottom: 8px;
  //       ">
  //         <div style="
  //           font-weight: bold;
  //           margin-bottom: 8px;
  //           color: ${color};
  //           text-transform: capitalize;
  //         ">${mealType}</div>
  //     `

  //     mealList.forEach((meal) => {
  //       summaryHtml += `
  //         <div style="
  //           display: flex;
  //           justify-content: space-between;
  //           align-items: center;
  //           padding: 4px 0;
  //           font-size: 14px;
  //         ">
  //           <span>${meal.name}</span>
  //           <span style="opacity: 0.8;">${meal.quantity}</span>
  //         </div>
  //       `
  //     })

  //     summaryHtml += `</div>`
  //   })

  //   summaryHtml += `</div>`
  //   return summaryHtml
  // }

  // Scroll to bottom of chat
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current) {
      if (force) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" })
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [])

  // Check if meal has missing quantity information
  const hasMissingQuantity = (meals) => {
    return meals.some((meal) => !meal.quantity || meal.quantity === "1" || meal.quantity === "unknown")
  }

  // Extract quantity from user input using regex
  const extractQuantityFromInput = (input) => {
    console.log("🔍 Extracting quantity from input:", input)

    // Text number mapping
    const textNumbers = {
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      ten: "10",
    }

    // Convert text numbers to digits
    let processedInput = input.toLowerCase()
    Object.keys(textNumbers).forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      processedInput = processedInput.replace(regex, textNumbers[word])
    })

    console.log("🔄 Processed input:", processedInput)

    // First try to extract standard quantity patterns
    const quantityRegex =
      /(\d+(?:\.\d+)?)\s*(cups?|pieces?|slices?|grams?|g|kg|ounces?|oz|lbs?|pounds?|tablespoons?|tbsp|teaspoons?|tsp|servings?|serving)/i
    const match = processedInput.match(quantityRegex)

    if (match) {
      const result = `${match[1]} ${match[2]}`
      console.log("✅ Found quantity with unit:", result)
      return result
    }

    // Try to extract from sentences like "the quantity was 5"
    const sentenceQuantityRegex =
      /(?:quantity was|amount was|had|ate)\s*(\d+(?:\.\d+)?)\s*(cups?|pieces?|slices?|grams?|g|kg|ounces?|oz|lbs?|pounds?|tablespoons?|tbsp|teaspoons?|tsp|servings?|serving)?/i
    const sentenceMatch = processedInput.match(sentenceQuantityRegex)

    if (sentenceMatch) {
      if (sentenceMatch[2]) {
        // Unit was specified
        const result = `${sentenceMatch[1]} ${sentenceMatch[2]}`
        console.log("✅ Found quantity from sentence with unit:", result)
        return result
      } else {
        // No unit specified, just return the number
        const result = sentenceMatch[1]
        console.log("✅ Found quantity from sentence without unit:", result)
        return result
      }
    }

    // Check if it's just a number
    const numberOnlyRegex = /^\s*(\d+(?:\.\d+)?)\s*$/
    const numberMatch = processedInput.match(numberOnlyRegex)

    if (numberMatch) {
      const result = numberMatch[1]
      console.log("✅ Found number only:", result)
      return result
    }

    console.log("❌ No quantity pattern found")
    return input.trim()
  }

  // Create error message object
  const createErrorMessage = () => ({
    id: (Date.now() + 1).toString(),
    role: "assistant",
    content: "Sorry, I encountered an error while processing your request. Please try again.",
  })

  // ==================== STORAGE FUNCTIONS ====================

  // Load data from localStorage and sessionStorage
  const loadStoredData = useCallback(() => {
    try {
      const sessionFlag = sessionStorage.getItem(STORAGE_KEYS.SESSION_FLAG)
      const isPageRefresh = !sessionFlag

      if (isPageRefresh) {
        // Clear chat on page refresh
        localStorage.removeItem(STORAGE_KEYS.CHAT)
        sessionStorage.setItem(STORAGE_KEYS.SESSION_FLAG, "active")

        // Show thinking message in chat first
        setTimeout(() => {
          const thinkingMessage = {
            id: "thinking",
            role: "assistant",
            content: "Thinking...",
          }
          setMessages([thinkingMessage])
          setShowWelcome(true)
          setIsPageLoading(false)
        }, 100)

        // After 3 seconds, replace thinking with welcome message
        setTimeout(() => {
          setMessages([WELCOME_MESSAGE])
          setTimeout(() => {
            setWelcomeAnimation(true)
            setTimeout(() => {
              showTimeBasedMessage()
            }, 2000)
          }, 50)
          setIsInitialLoad(false)
        }, 3000)
      } else {
        // Load existing messages
        const storedMessages = localStorage.getItem(STORAGE_KEYS.CHAT)
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages)
          if (parsedMessages.length > 0) {
            setMessages([WELCOME_MESSAGE, ...parsedMessages])
            setShowWelcome(true)
            setWelcomeAnimation(true)
            setIsPageLoading(false)
          } else {
            showWelcomeWithDelay()
          }
        } else {
          showWelcomeWithDelay()
        }
      }

      // Load health data
      const storedHealthData = localStorage.getItem(STORAGE_KEYS.HEALTH_DATA)
      if (storedHealthData) {
        const parsedHealthData = JSON.parse(storedHealthData)
        setHealthData(parsedHealthData)
        console.log("📥 Loaded health data from storage:", parsedHealthData)
      }
    } catch (error) {
      console.error("❌ Error loading data from localStorage:", error)
      clearAllStorage()
      showWelcomeWithDelay()
    }
  }, [])

  // Show thinking message first, then welcome message with delay
  const showWelcomeWithDelay = () => {
    setTimeout(() => {
      const thinkingMessage = {
        id: "thinking",
        role: "assistant",
        content: "Thinking...",
      }
      setMessages([thinkingMessage])
      setShowWelcome(true)
      setIsPageLoading(false)
    }, 100)

    setTimeout(() => {
      setMessages([WELCOME_MESSAGE])
      setTimeout(() => {
        setWelcomeAnimation(true)
        setTimeout(() => {
          showTimeBasedMessage()
        }, 2000)
      }, 50)
      setIsInitialLoad(false)
    }, 3000)
  }

  // Show time-based message after welcome message
  const showTimeBasedMessage = async () => {
    try {
      const { getPendingNotification } = await import("@/lib/time-based-notifications")
      const pendingNotification = await getPendingNotification()

      if (pendingNotification) {
        const timeBasedMessage = {
          id: "time-based-" + Date.now(),
          role: "assistant",
          content: pendingNotification.message,
        }

        setTimeout(() => {
          setMessages((prev) => {
            const hasTimeBasedMessage = prev.some(
              (msg) => msg.id.startsWith("time-based-") || msg.content === pendingNotification.message,
            )

            if (hasTimeBasedMessage) {
              return prev
            }

            return [...prev, timeBasedMessage]
          })
        }, 2000)
      }
    } catch (error) {
      console.error("❌ Error showing time-based message:", error)
    }
  }

  // Clear all storage
  const clearAllStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.CHAT)
    localStorage.removeItem(STORAGE_KEYS.HEALTH_DATA)
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_FLAG)
  }

  // Save messages to localStorage
  const saveMessagesToStorage = useCallback((messagesToSave) => {
    if (messagesToSave.length > 1) {
      try {
        const filteredMessages = messagesToSave.filter((msg) => msg.id !== "welcome")
        if (filteredMessages.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(filteredMessages))
        }
      } catch (error) {
        console.error("❌ Error saving messages to localStorage:", error)
      }
    }
  }, [])

  // ==================== API FUNCTIONS ====================

  // Analyze user data for meals, weight, calories
  const analyzeUserData = async (userInput) => {
    try {
      console.log("🔍 Calling analyze-meal API with input:", userInput)

      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      })

      console.log("📡 API Response status:", response.status, response.statusText)

      if (!response.ok) {
        console.error("❌ API response not ok:", response.status, response.statusText)
        return null
      }

      const data = await response.json()
      console.log("📥 Analysis analyze-meal result:", data)

      if (!data || typeof data !== "object") {
        console.error("❌ Invalid response format:", data)
        return null
      }

      if (data.analysis === null || data.analysis === undefined) {
        console.error("❌ Analysis is null/undefined:", data)
        return null
      }

      console.log("✅ Valid analysis received:", data.analysis)
      return data.analysis
    } catch (error) {
      console.error("❌ Error analyzing user data:", error)
      return null
    }
  }

  // Store weight data using the proxy API
  const storeWeightDataViaProxy = async (weight, unit) => {
    try {
      console.log("📤 Storing weight via proxy API:", weight, unit)

      const response = await fetch("/api/Proxy/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: weight,
          unit: unit,
          date: new Date().toISOString(),
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Weight API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Weight stored successfully:", data)
      return data
    } catch (error) {
      console.error("❌ Error storing weight:", error)
      throw error
    }
  }

  // Enrich meals with nutrition information
  const enrichMealsWithNutrition = async (meals, fallbackInput) => {
    console.log("🍽️ Starting nutrition enrichment for meals:", meals)

    const enrichedMeals = await Promise.all(
      meals.map(async (meal) => {
        console.log("🔍 Processing meal:", meal)

        try {
          const response = await fetch("/api/food-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              foodItem: meal.name || fallbackInput,
              quantity: meal.quantity || "1",
            }),
          })

          if (response.ok) {
            const data = await response.json()
            console.log("📊 Received nutrition data for meal:", meal.name, data)

            if (data.nutritionInfo) {
              const enrichedMeal = {
                ...meal,
                ...data.nutritionInfo,
                edamamEnriched: true,
                timestamp: new Date().toISOString(),
              }
              console.log("✅ Enriched meal:", enrichedMeal)
              return enrichedMeal
            }
          }
        } catch (error) {
          console.error(`❌ Error getting nutrition for ${meal.name}:`, error)
        }

        // Return meal without enrichment if there's an error
        return { ...meal, timestamp: new Date().toISOString() }
      }),
    )

    console.log("🍽️ Final enriched meals:", enrichedMeals)
    return enrichedMeals
  }

  // Get chat response from API
  const getChatResponse = async (
    userMessage,
    nutritionData,
    isQuantityResponse = false,
    needsQuantityPrompt = false,
    isWeightResponse = false,
  ) => {
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
        isQuantityResponse,
        needsQuantityPrompt,
        isWeightResponse,
      }),
    })

    if (!response.ok) throw new Error("Failed to get chat response")

    const data = await response.json()
    console.log("📥 Chat response data:", data)
    let content = data.message

    // Add nutrition summary if available
    if (nutritionData?.length > 0) {
      const nutritionSummary = nutritionData
        .map(
          (meal) => `
          <div class="nutrition-summary bg-blue-50 p-3 rounded-lg mt-2 mb-2">
            <strong>🥗 ${meal.label}</strong><br/>
            <div class="grid grid-cols-2 gap-2 text-sm mt-1">
              <span>Calories: <strong>${Math.round(meal.calories || 0)}</strong></span>
              <span>Protein: <strong>${Math.round(meal.protein || 0)}g</strong></span>
              <span>Carbs: <strong>${Math.round(meal.carbs || 0)}g</strong></span>
              <span>Fat: <strong>${Math.round(meal.fat || 0)}g</strong></span>
            </div>
          </div>
        `,
        )
        .join("")
      content += nutritionSummary
    }

    return {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content,
    }
  }

  // ==================== DATA MANAGEMENT ====================

  // Update health data state and storage
  const updateHealthData = async (newData) => {
    console.log("📊 Updating health data with:", newData)

    setHealthData((prev) => {
      const updated = { ...prev }

      // Add meals
      if (newData.meals) {
        updated.meals = [...prev.meals, ...newData.meals]
        // console.log("🍽️ Updated meals:", updated.meals)
      }

      // Add weight data
      if (newData.weight?.length > 0) {
        const weightEntry = {
          value: newData.weight[0],
          unit: newData.weightUnit || "kg",
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
        }
        updated.weight = [...prev.weight, weightEntry]
        console.log("⚖️ Updated weight:", updated.weight)

        // Store weight data using original storeWeightData function
        storeWeightData(newData.weight[0]).catch((error) => console.error("❌ Failed to store weight data:", error))
      }

      // Add calories data
      if (newData.calories?.length > 0) {
        const calorieEntry = {
          value: newData.calories[0],
          type: newData.calorieType || "consumed",
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
        }

        const today = new Date().toLocaleDateString()
        const existingIndex = prev.calories.findIndex(
          (entry) => entry.date === today && entry.type === calorieEntry.type,
        )

        if (existingIndex >= 0) {
          updated.calories = [...prev.calories]
          updated.calories[existingIndex] = calorieEntry
        } else {
          updated.calories = [...prev.calories, calorieEntry]
        }
        console.log("🔥 Updated calories:", updated.calories)

        // Store calories data
        storeCaloriesData(newData.calories[0]).catch((error) =>
          console.error("❌ Failed to store calories data:", error),
        )
      }

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.HEALTH_DATA, JSON.stringify(updated))
        console.log("💾 Saved health data to localStorage")
      } catch (error) {
        console.error("❌ Error saving health data to localStorage:", error)
      }

      return updated
    })
  }

  // Store meals in database
  const storeMealsInDatabase = async (meals) => {
    console.log("📤 Storing meals in database:", meals)

    for (const meal of meals) {
      if (meal.edamamEnriched) {
        try {
          await storeMealData(meal)
          console.log("✅ Stored meal:", meal.name)
        } catch (error) {
          console.error(`❌ Failed to store meal ${meal.name}:`, error)
        }
      }
    }
  }

  // ==================== FORM HANDLERS ====================

  // Handle weight logging
  const handleWeightLogging = async (analysis, userMessage) => {
    console.log("⚖️ Processing weight:", analysis.current_weight, analysis.weight_unit)

    const originalWeight = analysis.current_weight
    const originalUnit = analysis.weight_unit

    // Convert to lbs for display (matching the image)
    const displayWeight = originalUnit === "kg" ? convertWeight(originalWeight, "kg", "lbs") : originalWeight
    const displayUnit = "lbs"

    try {
      // Store weight data via proxy API
      await storeWeightDataViaProxy(originalWeight, originalUnit)

      // Also store using original method for compatibility
      updateHealthData({
        weight: [originalWeight],
        weightUnit: originalUnit,
      })

      // Create weight confirmation card
      const weightCard = createWeightConfirmationCard(displayWeight, displayUnit, originalWeight, originalUnit)

      // Get chat response
      const assistantMessage = await getChatResponse(userMessage, null, false, false, true)

      // Combine weight card with chat response
      const combinedContent = weightCard + assistantMessage.content

      const finalMessage = {
        ...assistantMessage,
        content: combinedContent,
      }

      setMessages((prev) => [...prev, finalMessage])
    } catch (error) {
      console.error("❌ Failed to process weight:", error)
      // Still show a response even if storage fails
      const assistantMessage = await getChatResponse(userMessage, null, false, false, true)
      setMessages((prev) => [...prev, assistantMessage])
    }
  }

  // Handle quantity response flow
  const handleQuantityResponse = async (quantityValue, userMessage) => {
    console.log("📥 Processing quantity:", quantityValue, "for meal:", pendingMeal.name)

    const updatedMeal = {
      ...pendingMeal,
      quantity: quantityValue.trim(),
    }

    const enrichedMeals = await enrichMealsWithNutrition([updatedMeal], updatedMeal.originalInput || pendingMeal.name)
    const nutritionData = enrichedMeals.filter((meal) => meal.edamamEnriched)

    // Store meals
    await storeMealsInDatabase(enrichedMeals)

    updateHealthData({ meals: enrichedMeals })

    // Reset quantity flow state
    setPendingMeal(null)
    setAwaitingQuantity(false)

    const assistantMessage = await getChatResponse(userMessage, nutritionData, true)
    setMessages((prev) => [...prev, assistantMessage])
  }

  // Handle comprehensive analysis (meals + weight + calories)
  const handleComprehensiveAnalysis = async (analysis, currentInput, userMessage) => {
    console.log("🔍 Processing comprehensive analysis:", analysis)

    let responseContent = ""
    let allNutritionData = []

    // 1. Handle weight if present
    if (analysis.current_weight && analysis.weight_unit) {
      console.log("⚖️ Processing weight data")
      const originalWeight = analysis.current_weight
      const originalUnit = analysis.weight_unit
      const displayWeight = originalUnit === "kg" ? convertWeight(originalWeight, "kg", "lbs") : originalWeight
      const displayUnit = "lbs"

      try {
        await storeWeightDataViaProxy(originalWeight, originalUnit)
        updateHealthData({
          weight: [originalWeight],
          weightUnit: originalUnit,
        })

        const weightCard = createWeightConfirmationCard(displayWeight, displayUnit, originalWeight, originalUnit)
        responseContent += weightCard
      } catch (error) {
        console.error("❌ Failed to process weight:", error)
      }
    }

    // 2. Handle meals if present
    if (analysis.meals_eaten?.length > 0) {
      console.log("🍽️ Processing meals data")

      // Check if any meals are missing quantity
      if (hasMissingQuantity(analysis.meals_eaten)) {
        const mealWithoutQuantity = analysis.meals_eaten.find(
          (meal) => !meal.quantity || meal.quantity === "1" || meal.quantity === "unknown",
        )

        setPendingMeal({
          ...mealWithoutQuantity,
          originalInput: currentInput,
        })
        setAwaitingQuantity(true)

        const quantityPromptMessage = await getChatResponse(userMessage, null, false, true)
        setMessages((prev) => [...prev, quantityPromptMessage])
        return
      }

      // Process meals with quantities
      const enrichedMeals = await enrichMealsWithNutrition(analysis.meals_eaten, currentInput)
      const nutritionData = enrichedMeals.filter((meal) => meal.edamamEnriched)
      allNutritionData = nutritionData

      // Store meals
      await storeMealsInDatabase(enrichedMeals)

      updateHealthData({ meals: enrichedMeals })

      // Create meals summary card
      // const mealsCard = createMealsSummaryCard(analysis.meals_eaten)
      // responseContent += mealsCard
    }

    // 3. Handle calories if present
    if (analysis.calories_consumed || analysis.calories_burned) {
      console.log("🔥 Processing calories data")

      if (analysis.calories_consumed) {
        try {
          await storeCaloriesData(analysis.calories_consumed)
          updateHealthData({
            calories: [analysis.calories_consumed],
            calorieType: "consumed",
          })
        } catch (error) {
          console.error("❌ Failed to store consumed calories:", error)
        }
      }

      if (analysis.calories_burned) {
        try {
          await storeCaloriesData(analysis.calories_burned)
          updateHealthData({
            calories: [analysis.calories_burned],
            calorieType: "burned",
          })
        } catch (error) {
          console.error("❌ Failed to store burned calories:", error)
        }
      }
    }

    // 4. Get chat response and combine with cards
    const assistantMessage = await getChatResponse(userMessage, allNutritionData)
    const finalContent = responseContent + assistantMessage.content

    const finalMessage = {
      ...assistantMessage,
      content: finalContent,
    }

    setMessages((prev) => [...prev, finalMessage])
  }

  // Main form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()

    // Log input for debugging
    inputConsoleHistory.push(currentInput)
    console.log("📋 Input history:", inputConsoleHistory)
    console.log("🔄 Current state - awaitingQuantity:", awaitingQuantity, "pendingMeal:", pendingMeal)

    setInput("")
    setIsLoading(true)

    try {
      // Analyze user data first
      const analysis = await analyzeUserData(currentInput)
      console.log("📥 Full analysis result:", analysis)

      // Check if analysis is null
      if (!analysis) {
        console.log("❌ Analysis is null, processing as regular chat")
        const assistantMessage = await getChatResponse(userMessage, null)
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
        return
      }

      // Handle quantity response flow
      if (awaitingQuantity && pendingMeal && analysis?.is_quantity_only) {
        console.log("🔄 Processing quantity response for pending meal:", pendingMeal.name)
        await handleQuantityResponse(analysis.extracted_quantity || currentInput, userMessage)
        setIsLoading(false)
        return
      }

      // Reset pending meal for new meals
      if (awaitingQuantity && pendingMeal && !analysis?.is_quantity_only && analysis?.meals_eaten?.length > 0) {
        console.log("🔄 User provided new meal, resetting previous pending meal")
        setPendingMeal(null)
        setAwaitingQuantity(false)
      }

      // Handle comprehensive analysis (weight + meals + calories)
      const hasWeight = analysis?.current_weight && analysis?.weight_unit
      const hasMeals = analysis?.meals_eaten?.length > 0
      const hasCalories = analysis?.calories_consumed || analysis?.calories_burned

      if (hasWeight || hasMeals || hasCalories) {
        console.log("🔍 Processing comprehensive data")
        await handleComprehensiveAnalysis(analysis, currentInput, userMessage)
      } else {
        console.log("💬 No health data found, processing as regular chat")
        const assistantMessage = await getChatResponse(userMessage, null)
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error)
      setMessages((prev) => [...prev, createErrorMessage()])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // ==================== EFFECTS ====================

  // Auto-scroll effect
  useEffect(() => {
    if (isInitialLoad && messages.length > 1) {
      setTimeout(() => {
        scrollToBottom(true)
        setIsInitialLoad(false)
      }, 100)
    } else if (!isInitialLoad) {
      scrollToBottom(false)
    }
  }, [messages, isInitialLoad, scrollToBottom])

  // Initial scroll effect
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [scrollToBottom])

  // Load stored data on mount
  useEffect(() => {
    loadStoredData()
  }, [loadStoredData])

  // Save messages when they change
  useEffect(() => {
    saveMessagesToStorage(messages)
  }, [messages, saveMessagesToStorage])

  // Cleanup and global functions setup
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(STORAGE_KEYS.CHAT)
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_FLAG)
    }

    // Global clear function
    window.clearAvaChat = () => {
      clearAllStorage()
      setMessages([])
      setShowWelcome(false)
      setWelcomeAnimation(false)
      setIsPageLoading(true)
      setHealthData(INITIAL_HEALTH_DATA)
      setIsInitialLoad(false)
      setPendingMeal(null)
      setAwaitingQuantity(false)

      setTimeout(() => {
        const thinkingMessage = {
          id: "thinking",
          role: "assistant",
          content: "Thinking...",
        }
        setMessages([thinkingMessage])
        setShowWelcome(true)
        setIsPageLoading(false)
      }, 100)

      setTimeout(() => {
        setMessages([WELCOME_MESSAGE])
        setTimeout(() => {
          setWelcomeAnimation(true)
          setTimeout(() => {
            showTimeBasedMessage()
          }, 2000)
        }, 50)
      }, 3000)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      delete window.clearAvaChat
    }
  }, [])

  // ==================== RENDER ====================

  // Loading screen
  if (isPageLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-500">ava is loading...</p>
        </div>
      </div>
    )
  }

  // Main chat interface
  return (
    <div className="h-screen flex flex-col bg-[#F4F7F9]">
      {/* Chat Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] p-4 md:p-5 rounded-2xl shadow-sm transition-all duration-1000 ease-out ${
                  message.role === "user"
                    ? "bg-[#946CFC] text-white"
                    : message.role === "system"
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200"
                      : "bg-white text-gray-800 border border-gray-200"
                } ${
                  message.id === "thinking"
                    ? "flex items-center space-x-3"
                    : message.id === "welcome" && !welcomeAnimation
                      ? "opacity-0 transform translate-y-4 scale-95"
                      : message.id === "welcome" && welcomeAnimation
                        ? "opacity-100 transform translate-y-0 scale-100"
                        : ""
                }`}
              >
                {message.id === "thinking" ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                    <span className="text-sm md:text-base">Thinking...</span>
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.content }} />
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                <span className="text-sm md:text-base">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-1xl mx-auto md:p-6">
          <div className="flex gap-3 md:gap-4 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={awaitingQuantity ? "" : "Type your message..."}
              className="flex-1 min-h-[40px] items-center md:min-h-[40px] !text-base resize-none border-2 border-gray-200 focus:border-purple-400 rounded-xl"
              rows={1}
              disabled={isLoading}
            />

            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="bg-[#946CFC] hover:bg-[#946CFC] px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

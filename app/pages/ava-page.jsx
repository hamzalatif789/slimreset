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
  // Add this after other refs

  // ==================== UTILITY FUNCTIONS ====================

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
      }
    } catch (error) {
      console.error("❌ Error loading data from localStorage:", error)
      clearAllStorage()
      showWelcomeWithDelay()
    }
  }, [])

  // Show thinking message first, then welcome message with delay
  const showWelcomeWithDelay = () => {
    // First show thinking message in chat
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
        // After 2 seconds, show time-based message
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

      console.log("🔍 Checking for time-based notifications...")

      console.log("🔍 Pending notification result:", pendingNotification)

      if (pendingNotification) {
        const timeBasedMessage = {
          id: "time-based-" + Date.now(),
          role: "assistant",
          content: pendingNotification.message,
        }

        setTimeout(() => {
          setMessages((prev) => {
            // Check if a time-based message already exists
            const hasTimeBasedMessage = prev.some(
              (msg) => msg.id.startsWith("time-based-") || msg.content === pendingNotification.message,
            )

            if (hasTimeBasedMessage) {
              console.log("🚫 Time-based message already exists, skipping")
              return prev
            }

            console.log("✅ Adding time-based message:", pendingNotification.type)
            return [...prev, timeBasedMessage]
          })
        }, 2000)
      } else {
        console.log("✅ No notification needed - user has data for current time window")
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
      console.log("📥 Analysis result:", data)

      // Additional validation
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

  // Enrich meals with nutrition information
  const enrichMealsWithNutrition = async (meals, fallbackInput) => {
    // Log the original meals array before enrichment
    console.log("Original meals array:", meals)

    const enrichedMeals = await Promise.all(
      meals.map(async (meal) => {
        // Log each meal object before sending the request
        console.log("Processing meal:", meal)

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

            // Log the data received from the API (nutrition info)
            console.log("Received nutrition data for meal:", meal.name, data)

            if (data.nutritionInfo) {
              // Log the enriched meal before returning
              console.log("Enriched meal:", {
                ...meal,
                ...data.nutritionInfo,
                edamamEnriched: true,
                timestamp: new Date().toISOString(),
              })

              return {
                ...meal,
                ...data.nutritionInfo,
                edamamEnriched: true,
                timestamp: new Date().toISOString(),
              }
            }
          }
        } catch (error) {
          console.error(`Error getting nutrition for ${meal.name}:`, error)
        }

        // Return meal without enrichment if there's an error or no nutrition info
        return { ...meal, timestamp: new Date().toISOString() }
      }),
    )

    // Log the final enriched meals array after Promise.all resolves
    console.log("Final enriched meals:", enrichedMeals)

    return enrichedMeals
  }

  // Get chat response from API
  const getChatResponse = async (
    userMessage,
    nutritionData,
    isQuantityResponse = false,
    needsQuantityPrompt = false,
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
      }),
    })

    if (!response.ok) throw new Error("Failed to get chat response")

    const data = await response.json()
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
    setHealthData((prev) => {
      const updated = { ...prev }

      // Add meals
      if (newData.meals) {
        updated.meals = [...prev.meals, ...newData.meals]
      }

      // Add weight data
      if (newData.weight?.length > 0) {
        const weightEntry = {
          value: newData.weight[0],
          unit: "kg",
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
        }
        updated.weight = [...prev.weight, weightEntry]

        // Store weight data
        storeWeightData(newData.weight[0]).catch((error) => console.error("❌ Failed to store weight data:", error))
        console.log("Stored weight data:", updated.weight)
      }

      // Add calories data
      if (newData.calories?.length > 0) {
        const calorieEntry = {
          value: newData.calories[0],
          type: "burned",
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
        }

        const today = new Date().toLocaleDateString()
        const existingIndex = prev.calories.findIndex((entry) => entry.date === today && entry.type === "burned")

        if (existingIndex >= 0) {
          updated.calories = [...prev.calories]
          updated.calories[existingIndex] = calorieEntry
        } else {
          updated.calories = [...prev.calories, calorieEntry]
        }

        // Store calories data
        storeCaloriesData(newData.calories[0]).catch((error) =>
          console.error("❌ Failed to store calories data:", error),
        )
      }

      return updated
    })
  }

  // Store meals in database
  const storeMealsInDatabase = async (meals) => {
    for (const meal of meals) {
      if (meal.edamamEnriched) {
        try {
          await storeMealData(meal)
        } catch (error) {
          console.error(`Failed to store meal ${meal.name}:`, error)
        }
      }
    }
  }

  // ==================== FORM HANDLERS ====================

  // Handle quantity response flow
  const handleQuantityResponse = async (quantityValue, userMessage) => {
    console.log("📥 Processing quantity:", quantityValue, "for meal:", pendingMeal.name)
    console.log("📊 Original pending meal:", pendingMeal)

    // Clean and format the quantity
    let cleanQuantity = quantityValue.trim()

    // If it's just a number without unit, add "serving" as default
    const numberOnlyRegex = /^\d+(\.\d+)?$/
    if (numberOnlyRegex.test(cleanQuantity)) {
      cleanQuantity = `${cleanQuantity} `
    }

    // Remove duplicate "serving" if it exists (fix the regex)
    cleanQuantity = cleanQuantity.replace(/\bserving\s+serving\b/gi, "serving")

    console.log("🔧 Cleaned quantity:", cleanQuantity)

    const updatedMeal = {
      ...pendingMeal,
      quantity: cleanQuantity,
    }

    console.log("📥 Updated meal with quantity:", updatedMeal)

    const enrichedMeals = await enrichMealsWithNutrition([updatedMeal], updatedMeal.originalInput || pendingMeal.name)
    const nutritionData = enrichedMeals.filter((meal) => meal.edamamEnriched)

    console.log("🍽️ Final enriched meals to store:", enrichedMeals)

    // Store meals
    await storeMealsInDatabase(enrichedMeals)

    updateHealthData({ meals: enrichedMeals })

    // Reset quantity flow state
    console.log("✅ Resetting pending meal state after successful quantity update")
    setPendingMeal(null)
    setAwaitingQuantity(false)

    const assistantMessage = await getChatResponse(userMessage, nutritionData, true)
    setMessages((prev) => [...prev, assistantMessage])
  }

  // Handle normal meal analysis flow
  const handleMealAnalysis = async (analysis, currentInput, userMessage) => {
    console.log("📥 Analysis received:", analysis)

    // Check if meals are missing quantity
    if (hasMissingQuantity(analysis.meals_eaten)) {
      const mealWithoutQuantity = analysis.meals_eaten.find(
        (meal) => !meal.quantity || meal.quantity === "1" || meal.quantity === "unknown",
      )

      console.log("🔄 Setting pending meal:", mealWithoutQuantity)
      setPendingMeal({
        ...mealWithoutQuantity,
        originalInput: currentInput,
      })
      setAwaitingQuantity(true)

      // Let Ava naturally ask for quantity
      const quantityPromptMessage = await getChatResponse(userMessage, null, false, true)
      setMessages((prev) => [...prev, quantityPromptMessage])
      return
    }

    // Process meals with quantity
    const enrichedMeals = await enrichMealsWithNutrition(analysis.meals_eaten, currentInput)
    const nutritionData = enrichedMeals.filter((meal) => meal.edamamEnriched)

    // Store meals
    await storeMealsInDatabase(enrichedMeals)

    updateHealthData({
      meals: enrichedMeals,
      weight: analysis.current_weight ? [analysis.current_weight] : [],
      calories: analysis.calories_burned ? [analysis.calories_burned] : [],
    })

    const assistantMessage = await getChatResponse(userMessage, nutritionData)
    setMessages((prev) => [...prev, assistantMessage])
  }

  // Handle weight and calories only
  const handleWeightAndCalories = async (analysis, userMessage) => {
    // Store weight and calories
    if (analysis.current_weight) {
      try {
        await storeWeightData(analysis.current_weight)
      } catch (error) {
        console.error("Failed to store weight:", error)
      }
    }

    if (analysis.calories_burned) {
      try {
        await storeCaloriesData(analysis.calories_burned)
      } catch (error) {
        console.error("Failed to store calories:", error)
      }
    }

    updateHealthData({
      weight: analysis.current_weight ? [analysis.current_weight] : [],
      calories: analysis.calories_burned ? [analysis.calories_burned] : [],
    })

    const assistantMessage = await getChatResponse(userMessage, null)
    setMessages((prev) => [...prev, assistantMessage])
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

      // Handle quantity response flow - check if we're awaiting quantity AND this is quantity-only input
      if (awaitingQuantity && pendingMeal && analysis?.is_quantity_only) {
        console.log("🔄 Processing quantity response for pending meal:", pendingMeal.name)
        console.log("📊 Extracted quantity:", analysis.extracted_quantity)
        await handleQuantityResponse(analysis.extracted_quantity || currentInput, userMessage)
        setIsLoading(false)
        return
      }

      // IMPORTANT: DO NOT reset pending meal for unrelated queries
      // Only reset if user provides a new meal, not for general questions
      if (awaitingQuantity && pendingMeal && !analysis?.is_quantity_only && analysis?.meals_eaten?.length > 0) {
        console.log("🔄 User provided new meal, resetting previous pending meal:", pendingMeal.name)
        setPendingMeal(null)
        setAwaitingQuantity(false)
      } else if (awaitingQuantity && pendingMeal && !analysis?.is_quantity_only) {
        console.log("🔄 Keeping pending meal state - user asked unrelated question:", currentInput)
        console.log("📝 Pending meal still active:", pendingMeal.name)
      }

      // Normal flow - handle meal analysis
      if (analysis?.meals_eaten?.length > 0) {
        console.log("🍽️ Processing new meal(s):", analysis.meals_eaten)
        await handleMealAnalysis(analysis, currentInput, userMessage)
      } else if (analysis && (analysis.current_weight || analysis.calories_burned)) {
        console.log("⚖️ Processing weight/calories data")
        await handleWeightAndCalories(analysis, userMessage)
      } else {
        console.log("💬 No meal/health data found, processing as regular chat")
        // No analysis data - just get chat response
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
    // Also save health data (including meals) to localStorage
    if (healthData.meals.length > 0 || healthData.weight.length > 0 || healthData.calories.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.HEALTH_DATA, JSON.stringify(healthData))
      } catch (error) {
        console.error("❌ Error saving health data to localStorage:", error)
      }
    }
  }, [messages, saveMessagesToStorage, healthData])

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

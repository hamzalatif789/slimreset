// COMPLETE Time-based notification system for SlimReset app
// Fixed for both meal and weight API structures

export const TIME_WINDOWS = {
  WAKE_UP: { start: "07:30", end: "08:59", type: "weight" },
  BREAKFAST: { start: "09:00", end: "12:59", type: "breakfast" },
  LUNCH: { start: "13:00", end: "15:29", type: "lunch" },
  MIDDAY_CHECK: { start: "15:30", end: "18:29", type: "mood" },
  DINNER: { start: "18:30", end: "21:29", type: "dinner" },
  END_OF_DAY: { start: "21:30", end: "23:59", type: "summary" },
}

export const NOTIFICATION_MESSAGES = {
  weight: {
    message:
      "Good morning, Melissa. How are you feeling today? Did you get a chance to weigh in yet? Fun gut fact: While you were sleeping, your hypothalamus and gut microbiome were doing their reset magic. Morning weight gives us the cleanest read on how your body's responding. Drop your number here and I'll track it for you. One tiny habit, big fat-burning ripple effect.",
    action: "Log weight",
  },
  breakfast: {
    message:
      "What's for breakfast today? If you've already eaten, just let me know what you had and I'll log it. Was your protein around 100g or 150g? And were there any sauces, dressings, or extras added? I can track that for you and provide some insight on your choices. Saw you ate some ingredients off plan. Keep in mind, even small extras can signal your body to shift out of fat-burning mode — so I like to catch them early so we can adjust together. You're doing great.",
    action: "Log breakfast + protein",
  },
  lunch: {
    message:
      "Lunchtime check-in. What did we serve up? What was the main protein? What was your portion? Closer to 100g or 150g? Any dressings, dips, sauces, oils, or seasoning blends added? No pressure — I'm asking because your body's in a fat-burning groove and I want to keep the reset strong. If these little extras show up more often, I may tag in Coach Hoda for some friendly food tweaks. She's amazing at that.",
    action: "Log lunch + flag if trending off-plan",
  },
  mood: {
    message:
      "How's your energy and gut feeling this afternoon? Any bloat, cravings, mood dips, or just feeling off? Your gut talks in whispers before it screams — so I listen closely and tweak things early. Just reply with anything that stood out. I'm tracking and adjusting behind the scenes.",
    action: "Log mood + digestion",
  },
  dinner: {
    message:
      "Dinner time. What's on your plate tonight? If you added anything extra — like a sauce, a little oil, even a seasoning mix — let me know. I won't call the food police. I just want to keep our fat-burning strategy precise. If we've had a few off-plan extras this week, I might loop in Coach Hoda to help your body.",
    action: "Log dinner + protein",
  },
  summary: {
    message: null, // Will be generated dynamically
    action: "Trigger summary + escalation if flagged",
    isDynamic: true,
  },
}

// Get current time in HH:MM format
export function getCurrentTime() {
  const now = new Date()
  return now.toTimeString().slice(0, 5)
}

// Get current date in YYYY-MM-DD format
export function getCurrentDate() {
  const now = new Date()
  return now.toISOString().split("T")[0]
}

// Convert time string to minutes for comparison
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours * 60 + minutes
}

// Check if current time is within a specific window
export function isTimeInWindow(currentTime, windowStart, windowEnd) {
  const current = timeToMinutes(currentTime)
  const start = timeToMinutes(windowStart)
  const end = timeToMinutes(windowEnd)
  return current >= start && current <= end
}

// Get current active time window
export function getCurrentTimeWindow() {
  const currentTime = getCurrentTime()

  for (const [key, window] of Object.entries(TIME_WINDOWS)) {
    if (isTimeInWindow(currentTime, window.start, window.end)) {
      return { key, ...window }
    }
  }

  return null
}

// FIXED: Check if user has logged weight today
export async function hasLoggedWeightToday() {
  try {
    const response = await fetch("/api/Proxy/weight")
    if (!response.ok) {
      console.log("🔍 Weight API failed:", response.status)
      return false
    }

    const data = await response.json()
    const today = getCurrentDate()

    console.log("🔍 Weight API Response:", data)
    console.log("🔍 Today's date:", today)

    // Check if data exists and has entries
    if (!data.data || !Array.isArray(data.data)) {
      console.log("🔍 No weight data array found")
      return false
    }

    const hasWeightToday = data.data.some((entry) => {
      // FIXED: Use createdAt field for date comparison (matches your API structure)
      const entryDate = entry.createdAt?.split("T")[0]

      console.log("🔍 Weight entry check:", {
        entryDate,
        today,
        weight: entry.weight,
        dateMatch: entryDate === today,
        fullEntry: entry,
      })

      return entryDate === today
    })

    console.log("🔍 Has weight today:", hasWeightToday)
    return hasWeightToday
  } catch (error) {
    console.error("🔍 Error checking weight data:", error)
    return false
  }
}

// Check if user has logged specific meal type today
export async function hasLoggedMealToday(mealType) {
  try {
    const response = await fetch("/api/Proxy/meal")
    if (!response.ok) {
      console.log("🔍 Meal API failed:", response.status)
      return false
    }

    const data = await response.json()
    const today = getCurrentDate()

    console.log("🔍 Meal API Response:", data)
    console.log("🔍 Looking for meal type:", mealType)
    console.log("🔍 Today's date:", today)

    // Check if data exists and has entries
    if (!data.data || !Array.isArray(data.data)) {
      console.log("🔍 No meal data array found")
      return false
    }

    const hasMealToday = data.data.some((entry) => {
      // Use createdAt field for date comparison
      const entryDate = entry.createdAt?.split("T")[0]

      // Use the correct 'type' field from API response
      const entryMealType = entry.type?.toLowerCase() || "unknown"

      console.log("🔍 Meal entry check:", {
        entryDate,
        today,
        entryMealType,
        targetMealType: mealType.toLowerCase(),
        dateMatch: entryDate === today,
        typeMatch: entryMealType === mealType.toLowerCase(),
        fullEntry: entry,
      })

      const isDateMatch = entryDate === today
      const isTypeMatch = entryMealType === mealType.toLowerCase()

      return isDateMatch && isTypeMatch
    })

    console.log(`🔍 Has logged ${mealType} today:`, hasMealToday)
    return hasMealToday
  } catch (error) {
    console.error(`🔍 Error checking ${mealType} data:`, error)
    return false
  }
}

// Check if user has logged mood/energy today
export async function hasLoggedMoodToday() {
  try {
    // Check if there's any mood-related data in localStorage or API
    const healthData = localStorage.getItem("ava_health_data")
    if (healthData) {
      const parsed = JSON.parse(healthData)
      const today = getCurrentDate()

      console.log("🔍 Mood data check:", parsed.mood)

      // Check if there's any mood/energy entry for today
      const hasMoodToday =
        parsed.mood?.some((entry) => {
          const entryDate = entry.createdAt?.split("T")[0] || entry.timestamp?.split("T")[0] || entry.date
          return entryDate === today
        }) || false

      console.log("🔍 Has mood today:", hasMoodToday)
      return hasMoodToday
    }
    console.log("🔍 No mood data in localStorage")
    return false
  } catch (error) {
    console.error("🔍 Error checking mood data:", error)
    return false
  }
}

// Get today's weight data
export async function getTodaysWeightData() {
  try {
    const response = await fetch("/api/Proxy/weight")
    if (!response.ok) return null

    const data = await response.json()
    const today = getCurrentDate()

    if (!data.data || !Array.isArray(data.data)) return null

    const todaysWeight = data.data.find((entry) => {
      const entryDate = entry.createdAt?.split("T")[0]
      return entryDate === today
    })

    return todaysWeight ? todaysWeight.weight : null
  } catch (error) {
    console.error("Error fetching today's weight:", error)
    return null
  }
}

// Get today's meals summary - SIMPLIFIED to only store labels
export async function getTodaysMealsData() {
  try {
    const response = await fetch("/api/Proxy/meal")
    if (!response.ok) return { breakfast: [], lunch: [], dinner: [], count: 0 }

    const data = await response.json()
    const today = getCurrentDate()

    if (!data.data || !Array.isArray(data.data)) {
      return { breakfast: [], lunch: [], dinner: [], count: 0 }
    }

    // Filter ONLY today's meals
    const todaysMeals = data.data.filter((entry) => {
      const entryDate = entry.createdAt?.split("T")[0]
      return entryDate === today
    })

    // Group meals by type with ONLY food labels
    const mealsByType = {
      breakfast: [],
      lunch: [],
      dinner: [],
      count: todaysMeals.length,
    }

    todaysMeals.forEach((meal) => {
      const mealType = meal.type?.toLowerCase()
      const foodLabel = meal.label || "Unknown food"

      // Store only the label - no amounts, no calories
      const foodEntry = {
        label: foodLabel,
      }

      if (mealType === "breakfast") {
        mealsByType.breakfast.push(foodEntry)
      } else if (mealType === "lunch") {
        mealsByType.lunch.push(foodEntry)
      } else if (mealType === "dinner") {
        mealsByType.dinner.push(foodEntry)
      }
    })

    return mealsByType
  } catch (error) {
    console.error("Error fetching today's meals:", error)
    return { breakfast: [], lunch: [], dinner: [], count: 0 }
  }
}

// Generate dynamic summary message - SIMPLIFIED VERSION
export async function generateSummaryMessage() {
  const weight = await getTodaysWeightData()
  const meals = await getTodaysMealsData()
  const currentTime = getCurrentTime()
  const currentMinutes = timeToMinutes(currentTime)

  // Weight status - just the number
  const weightStatus = weight ? `${weight} lbs ✅` : "Not logged ❌"

  // Format meals with ONLY food labels - no amounts, no calories
  const formatMealSection = (mealArray, mealName) => {
    if (mealArray.length === 0) {
      return `${mealName}: Not logged ❌`
    }

    // Extract only the labels (Apple, Banana, etc.)
    const foodLabels = mealArray.map((food) => food.label).join(", ")

    return `${mealName}: ${foodLabels} ✅`
  }

  // Determine which meals to show based on current time
  let mealSummary = ""

  // Always show breakfast if it's past breakfast time (9:00)
  if (currentMinutes >= timeToMinutes("09:00")) {
    mealSummary += `• ${formatMealSection(meals.breakfast, "Breakfast")}\n`
  }

  // Show lunch if it's past lunch time (13:00)
  if (currentMinutes >= timeToMinutes("13:00")) {
    mealSummary += `• ${formatMealSection(meals.lunch, "Lunch")}\n`
  }

  // Show dinner if it's past dinner time (18:30)
  if (currentMinutes >= timeToMinutes("18:30")) {
    mealSummary += `• ${formatMealSection(meals.dinner, "Dinner")}\n`
  }

  // Get today's date for context
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `That's a wrap on today, Melissa. Here's your summary for ${today}: 

📊 **Today's Progress:**
• Weight: ${weightStatus}
${mealSummary}
If anything's missing, just send it here and I'll fill it in for you. And if meals felt a little off today or you're not seeing the results you expected, we can schedule a quick support call with Coach Hoda. She's amazing at unlocking what your body's asking for. Know you can always text me to help you set up the next available time.`
}

// Get notification based on current time and user data
export async function getTimeBasedNotification() {
  const currentWindow = getCurrentTimeWindow()
  console.log("🔍 Current time window:", currentWindow)

  if (!currentWindow) {
    console.log("🔍 No active time window")
    return null
  }

  let shouldShow = false

  switch (currentWindow.type) {
    case "weight":
      shouldShow = !(await hasLoggedWeightToday())
      console.log("🔍 Weight check - should show:", shouldShow)
      break
    case "breakfast":
      shouldShow = !(await hasLoggedMealToday("breakfast"))
      console.log("🔍 Breakfast check - should show:", shouldShow)
      break
    case "lunch":
      shouldShow = !(await hasLoggedMealToday("lunch"))
      console.log("🔍 Lunch check - should show:", shouldShow)
      break
    case "mood":
      shouldShow = !(await hasLoggedMoodToday())
      console.log("🔍 Mood check - should show:", shouldShow)
      break
    case "dinner":
      shouldShow = !(await hasLoggedMealToday("dinner"))
      console.log("🔍 Dinner check - should show:", shouldShow)
      break
    case "summary":
      // Always show summary
      shouldShow = true
      console.log("🔍 Summary check - should show:", shouldShow)
      break
    default:
      shouldShow = false
  }

  if (shouldShow) {
    console.log("🔍 Returning notification for:", currentWindow.type)

    // Handle dynamic summary message
    if (currentWindow.type === "summary") {
      const dynamicMessage = await generateSummaryMessage()
      return {
        type: currentWindow.type,
        timeWindow: `${currentWindow.start} - ${currentWindow.end}`,
        message: dynamicMessage,
        action: NOTIFICATION_MESSAGES[currentWindow.type].action,
      }
    }

    return {
      type: currentWindow.type,
      timeWindow: `${currentWindow.start} - ${currentWindow.end}`,
      ...NOTIFICATION_MESSAGES[currentWindow.type],
    }
  }

  console.log("🔍 No notification needed - data exists")
  return null
}

// Check for cross-time-window notifications (like lunch check during morning)
export async function getCrossTimeNotification() {
  const currentTime = getCurrentTime()
  const currentMinutes = timeToMinutes(currentTime)

  console.log("🔍 Cross-time check at:", currentTime)

  // If it's between 7:30 AM to 1:00 PM and user entered weight but not lunch
  if (currentMinutes >= timeToMinutes("07:30") && currentMinutes <= timeToMinutes("13:00")) {
    const hasWeight = await hasLoggedWeightToday()
    const hasLunch = await hasLoggedMealToday("lunch")

    console.log("🔍 Cross-time check:", { hasWeight, hasLunch, currentTime })

    // If it's past 1 PM and user has weight but no lunch
    if (currentMinutes >= timeToMinutes("13:00") && hasWeight && !hasLunch) {
      console.log("🔍 Returning cross-time lunch notification")
      return {
        type: "lunch",
        timeWindow: "Cross-time check",
        ...NOTIFICATION_MESSAGES.lunch,
      }
    }
  }

  console.log("🔍 No cross-time notification needed")
  return null
}

// Main function to get any pending notification
export async function getPendingNotification() {
  console.log("🔍 Getting pending notification...")

  // First check time-based notifications
  const timeNotification = await getTimeBasedNotification()
  if (timeNotification) {
    console.log("🔍 Found time-based notification:", timeNotification.type)
    return timeNotification
  }

  // Then check cross-time notifications
  const crossNotification = await getCrossTimeNotification()
  if (crossNotification) {
    console.log("🔍 Found cross-time notification:", crossNotification.type)
    return crossNotification
  }

  console.log("🔍 No pending notifications")
  return null
}

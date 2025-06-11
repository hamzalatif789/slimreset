// API client functions for meal, weight, and calories data using proxy routes

export async function storeWeightData(weight) {
  try {
    console.log("⚖️ Storing weight data:", weight)

    const response = await fetch("/api/Proxy/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: Number(weight),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to store weight data: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Data successfully stored in weight API:", data)
    return data
  } catch (error) {
    console.error("❌ Error storing weight data:", error)
    throw error
  }
}

export async function storeCaloriesData(calories) {
  try {
    console.log("🔥 Storing calories data:", calories)

    const response = await fetch("/api/Proxy/calories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calories: Number(calories),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to store calories data: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Data successfully stored in calories API:", data)
    return data
  } catch (error) {
    console.error("❌ Error storing calories data:", error)
    throw error
  }
}

export async function storeMealData(meal) {
  try {
    console.log("🥗 Storing meal data:", meal.name || meal.label)

    const response = await fetch("/api/Proxy/meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodId: meal.foodId || `${meal.name}-${Date.now()}`,
        label: meal.label || meal.name,
        type: meal.meal_type || "Unknown",
        amount: meal.quantity || "1",
        unit: "g",
        calories: String(Math.round(meal.calories || 0)),
        totalFat: `${Math.round((meal.fat || 0) * 10) / 10}g`,
        satFat: "0.0g",
        cholesterol: "0mg",
        sodium: `${Math.round(meal.sodium || 0)}mg`,
        carbs: `${Math.round((meal.carbs || 0) * 10) / 10}g`,
        fiber: `${Math.round((meal.fiber || 0) * 10) / 10}g`,
        sugars: `${Math.round((meal.sugar || 0) * 10) / 10}g`,
        protein: `${Math.round((meal.protein || 0) * 10) / 10}g`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to store meal data: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Data successfully stored in meal API:", data)
    return data
  } catch (error) {
    console.error("❌ Error storing meal data:", error)
    throw error
  }
}

export async function fetchMealData() {
  try {
    console.log("📊 Fetching meal data...")
    const response = await fetch("/api/Proxy/meal")

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to fetch meal data: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log("📊 Fetched meal data:", data)
    return data.data || []
  } catch (error) {
    console.error("❌ Error fetching meal data:", error)
    return []
  }
}

export async function fetchWeightData() {
  try {
    console.log("⚖️ Fetching weight data...")
    const response = await fetch("/api/Proxy/weight")

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to fetch weight data: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log("⚖️ Fetched weight data:", data)
    return data.data || []
  } catch (error) {
    console.error("❌ Error fetching weight data:", error)
    return []
  }
}

export async function fetchCaloriesData() {
  try {
    console.log("🔥 Fetching calories data...")
    const response = await fetch("/api/Proxy/calories")

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to fetch calories data: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log("🔥 Fetched calories data:", data)
    return data.data || []
  } catch (error) {
    console.error("❌ Error fetching calories data:", error)
    return []
  }
}

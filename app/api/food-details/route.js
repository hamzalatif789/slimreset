import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const { foodItem, quantity } = await req.json()

    if (!foodItem || !quantity) {
      return NextResponse.json({ error: "Food item and quantity are required" }, { status: 400 })
    }

    const query = `${quantity} ${foodItem}`
    const edamamUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}`

    const response = await fetch(edamamUrl)

    if (!response.ok) {
      throw new Error("Failed to fetch from Edamam API")
    }

    const data = await response.json()
    console.log("📥 Food admam details data:", data)

    let foodData = null
    if (data.parsed && data.parsed.length > 0) {
      foodData = data.parsed[0].food
    } else if (data.hints && data.hints.length > 0) {
      foodData = data.hints[0].food
    }

    if (!foodData) {
      return NextResponse.json({ error: "No food data found" }, { status: 404 })
    }

    const nutrients = foodData.nutrients || {}

    const nutritionInfo = {
      foodId: foodData.foodId || "0",
      label: foodData.label || foodItem,
      calories: nutrients.ENERC_KCAL || 0,
      protein: nutrients.PROCNT || 0,
      fat: nutrients.FAT || 0,
      carbs: nutrients.CHOCDF || 0,
      fiber: nutrients.FIBTG || 0,
      sugar: nutrients.SUGAR || 0,
      sodium: nutrients.NA || 0,
    }

    return NextResponse.json({ nutritionInfo })
  } catch (error) {
    console.error("Food details API error:", error)
    return NextResponse.json({ error: "Failed to get food details" }, { status: 500 })
  }
}

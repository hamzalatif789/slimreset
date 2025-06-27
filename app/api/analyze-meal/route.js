import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"

const MEAL_ANALYSIS_PROMPT = `You are an expert NLP assistant analyzing a user's message about their food intake and health.
Extract ALL information from the user's input including multiple meals, weight, and calories.

From the user's input, extract the following structured information ONLY in JSON format with these exact keys:
{
  "meals_eaten": [
    {
      "name": <string: food label or meal name, e.g. "apple", "banana">,
      "quantity": <string: quantity with unit, e.g. "5", "20", "1 cup">,
      "meal_type": <string|null: one of "breakfast", "lunch", "dinner", "snack", or null if missing>
    },
    ...
  ],
  "current_weight": <number|null: weight value in the original unit>,
  "weight_unit": <string|null: "kg", "lbs", "pounds", or null>,
  "calories_burned": <number|null: calories burned from exercise>,
  "calories_consumed": <number|null: calories consumed from food>,
  "protein": <number|null>,
  "other_relevant_info": <string|null>,
  "is_quantity_only": <boolean: true if the message only contains quantity information without mentioning food>,
  "extracted_quantity": <string|null: if is_quantity_only is true, extract the clean quantity value>
}

IMPORTANT RULES FOR EXTRACTION:

1. WEIGHT EXTRACTION:
- Look for patterns like "my weight is X", "I weigh X", "weight: X"
- Extract both number and unit (kg, lbs, pounds)
- Convert "pounds" to "lbs" for consistency

2. MEAL EXTRACTION:
- Extract ALL food items mentioned in the input
- For each food item, determine the quantity and meal type
- Look for meal type indicators: "breakfast", "lunch", "dinner", "snack"
- If meal type is mentioned with "in" (e.g., "in dinner"), use that meal type
- Extract quantities like "5 apples", "20 bananas", "1 cup rice"

3. CALORIE EXTRACTION:
- Look for "calories", "kcal", "cal"
- Distinguish between consumed calories and burned calories
- If just "calories" or "kcal" mentioned, assume consumed
- If "burned" or "exercise" mentioned, it's calories_burned

4. QUANTITY HANDLING:
- Convert text numbers to digits (e.g., "five" -> "5")
- Keep units if specified (e.g., "2 cups", "100g")
- If no unit, just use the number (e.g., "5" for "5 apples")

EXAMPLES:

Input: "my weight is 500 pounds and i ate 5 apples in dinner, 20 bananas in lunch and 5 kiwis in the breakfast and i also consumed 200 kcal"
Output: {
  "meals_eaten": [
    {"name": "apple", "quantity": "5", "meal_type": "dinner"},
    {"name": "banana", "quantity": "20", "meal_type": "lunch"},
    {"name": "kiwi", "quantity": "5", "meal_type": "breakfast"}
  ],
  "current_weight": 500,
  "weight_unit": "lbs",
  "calories_burned": null,
  "calories_consumed": 200,
  "protein": null,
  "other_relevant_info": null,
  "is_quantity_only": false,
  "extracted_quantity": null
}

Input: "I ate 2 chicken breasts for lunch and burned 300 calories"
Output: {
  "meals_eaten": [
    {"name": "chicken breast", "quantity": "2", "meal_type": "lunch"}
  ],
  "current_weight": null,
  "weight_unit": null,
  "calories_burned": 300,
  "calories_consumed": null,
  "protein": null,
  "other_relevant_info": null,
  "is_quantity_only": false,
  "extracted_quantity": null
}

Input: "my weight is 70 kg"
Output: {
  "meals_eaten": [],
  "current_weight": 70,
  "weight_unit": "kg",
  "calories_burned": null,
  "calories_consumed": null,
  "protein": null,
  "other_relevant_info": null,
  "is_quantity_only": false,
  "extracted_quantity": null
}

Input: "3 cups"
Output: {
  "meals_eaten": [],
  "current_weight": null,
  "weight_unit": null,
  "calories_burned": null,
  "calories_consumed": null,
  "protein": null,
  "other_relevant_info": null,
  "is_quantity_only": true,
  "extracted_quantity": "3 cups"
}

User input to analyze:`

export async function POST(req) {
  try {
    console.log("🔍 API analyze-meal called")

    const { userInput } = await req.json()
    console.log("📥 Received input:", userInput)

    if (!userInput || userInput.trim() === "") {
      console.log("❌ Empty input received")
      return NextResponse.json({ analysis: null })
    }

    console.log("🤖 Calling OpenAI with prompt...")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `${MEAL_ANALYSIS_PROMPT}\n\nUser input to analyze: ${userInput}`,
        },
      ],
      temperature: 0,
      maxTokens: 600,
    })

    console.log("🤖 OpenAI raw response:", text)

    let cleanedText = text.trim()

    // Remove code block markers if present
    if (cleanedText.startsWith("```json") && cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(7, -3).trim()
      console.log("🧹 Removed ```json markers")
    } else if (cleanedText.startsWith("```") && cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(3, -3).trim()
      console.log("🧹 Removed ``` markers")
    }

    if (cleanedText.startsWith("`") && cleanedText.endsWith("`")) {
      cleanedText = cleanedText.slice(1, -1).trim()
      console.log("🧹 Removed ` markers")
    }

    console.log("🧹 Cleaned text for parsing:", cleanedText)

    try {
      const analysis = JSON.parse(cleanedText)
      console.log("✅ Successfully parsed analysis:", analysis)
      return NextResponse.json({ analysis })
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError.message)
      console.error("❌ Attempted to parse:", cleanedText)

      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const extractedJson = jsonMatch[0]
          console.log("🔧 Attempting to parse extracted JSON:", extractedJson)
          const analysis = JSON.parse(extractedJson)
          console.log("✅ Successfully parsed extracted JSON:", analysis)
          return NextResponse.json({ analysis })
        } catch (extractError) {
          console.error("❌ Failed to parse extracted JSON:", extractError.message)
        }
      }

      // If all parsing fails, return a fallback analysis
      console.log("🔧 Creating fallback analysis for input:", userInput)
      const fallbackAnalysis = createFallbackAnalysis(userInput)
      console.log("🔧 Fallback analysis:", fallbackAnalysis)
      return NextResponse.json({ analysis: fallbackAnalysis })
    }
  } catch (error) {
    console.error("❌ API analyze-meal error:", error)

    // Create fallback analysis even on API error
    try {
      const { userInput } = await req.json()
      const fallbackAnalysis = createFallbackAnalysis(userInput)
      console.log("🔧 Error fallback analysis:", fallbackAnalysis)
      return NextResponse.json({ analysis: fallbackAnalysis })
    } catch (fallbackError) {
      console.error("❌ Fallback analysis failed:", fallbackError)
      return NextResponse.json({ analysis: null })
    }
  }
}

// Enhanced fallback analysis function
function createFallbackAnalysis(userInput) {
  const input = userInput.toLowerCase().trim()
  console.log("🔄 Creating enhanced fallback analysis for:", input)

  const analysis = {
    meals_eaten: [],
    current_weight: null,
    weight_unit: null,
    calories_burned: null,
    calories_consumed: null,
    protein: null,
    other_relevant_info: null,
    is_quantity_only: false,
    extracted_quantity: null,
  }

  // 1. Extract weight information
  const weightPatterns = [
    /(?:my\s+weight\s+is|i\s+weigh|weight\s+is|i(?:'m|am))\s+(\d+(?:\.\d+)?)\s*(kg|kilograms?|lbs?|pounds?)/i,
    /(\d+(?:\.\d+)?)\s*(kg|kilograms?|lbs?|pounds?)\s+(?:today|now|currently)/i,
  ]

  for (const pattern of weightPatterns) {
    const match = input.match(pattern)
    if (match) {
      const weightValue = Number.parseFloat(match[1])
      let unit = match[2].toLowerCase()

      // Normalize unit
      if (unit.includes("pound") || unit === "lbs" || unit === "lb") {
        unit = "lbs"
      } else if (unit.includes("kg") || unit.includes("kilogram")) {
        unit = "kg"
      }

      analysis.current_weight = weightValue
      analysis.weight_unit = unit
      console.log("✅ Found weight:", analysis.current_weight, analysis.weight_unit)
      break
    }
  }

  // 2. Extract calories information
  const caloriePatterns = [
    /(?:burned|burnt)\s*(\d+)\s*(?:calories?|kcal|cal)/i, // burned calories
    /(?:consumed|ate|had)\s*(\d+)\s*(?:calories?|kcal|cal)/i, // consumed calories
    /(\d+)\s*(?:calories?|kcal|cal)(?:\s+(?:burned|burnt))?/i, // general calories
  ]

  for (const pattern of caloriePatterns) {
    const match = input.match(pattern)
    if (match) {
      const calorieValue = Number.parseInt(match[1])

      if (pattern.source.includes("burned|burnt")) {
        analysis.calories_burned = calorieValue
        console.log("✅ Found burned calories:", analysis.calories_burned)
      } else if (pattern.source.includes("consumed|ate|had")) {
        analysis.calories_consumed = calorieValue
        console.log("✅ Found consumed calories:", analysis.calories_consumed)
      } else {
        // Default to consumed if not specified
        analysis.calories_consumed = calorieValue
        console.log("✅ Found calories (assumed consumed):", analysis.calories_consumed)
      }
      break
    }
  }

  // 3. Check if it's quantity only
  const quantityOnlyPatterns = [
    /^\d+$/, // Just numbers like "5"
    /^(one|two|three|four|five|six|seven|eight|nine|ten)$/, // Text numbers
    /^the quantity was \d+$/, // "the quantity was 5"
    /^the quantity was (one|two|three|four|five|six|seven|eight|nine|ten)$/, // "the quantity was five"
    /^\d+\s*(cups?|pieces?|slices?|grams?|g|kg|ounces?|oz|servings?|serving)$/, // "5 cups"
  ]

  const isQuantityOnly = quantityOnlyPatterns.some((pattern) => pattern.test(input))

  if (isQuantityOnly) {
    // Extract quantity
    let extractedQuantity = input

    // Convert text numbers to digits
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

    Object.keys(textNumbers).forEach((word) => {
      extractedQuantity = extractedQuantity.replace(new RegExp(`\\b${word}\\b`, "g"), textNumbers[word])
    })

    // Clean up "the quantity was" prefix
    extractedQuantity = extractedQuantity.replace(/^the quantity was\s*/, "")

    analysis.is_quantity_only = true
    analysis.extracted_quantity = extractedQuantity.trim()
    console.log("✅ Found quantity only:", analysis.extracted_quantity)
    return analysis
  }

  // 4. Extract meals with enhanced pattern matching
  const mealExtractionPatterns = [
    // Pattern: "ate 5 apples in dinner"
    /(?:ate|had|consumed)\s+(\d+)\s+([a-zA-Z]+)(?:s)?\s+in\s+(breakfast|lunch|dinner|snack)/gi,
    // Pattern: "5 apples in dinner"
    /(\d+)\s+([a-zA-Z]+)(?:s)?\s+in\s+(breakfast|lunch|dinner|snack)/gi,
    // Pattern: "ate 5 apples for dinner"
    /(?:ate|had|consumed)\s+(\d+)\s+([a-zA-Z]+)(?:s)?\s+for\s+(breakfast|lunch|dinner|snack)/gi,
    // Pattern: "5 apples for dinner"
    /(\d+)\s+([a-zA-Z]+)(?:s)?\s+for\s+(breakfast|lunch|dinner|snack)/gi,
  ]

  for (const pattern of mealExtractionPatterns) {
    let match
    while ((match = pattern.exec(input)) !== null) {
      const quantity = match[1]
      let foodName = match[2].toLowerCase()
      const mealType = match[3].toLowerCase()

      // Normalize food names (remove plural 's' if needed)
      if (foodName.endsWith("s") && foodName.length > 3) {
        // Check if it's likely a plural (simple heuristic)
        const singular = foodName.slice(0, -1)
        if (!["glass", "grass", "class"].includes(foodName)) {
          foodName = singular
        }
      }

      analysis.meals_eaten.push({
        name: foodName,
        quantity: quantity,
        meal_type: mealType,
      })

      console.log(`✅ Found meal: ${quantity} ${foodName} for ${mealType}`)
    }
  }

  // 5. Fallback meal extraction for simpler patterns
  if (analysis.meals_eaten.length === 0) {
    const simpleMealPatterns = [/(?:ate|had|consumed)\s+(.+)/i, /i\s+ate\s+(.+)/i]

    for (const pattern of simpleMealPatterns) {
      const match = input.match(pattern)
      if (match) {
        const foodText = match[1].trim()

        // Try to extract food items from the text
        const foodWords = foodText.split(/\s+and\s+|\s*,\s*/)

        for (const foodItem of foodWords) {
          const cleanFood = foodItem.replace(/\b(in|for|at|during)\s+(breakfast|lunch|dinner|snack)\b/g, "").trim()

          if (cleanFood && cleanFood.length > 2) {
            analysis.meals_eaten.push({
              name: cleanFood,
              quantity: "1",
              meal_type: null,
            })
            console.log(`✅ Found simple meal: ${cleanFood}`)
          }
        }
        break
      }
    }
  }

  console.log("🔧 Final fallback analysis:", analysis)
  return analysis
}

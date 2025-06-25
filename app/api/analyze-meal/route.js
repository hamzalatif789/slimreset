import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"

const MEAL_ANALYSIS_PROMPT = `You are an expert NLP assistant analyzing a user's message about their food intake and health.
Only put meal here if user has confirmed eating/taking/consuming of meal.

From the user's input, extract the following structured information ONLY in JSON format with these exact keys:
{
  "meals_eaten": [
    {
      "name": <string: food label or meal name, e.g. "chicken breast">,
      "quantity": <string|null: Any valid quantity consumed, including units if specified, or null if missing e.g. "150 grams", "2 slices">,
      "meal_type": <string|null: one of "breakfast", "lunch", "dinner", "snack", or null if missing>
    },
    ...
  ],
  "current_weight": <number|null>,
  "calories_burned": <number|null>,
  "protein": <number|null>,
  "other_relevant_info": <string|null>,
  "is_quantity_only": <boolean: true if the message only contains quantity information without mentioning food>,
  "extracted_quantity": <string|null: if is_quantity_only is true, extract the clean quantity value>
}

IMPORTANT RULES FOR QUANTITY EXTRACTION:
- Convert text numbers to digits (e.g., "five" -> "5", "two" -> "2")
- For quantity-only inputs, extract ONLY the number and unit if specified
- If user says just a number like "3" or "5", return just the number (e.g., "3", "5")
- If user specifies a unit like "3 cups" or "2 slices", return with the unit (e.g., "3 cups", "2 slices")
- If user says "the quantity was 5", return just "5"
- If user says "the quantity was 5 serving", return "5 serving"
- DO NOT add default units like "serving" unless explicitly mentioned by the user
- Set "is_quantity_only" to true ONLY if the input contains quantity information without any food names

Examples:
Input: "i ate apple" -> {"meals_eaten": [{"name": "apple", "quantity": null, "meal_type": null}], "current_weight": null, "calories_burned": null, "protein": null, "other_relevant_info": null, "is_quantity_only": false, "extracted_quantity": null}

Input: "i ate mango in breakfast" -> {"meals_eaten": [{"name": "mango", "quantity": null, "meal_type": "breakfast"}], "current_weight": null, "calories_burned": null, "protein": null, "other_relevant_info": null, "is_quantity_only": false, "extracted_quantity": null}

Input: "3" -> {"meals_eaten": [], "current_weight": null, "calories_burned": null, "protein": null, "other_relevant_info": null, "is_quantity_only": true, "extracted_quantity": "3"}

Input: "five" -> {"meals_eaten": [], "current_weight": null, "calories_burned": null, "protein": null, "other_relevant_info": null, "is_quantity_only": true, "extracted_quantity": "5"}

Input: "the quantity was 2" -> {"meals_eaten": [], "current_weight": null, "calories_burned": null, "protein": null, "other_relevant_info": null, "is_quantity_only": true, "extracted_quantity": "2"}

Input: "the quantity was five" -> {"meals_eaten": [], "current_weight": null, "calories_burned": null, "protein": null, "other_relevant_info": null, "is_quantity_only": true, "extracted_quantity": "5"}

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
      maxTokens: 400,
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

// Fallback analysis function for when OpenAI fails
function createFallbackAnalysis(userInput) {
  const input = userInput.toLowerCase().trim()

  // Check if it's a quantity-only input
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

    // Don't add "serving" here - let the client handle it to avoid duplication
    return {
      meals_eaten: [],
      current_weight: null,
      calories_burned: null,
      protein: null,
      other_relevant_info: null,
      is_quantity_only: true,
      extracted_quantity: extractedQuantity.trim(),
    }
  }

  // Check if it's a meal input
  const mealPatterns = [/i ate (.+)/, /i had (.+)/, /i consumed (.+)/, /ate (.+)/, /had (.+)/]

  for (const pattern of mealPatterns) {
    const match = input.match(pattern)
    if (match) {
      const foodText = match[1].trim()

      // Extract meal type
      let mealType = null
      if (foodText.includes("breakfast") || input.includes("breakfast")) mealType = "breakfast"
      else if (foodText.includes("lunch") || input.includes("lunch")) mealType = "lunch"
      else if (foodText.includes("dinner") || input.includes("dinner")) mealType = "dinner"
      else if (foodText.includes("snack") || input.includes("snack")) mealType = "snack"

      // Extract food name (remove meal type words)
      const foodName = foodText
        .replace(/\b(in|for|at|during)\s+(breakfast|lunch|dinner|snack)\b/g, "")
        .replace(/\b(breakfast|lunch|dinner|snack)\b/g, "")
        .trim()

      return {
        meals_eaten: [
          {
            name: foodName,
            quantity: null,
            meal_type: mealType,
          },
        ],
        current_weight: null,
        calories_burned: null,
        protein: null,
        other_relevant_info: null,
        is_quantity_only: false,
        extracted_quantity: null,
      }
    }
  }

  // Default fallback - no meal detected
  return {
    meals_eaten: [],
    current_weight: null,
    calories_burned: null,
    protein: null,
    other_relevant_info: null,
    is_quantity_only: false,
    extracted_quantity: null,
  }
}

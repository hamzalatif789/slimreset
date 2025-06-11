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
                                                "current_weight": <number|null>,          // weight in kilograms if mentioned, else null
                                                "calories_burned": <number|null>,         // calories burned if mentioned, else null
                                                "protein": <number|null>,                  // protein intake in grams if mentioned, else null
                                                "other_relevant_info": <string|null>      // any other relevant health or diet info, else null
                                              }

                                              - If multiple foods/meals are mentioned, list each as a separate object in the "meals_eaten" array.
                                              - If quantity or meal_type for a meal is not explicitly mentioned or unclear, set it to null.
                                              - Return ONLY the JSON object. Do NOT include any explanations, markdown, or extra text.
                                              - Example user input: "For lunch I ate 200 grams of chicken breast and a small apple, then for dinner just egg whites."
                                              - Example output:

                                              {
                                                "meals_eaten": [
                                                  {
                                                    "name": "chicken breast",
                                                    "quantity": "200 grams",
                                                    "meal_type": "lunch"
                                                  },
                                                  {
                                                    "name": "apple",
                                                    "quantity": "small",
                                                    "meal_type": "lunch"
                                                  },
                                                  {
                                                    "name": "egg whites",
                                                    "quantity": null,
                                                    "meal_type": "dinner"
                                                  }
                                                ],
                                                "current_weight": null,
                                                "calories_burned": null,
                                                "protein": null,
                                                "other_relevant_info": null
                                              }

                                              User input to analyze:`

export async function POST(req) {
  try {
    const { userInput } = await req.json()

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `${MEAL_ANALYSIS_PROMPT}\n\nUser input to analyze: ${userInput}`,
        },
      ],
      temperature: 0,
      maxTokens: 300,
    })

    let cleanedText = text.trim()
    if (cleanedText.startsWith("```") && cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(3, -3).trim()
    }
    if (cleanedText.startsWith("`") && cleanedText.endsWith("`")) {
      cleanedText = cleanedText.slice(1, -1).trim()
    }

    try {
      const analysis = JSON.parse(cleanedText)
      return NextResponse.json({ analysis })
    } catch (parseError) {
      console.error("Failed to parse meal analysis:", cleanedText)
      return NextResponse.json({ analysis: null })
    }
  } catch (error) {
    console.error("Meal analysis API error:", error)
    return NextResponse.json({ analysis: null })
  }
}

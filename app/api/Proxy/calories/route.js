import { NextResponse } from "next/server";

export async function GET() {
  console.log("✅ Calories proxy GET route called");
  try {
    const response = await fetch("https://getslimreset.vercel.app/api/calories");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in calories GET:", error);
    return NextResponse.json({ error: "Failed to fetch calories data" }, { status: 500 });
  }
}

export async function POST(request) {
  console.log("✅ Calories proxy POST route called");
  try {
    const body = await request.json();
    console.log("📤 Sending to external API:", body);
    
    const response = await fetch("https://getslimreset.vercel.app/api/calories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ External API response:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in calories POST:", error);
    return NextResponse.json(
      { error: error.message || "Failed to store calories data" },
      { status: 500 }
    );
  }
}
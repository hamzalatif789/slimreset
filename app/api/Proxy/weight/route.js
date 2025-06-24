import { NextResponse } from "next/server";

export async function GET() {
  // console.log("✅ Weight proxy GET route called");
  try {
    const response = await fetch("https://getslimreset.vercel.app/api/weight");
    const data = await response.json();
    console.log("📥 Received data from external API:", data);
  
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("❌ Error in weight GET:", error);
    return NextResponse.json({ error: "Failed to fetch weight data" }, { status: 500 });
  }
}


export async function POST(request) {
  // console.log("✅ Weight proxy POST route called");
  try {
    const body = await request.json();
    console.log("📤 Sending to external API:", body);
    
    const response = await fetch("https://getslimreset.vercel.app/api/weight", {
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
    // console.log("✅ External API response:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in weight POST:", error);
    return NextResponse.json(
      { error: error.message || "Failed to store weight data" },
      { status: 500 }
    );
  }
}
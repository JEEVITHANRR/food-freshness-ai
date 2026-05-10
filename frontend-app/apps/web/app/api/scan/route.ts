import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const apiKey = formData.get("api_key") as string || process.env.GEMINI_API_KEY;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Gemini API key is required. Please provide one in Settings or set GEMINI_API_KEY environment variable." }, { status: 400 });
    }

    // Initialize Gemini with the most compatible model
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as default, it's the most widely available
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const prompt = `
      Analyze this food image and provide a structured JSON response.
      Identify all food items, their estimated quantity, and their freshness status (Fresh, Slightly Aged, or Rotten).
      
      Return ONLY a JSON object with this exact structure:
      {
        "total_count": number,
        "model_used": "gemini-1.5-flash",
        "items": [
          {
            "name": "item name",
            "count": number,
            "category": "Fruit/Vegetable/Protein/Dairy/etc",
            "freshness": "Fresh/Slightly Aged/Rotten",
            "freshness_confidence": number (0 to 1)
          }
        ]
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response text (Gemini sometimes adds markdown blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    const data = JSON.parse(jsonString);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("AI Scan Error:", error);
    return NextResponse.json({ success: false, error: error.message || "An error occurred during scanning" }, { status: 500 });
  }
}

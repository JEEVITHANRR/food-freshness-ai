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

    // Cleaned up list of modern, stable Gemini models
    const modelsToTry = [
      "gemini-1.5-flash", 
      "gemini-1.5-pro", 
      "gemini-1.5-flash-8b"
    ];
    let lastError: any = null;
    let data = null;

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this food image and provide a structured JSON response.
      Identify all food items, their estimated quantity, and their freshness status (Fresh, Slightly Aged, or Rotten).
      
      Return ONLY a JSON object with this exact structure:
      {
        "total_count": number,
        "model_used": "string",
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

    // Initialize genAI with v1 for maximum compatibility
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try models one by one
    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying Gemini model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

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
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;
        data = JSON.parse(jsonString);
        data.model_used = modelName;
        
        break; // Success!
      } catch (err: any) {
        lastError = err;
        console.error(`Gemini Error (${modelName}):`, err.message);
        continue;
      }
    }

    if (!data) {
      // Diagnostic step: Try to list available models to see what the key can actually access
      let availableModels = "Unknown";
      try {
        const listResult = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
        availableModels = JSON.stringify(listResult);
      } catch (listErr: any) {
        availableModels = `Failed to list: ${listErr.message}`;
      }

      return NextResponse.json({ 
        success: false, 
        error: `All AI models failed. Last error: ${lastError?.message || "Unknown error"}. 
        
        🔍 Diagnostics:
        - Last model tried: ${modelsToTry[modelsToTry.length - 1]}
        - Available models for your key: ${availableModels}
        
        💡 Troubleshooting: 
        1. Ensure your API Key is from AI Studio (aistudio.google.com).
        2. Ensure the 'Generative Language API' is enabled.
        3. Try creating a NEW API key if this one is old.`
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("AI Scan Error:", error);
    return NextResponse.json({ success: false, error: error.message || "An error occurred during scanning" }, { status: 500 });
  }
}

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// ✅ New Gemini SDK (NOT @google/generative-ai)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No image uploaded",
      });
    }

    // 📷 Read image file
    const imagePath = path.resolve(file.path);
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    // 🌱 Structured agricultural AI prompt
    const prompt = `
You are an agricultural expert AI system specializing in plant disease diagnosis.

Analyze the provided image carefully and determine:
1. Is this image showing a plant/crop? If NOT (e.g., person, animal, object, scenery), respond with: {"error": "Please upload a valid plant image."}
2. If it IS a plant, identify any diseases or confirm if healthy.

Return a JSON response ONLY in this exact format:
{
  "disease": "name of the disease or 'Healthy Plant'",
  "description": "detailed explanation of symptoms, causes, and impact (2-3 sentences)",
  "cure": "comprehensive treatment plan including fungicides, organic solutions, and preventive measures (3-4 sentences)",
  "cropInfo": {
    "type": "specific crop name with scientific name in parentheses",
    "properties": [
      "property 1 about growth requirements",
      "property 2 about care needs",
      "property 3 about common issues",
      "property 4 about harvesting",
      "property 5 about benefits or uses"
    ]
  }
}

IMPORTANT:
- Respond ONLY with valid JSON
- No markdown
- No code blocks
- No extra text
`;

    // ⏱️ Timeout protection (30s)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI request timeout")), 30000)
    );

    // 🧠 Gemini Vision Request (UPDATED API)
    const aiPromise = ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.mimetype,
                data: imageBase64, // base64 WITHOUT data:image prefix
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const result = await Promise.race([aiPromise, timeoutPromise]);

    // 🧾 Extract raw AI text safely
    const rawText = result.text || "";

    let parsed;
    try {
      // Remove markdown if model still sends it
      let cleanText = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Extract JSON object if extra text exists
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      parsed = JSON.parse(cleanText);

      // Validate structure
      if (!parsed.disease || !parsed.description || !parsed.cure) {
        throw new Error("Invalid AI response structure");
      }
    } catch (parseError) {
      console.warn("⚠️ JSON parsing failed:", parseError.message);
      console.warn("Raw AI response:", rawText);

      // Fallback structured response
      parsed = {
        disease: "Analysis Completed",
        description:
          rawText?.substring(0, 300) ||
          "AI analysis completed but structured parsing failed.",
        cure: "Please consult a local agricultural expert for precise treatment.",
        cropInfo: {
          type: "Unknown Crop",
          properties: [
            "Manual expert review recommended",
            "Image quality may be insufficient",
          ],
        },
      };
    }

    // 🚫 Non-plant image detection
    if (parsed.error) {
      fs.unlinkSync(imagePath);
      return res.status(400).json({
        success: false,
        message: parsed.error,
      });
    }

    // 🧹 Cleanup uploaded file
    try {
      fs.unlinkSync(imagePath);
    } catch (cleanupError) {
      console.warn(
        "Could not delete uploaded file:",
        cleanupError.message
      );
    }

    return res.status(200).json({
      success: true,
      analysis: parsed,
    });
  } catch (error) {
    console.error("Error in analyzeImage:", error);

    let errorMessage = "Failed to analyze image.";
    let statusCode = 500;

    if (error.message.includes("API key")) {
      errorMessage =
        "Invalid Gemini API key. Please check your .env file.";
      statusCode = 401;
    } else if (error.message.includes("timeout")) {
      errorMessage =
        "AI analysis timed out. Try a smaller image (under 5MB).";
      statusCode = 408;
    } else if (error.message.includes("quota")) {
      errorMessage = "API quota exceeded. Please check Gemini billing.";
      statusCode = 429;
    }

    // Cleanup on error
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn("Cleanup failed:", cleanupError.message);
      }
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// 🔍 Debug route (optional)
export const listModels = async (req, res) => {
  try {
    const models = await ai.models.list();
    res.json({
      success: true,
      models: models.map((m) => m.name),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

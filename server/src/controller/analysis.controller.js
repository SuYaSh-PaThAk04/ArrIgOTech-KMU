import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────
//  In-memory diagnosis history (per-process)
//  For production, swap with a DB call.
// ─────────────────────────────────────────────
const diagnosisHistory = [];

// ─────────────────────────────────────────────
//  ANALYZE IMAGE  (core disease-detection)
// ─────────────────────────────────────────────
export const analyzeImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: "No image uploaded" });
    }

    // Pull optional context from the request body
    const {
      location = "",          // e.g. "Punjab, India"
      dialect = "en",         // e.g. "hi" | "pa" | "te" | "mr" | "en"
      cropType = "",          // hint for the model
    } = req.body;

    // Read & encode image
    const imagePath = path.resolve(file.path);
    const imageBase64 = fs.readFileSync(imagePath).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ── Build localisation instructions ──────────────────────────────
    const dialectMap = {
      hi: "Hindi",
      pa: "Punjabi",
      te: "Telugu",
      mr: "Marathi",
      bn: "Bengali",
      gu: "Gujarati",
      kn: "Kannada",
      en: "English",
    };
    const langName = dialectMap[dialect] || "English";

    const locationCtx = location
      ? `The farmer is located in: ${location}. Tailor pesticide brands, soil amendments, and seasonal advice to this region.`
      : "";

    const prompt = `
You are an expert agricultural AI specializing in plant disease and pest diagnosis.

${locationCtx}
${cropType ? `Crop hint provided by farmer: ${cropType}` : ""}

Analyze the image carefully and respond ONLY with a valid JSON object (no markdown, no code blocks) in EXACTLY this structure:

{
  "disease": "Disease / pest name or 'Healthy Plant'",
  "severity": "Low | Moderate | High | Critical",
  "confidence": 85,
  "description": {
    "en": "2-3 sentence explanation of symptoms, pathogen/pest, and how it spreads.",
    "${dialect}": "Same content in ${langName}. If dialect is 'en', repeat the English text."
  },
  "pestInfo": {
    "causativeAgent": "Fungus / Bacteria / Virus / Insect / Nematode / Nutritional / Environmental",
    "scientificName": "Scientific name if applicable",
    "spreadMechanism": "How it spreads (wind, water, insects, soil, etc.)"
  },
  "cure": {
    "chemical": [
      { "product": "Product name", "activeIngredient": "e.g. Mancozeb 75% WP", "dosage": "2g/L water", "frequency": "Every 7 days", "safetyInterval": "14 days before harvest" }
    ],
    "organic": [
      { "remedy": "Neem oil spray", "preparation": "5ml/L water + few drops dish soap", "frequency": "Every 5 days" }
    ],
    "soilTreatment": "Lime application / bio-fungicide drenching / etc. (or 'Not required')",
    "preventive": "3-4 sentence preventive strategy."
  },
  "locationRecommendations": "${location ? `Specific advice for ${location} region including locally available products, best application timing considering local climate, and government extension service contacts if known.` : "General regional advice — location not provided."}",
  "sevenDayPlan": [
    { "day": "Day 1", "action": "Immediate action to take" },
    { "day": "Day 2", "action": "" },
    { "day": "Day 3", "action": "" },
    { "day": "Day 4", "action": "" },
    { "day": "Day 5", "action": "" },
    { "day": "Day 6", "action": "" },
    { "day": "Day 7", "action": "Assessment and next steps" }
  ],
  "cropInfo": {
    "type": "Crop common name (Scientific name)",
    "growingConditions": "Temperature, soil, water requirements",
    "commonPests": ["Pest 1", "Pest 2", "Pest 3"],
    "harvestInfo": "Harvest timing and indicators",
    "properties": [
      "Key fact 1",
      "Key fact 2",
      "Key fact 3",
      "Key fact 4",
      "Key fact 5"
    ]
  },
  "voiceNote": "A SHORT 2-sentence farmer-friendly summary in ${langName} that could be read aloud."
}

RULES:
- If NOT a plant image → { "error": "Please upload a valid plant or crop image." }
- Respond ONLY with valid JSON. No extra text, no markdown fences.
- Be specific, practical, and actionable.
- sevenDayPlan must have exactly 7 entries.
`;

    // ── Call Gemini with timeout ──────────────────────────────────────
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI request timeout")), 35000)
    );

    const result = await Promise.race([
      model.generateContent([
        { inlineData: { mimeType: file.mimetype, data: imageBase64 } },
        { text: prompt },
      ]),
      timeoutPromise,
    ]);

    const rawText = result.response.text();

    // ── Parse JSON ────────────────────────────────────────────────────
    let parsed;
    try {
      let clean = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) clean = match[0];
      parsed = JSON.parse(clean);

      if (!parsed.disease && !parsed.error) throw new Error("Invalid structure");
    } catch {
      parsed = {
        disease: "Analysis Complete",
        severity: "Unknown",
        confidence: 50,
        description: { en: rawText.substring(0, 300), [dialect]: rawText.substring(0, 300) },
        pestInfo: { causativeAgent: "Unknown", scientificName: "-", spreadMechanism: "-" },
        cure: {
          chemical: [],
          organic: [],
          soilTreatment: "Consult local agronomist",
          preventive: "Please consult an agricultural expert.",
        },
        locationRecommendations: "Location-specific advice unavailable.",
        sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
          day: `Day ${i + 1}`,
          action: i === 0 ? "Consult local agricultural extension officer." : "Monitor crop closely.",
        })),
        cropInfo: { type: "Unknown", properties: ["Manual review recommended"] },
        voiceNote: "Analysis incomplete. Please consult an expert.",
      };
    }

    // ── Non-plant image ───────────────────────────────────────────────
    if (parsed.error) {
      try { fs.unlinkSync(imagePath); } catch {}
      return res.status(400).json({ success: false, message: parsed.error });
    }

    // ── Persist to history ────────────────────────────────────────────
    const historyEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      location,
      dialect,
      imageName: file.originalname,
      disease: parsed.disease,
      severity: parsed.severity,
      confidence: parsed.confidence,
      cropType: parsed.cropInfo?.type || cropType,
    };
    diagnosisHistory.unshift(historyEntry);
    if (diagnosisHistory.length > 100) diagnosisHistory.pop(); // keep last 100

    // ── Cleanup ───────────────────────────────────────────────────────
    try { fs.unlinkSync(imagePath); } catch {}

    return res.status(200).json({
      success: true,
      historyId: historyEntry.id,
      analysis: parsed,
    });
  } catch (error) {
    console.error("analyzeImage error:", error);

    let message = "Failed to analyze image.";
    let status = 500;

    if (error.message.includes("API key not valid")) { message = "Invalid Gemini API key."; status = 401; }
    else if (error.message.includes("404"))          { message = "AI model not found."; }
    else if (error.message.includes("timeout"))      { message = "Analysis timed out. Try a smaller image."; status = 408; }
    else if (error.message.includes("quota"))        { message = "API quota exceeded. Try again later."; status = 429; }

    if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch {} }

    return res.status(status).json({
      success: false,
      message,
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────
//  GET DIAGNOSIS HISTORY
// ─────────────────────────────────────────────
export const getDiagnosisHistory = (_req, res) => {
  return res.status(200).json({ success: true, history: diagnosisHistory });
};

// ─────────────────────────────────────────────
//  TEXT-TO-SPEECH helper  (returns SSML hint)
//  Integrate with Google TTS / AWS Polly / etc.
// ─────────────────────────────────────────────
export const getVoiceNote = async (req, res) => {
  const { text, lang = "en-IN" } = req.body;
  if (!text) return res.status(400).json({ success: false, error: "No text provided." });

  // In production, call Google Cloud TTS here and return audio URL / base64.
  // For now we return the text with language metadata so the frontend can use
  // the Web Speech API (SpeechSynthesis).
  return res.status(200).json({
    success: true,
    voiceNote: { text, lang },
  });
};

// ─────────────────────────────────────────────
//  LIST AVAILABLE MODELS  (debug)
// ─────────────────────────────────────────────
export const listModels = async (_req, res) => {
  try {
    const models = await genAI.listModels();
    return res.json({
      success: true,
      models: models.map((m) => ({ name: m.name, description: m.description })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
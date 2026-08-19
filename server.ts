import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy GoogleGenAI client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Solve Math / Physics from Image or Text
app.post("/api/solve", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", textPrompt } = req.body;

    if (!imageBase64 && !textPrompt) {
      return res.status(400).json({ error: "Please provide an image or problem text." });
    }

    const ai = getAIClient();

    const systemInstruction = `You are SolveStep, an expert AI math and physics solver and tutor.
Your goal is to detect math or physics equations/problems from handwritten or printed images (or text), identify core concepts, and provide rigorous, pedagogy-focused step-by-step solutions with rich standard LaTeX math formatting.

Rules:
1. Detect the problem statement clearly. If it's an equation, transcribe it precisely using LaTeX.
2. Identify the subject (Math or Physics), the topic, and difficulty level.
3. List 2-4 foundational concepts or physical laws required to understand this problem. Include standard LaTeX formulas for each concept.
4. Give a clear 1-2 sentence high-level solution roadmap/summary before jumping into details.
5. Provide detailed, logically ordered steps. For each step:
   - Provide a clear title (e.g., "Step 1: Express velocity in component form").
   - Provide a plain-language explanation of what is happening and why.
   - Provide the exact mathematical derivation or manipulation formatted in LaTeX (e.g. using \\frac, \\int, \\sqrt, \\vec, \\pmatrix, etc.).
   - Mention any key rule, theorem, or insight applied in that step.
6. Provide the final simplified answer with LaTeX and units (if applicable).
7. List 1-3 common pitfalls or mistakes students make on this type of problem.
8. If physics, list any physical constants used (e.g., g = 9.8 m/s^2).`;

    const parts: any[] = [];

    if (imageBase64) {
      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const userPrompt = textPrompt
      ? `Solve this problem thoroughly with step-by-step breakdown and concepts: ${textPrompt}`
      : "Analyze this image containing a math or physics problem. Extract the exact equation/problem, break down the core scientific/mathematical concepts, and provide a clear step-by-step solution formatted with LaTeX.";

    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedText: {
              type: Type.STRING,
              description: "Transcribed problem statement with LaTeX formatted equations where appropriate",
            },
            subject: {
              type: Type.STRING,
              description: "Subject area: Math or Physics",
            },
            topic: {
              type: Type.STRING,
              description: "Specific topic, e.g. Calculus: Integration by Substitution or Kinematics: 2D Projectile Motion",
            },
            difficulty: {
              type: Type.STRING,
              description: "Beginner, Intermediate, Advanced, or Olympiad",
            },
            summary: {
              type: Type.STRING,
              description: "High-level summary of the solution strategy",
            },
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  formulaLatex: { type: Type.STRING },
                  whyItApplies: { type: Type.STRING },
                },
                required: ["title", "description", "formulaLatex"],
              },
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  mathLatex: { type: Type.STRING },
                  keyInsight: { type: Type.STRING },
                },
                required: ["stepNumber", "title", "explanation", "mathLatex"],
              },
            },
            finalAnswer: {
              type: Type.OBJECT,
              properties: {
                latex: { type: Type.STRING },
                text: { type: Type.STRING },
                units: { type: Type.STRING },
              },
              required: ["latex", "text"],
            },
            commonPitfalls: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            constantsUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            verificationCheck: {
              type: Type.STRING,
              description: "A quick sanity check or alternate verification method to check the answer",
            },
          },
          required: ["detectedText", "subject", "topic", "difficulty", "summary", "concepts", "steps", "finalAnswer"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const solutionData = JSON.parse(cleanJson);
    return res.json({ success: true, data: solutionData });
  } catch (error: any) {
    console.error("Solve API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to solve the problem. Please check your image or input.",
    });
  }
});

// 2. Practice Similar Problem Generator
app.post("/api/practice-similar", async (req, res) => {
  try {
    const { originalProblem, topic, concepts, difficulty } = req.body;

    if (!originalProblem && !topic) {
      return res.status(400).json({ error: "Missing original problem context." });
    }

    const ai = getAIClient();

    const systemInstruction = `You are SolveStep's Practice Problem Generator.
Given an original math or physics problem and its topic, generate a novel, pedagogical 'Practice Similar' problem that tests the exact same concepts with different numerical values, context, or variable configurations.

Provide:
1. A fresh problem statement with clean LaTeX formatting.
2. A helpful hint that guides the student without giving away the full answer.
3. Complete step-by-step solution with LaTeX formulas.
4. Final answer in LaTeX and plain text.
5. A key takeaway explaining why practicing this variant reinforces mastery.`;

    const userPrompt = `Generate a similar practice problem based on:
Original Problem: ${originalProblem || "Standard problem"}
Topic: ${topic || "Math/Physics"}
Difficulty: ${difficulty || "Intermediate"}
Concepts: ${JSON.stringify(concepts || [])}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemStatement: {
              type: Type.STRING,
              description: "The new practice problem statement with LaTeX equations",
            },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            hint: {
              type: Type.STRING,
              description: "A gentle hint pointing to the right formula or setup without revealing the answer",
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  mathLatex: { type: Type.STRING },
                },
                required: ["stepNumber", "title", "explanation", "mathLatex"],
              },
            },
            finalAnswer: {
              type: Type.OBJECT,
              properties: {
                latex: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ["latex", "text"],
            },
            keyTakeaway: { type: Type.STRING },
          },
          required: ["problemStatement", "hint", "steps", "finalAnswer"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    const cleanJson = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const practiceData = JSON.parse(cleanJson);
    return res.json({ success: true, data: practiceData });
  } catch (error: any) {
    console.error("Practice Similar API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate practice problem.",
    });
  }
});

// 3. Step Doubt / Question Explainer
app.post("/api/ask-doubt", async (req, res) => {
  try {
    const { problemText, stepTitle, stepMath, userQuestion } = req.body;

    if (!userQuestion) {
      return res.status(400).json({ error: "Please enter your question." });
    }

    const ai = getAIClient();

    const prompt = `The user is studying a math/physics problem:
Problem: ${problemText || "N/A"}
Specific Step: ${stepTitle || "Step"} - Math: ${stepMath || "N/A"}
User's Question/Confusion: "${userQuestion}"

Explain this step clearly, intuitively, and patiently with LaTeX formulas where helpful.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an empathetic, clear math & physics tutor. Answer the student's question directly with intuitive explanations and clean LaTeX math.",
      },
    });

    return res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error("Ask Doubt Error:", error);
    return res.status(500).json({ error: error.message || "Failed to answer question." });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SolveStep server running on http://localhost:${PORT}`);
  });
}

startServer();

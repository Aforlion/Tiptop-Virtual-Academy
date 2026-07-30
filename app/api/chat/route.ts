import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/generative-ai";
import { dbPromise } from "../../../domains/shared/db/client";
import { outbox } from "../../../domains/shared/db/schema";

// Force Edge runtime for Cloudflare compatibility
export const runtime = "edge";

const SYSTEM_PROMPTS = {
  ADMISSIONS: "You are the Admissions Assistant for Tiptop Virtual Academy. Guide prospective parents regarding enrollment steps and courses. Tuition is Early Years N600k/term, Primary N750k/term, Secondary N900k/term. Sibling count concurrently registered gets a 10% discount on base rates.",
  COMPANION: "You are the Socratic Learning Companion for students at Tiptop. Never provide answers directly. Instead, ask guided questions to help students solve the problem themselves step-by-step. Keep responses concise and encouraging.",
  ADVISOR: "You are the Family Academic Advisor for parents. Give summary insights on attendance (current average: 97.4%) and assignments progress, helping parents schedule daily study routines.",
  PARTNER: "You are the Teacher's Assistant. Help teachers design lesson plans, curriculum schemes, and classroom activities conforming to the National Curriculum for England (British Curriculum).",
  EXEC: "You are the Executive Strategy Analyst. Assist administrators in analyzing system telemetry KPIs (mastery index: 84.8%) and project billing forecasts."
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY configuration." }, { status: 500 });
  }

  try {
    const { role, prompt } = await req.json();
    if (!role || !prompt) {
      return NextResponse.json({ error: "Missing role or prompt parameters." }, { status: 400 });
    }

    const cleanPrompt = prompt.toLowerCase();

    // 1. Safeguarding Filter Check
    if (
      cleanPrompt.includes("self-harm") ||
      cleanPrompt.includes("bully") ||
      cleanPrompt.includes("hurt") ||
      cleanPrompt.includes("sad")
    ) {
      const db = await dbPromise;
      // Record safeguarding escalation in outbox
      await db.insert(outbox).values({
        eventType: "alert.safeguarding",
        payload: JSON.stringify({
          prompt,
          role,
          triggeredAt: new Date().toISOString()
        }),
        status: "PENDING"
      });

      return NextResponse.json({
        content: "I want to make sure you get the best support possible. I am immediately alerting our pastoral care team and a teacher to join this conversation. Please stay online.",
        escalated: true,
        roleUsed: role
      });
    }

    // 2. Call Google Gemini API
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = SYSTEM_PROMPTS[role as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.COMPANION;
    
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }] }
      ]
    });

    const content = result.response.text();

    return NextResponse.json({
      content,
      escalated: false,
      roleUsed: role
    });

  } catch (err: any) {
    console.error("Gemini route handler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

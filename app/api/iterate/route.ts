import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { AppSpec } from "@/lib/types";
import {
  extractJsonFromText,
  normalizeAppSpec,
  createIteratedFallbackAppSpec,
} from "@/lib/app-spec";

const ITERATE_SYSTEM_PROMPT = `You are an AI app iteration architect. You receive:
1. The original user request (prompt)
2. The current app specification (currentAppSpec)
3. A modification instruction (instruction)

Your job is to return a COMPLETE updated AppSpec that incorporates the instruction while preserving what still makes sense from the original.

Return ONLY a JSON object. No markdown, no explanation, no code blocks.

JSON structure:
{
  "name": "string",
  "description": "string",
  "pages": ["string"],
  "components": ["string"],
  "features": ["string"],
  "theme": "light",
  "interactivePreview": {
    "primaryEntityName": "string",
    "tabs": ["string"],
    "defaultTab": "string",
    "formTitle": "string",
    "formFields": [
      {"id": "string", "label": "string", "type": "text", "placeholder": "string", "options": ["string"], "required": false}
    ],
    "sampleRecords": [
      {"id": "string", "title": "string", "subtitle": "string", "amount": 0, "type": "neutral", "category": "string", "status": "string", "createdAt": "string"}
    ],
    "metrics": [
      {"id": "string", "label": "string", "value": "string", "hint": "string"}
    ],
    "actions": [
      {"id": "string", "label": "string", "type": "add_record"}
    ]
  }
}

Rules:
- Return the FULL AppSpec, not just changes
- Keep existing pages/components/features that are still relevant
- Make clear changes based on the instruction
- If instruction says "dark theme", set theme to "dark"
- If instruction says "add stats page", add it to pages and tabs
- "theme" must be: "light", "dark", or "colorful"
- "field.type" must be: "text", "number", "select", "textarea"
- "record.type" must be: "income", "expense", "neutral"
- "action.type" must be: "add_record", "delete_record", "toggle_status", "switch_tab"
- tabs >= 3, formFields >= 3, sampleRecords >= 2, metrics >= 3
- Content language should match the user's prompt language
- Field names must always be in English`;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { prompt, instruction, appSpec } = body;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }
  if (!instruction || typeof instruction !== "string" || !(instruction as string).trim()) {
    return NextResponse.json({ error: "Instruction is required." }, { status: 400 });
  }
  if (!appSpec || typeof appSpec !== "object") {
    return NextResponse.json({ error: "AppSpec is required." }, { status: 400 });
  }

  const apiKey = process.env.SILICONFLOW_API_KEY;
  const baseUrl =
    process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
  const model = process.env.SILICONFLOW_MODEL;

  if (!apiKey || !model) {
    const fallbackSpec = createIteratedFallbackAppSpec({
      prompt: prompt as string,
      instruction: (instruction as string).trim(),
      appSpec: appSpec as AppSpec,
    });
    return NextResponse.json({
      appSpec: fallbackSpec,
      source: "fallback",
      warning: "SiliconFlow environment variables are not configured.",
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: ITERATE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Original prompt: ${prompt}\n\nCurrent AppSpec:\n${JSON.stringify(appSpec, null, 2)}\n\nInstruction: ${(instruction as string).trim()}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "unknown");
      console.error(`[iterate] SiliconFlow ${res.status}: ${errText}`);
      const fallbackSpec = createIteratedFallbackAppSpec({
        prompt: prompt as string,
        instruction: (instruction as string).trim(),
        appSpec: appSpec as AppSpec,
      });
      return NextResponse.json({
        appSpec: fallbackSpec,
        source: "fallback",
        warning: `SiliconFlow returned ${res.status}.`,
      });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      console.error("[iterate] Unexpected response structure");
      const fallbackSpec = createIteratedFallbackAppSpec({
        prompt: prompt as string,
        instruction: (instruction as string).trim(),
        appSpec: appSpec as AppSpec,
      });
      return NextResponse.json({
        appSpec: fallbackSpec,
        source: "fallback",
        warning: "Unexpected AI response structure.",
      });
    }

    const parsed = extractJsonFromText(content);
    const result = normalizeAppSpec(parsed, prompt as string);

    return NextResponse.json({
      appSpec: result,
      source: "siliconflow",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[iterate] Error: ${msg}`);
    const fallbackSpec = createIteratedFallbackAppSpec({
      prompt: prompt as string,
      instruction: (instruction as string).trim(),
      appSpec: appSpec as AppSpec,
    });
    return NextResponse.json({
      appSpec: fallbackSpec,
      source: "fallback",
      warning: `AI iteration failed: ${msg}`,
    });
  }
}

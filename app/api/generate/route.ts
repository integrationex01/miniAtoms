import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createFallbackAppSpec, extractJsonFromText, normalizeAppSpec } from "@/lib/app-spec";

const SYSTEM_PROMPT = `You are an AI app architect. Given a user's app idea, generate a structured app specification with interactive preview configuration.

Return ONLY a JSON object. No markdown, no explanation, no code blocks.

JSON structure:
{
  "name": "short app name",
  "description": "one-sentence description",
  "pages": ["page1", "page2", "page3", "page4"],
  "components": ["Header", "Navigation", "ContentCard", "Form", "RecordList"],
  "features": ["feature1", "feature2", "feature3", "feature4"],
  "theme": "light",
  "interactivePreview": {
    "primaryEntityName": "Transaction",
    "tabs": ["Overview", "Add New", "Stats", "Records"],
    "defaultTab": "Overview",
    "formTitle": "Add new record",
    "formFields": [
      {"id": "title", "label": "Title", "type": "text", "placeholder": "Enter title"},
      {"id": "amount", "label": "Amount", "type": "number", "placeholder": "Enter amount"},
      {"id": "type", "label": "Type", "type": "select", "options": ["Income", "Expense"]},
      {"id": "category", "label": "Category", "type": "select", "options": ["Food", "Transport", "Salary", "Other"]},
      {"id": "note", "label": "Note", "type": "textarea", "placeholder": "Additional notes"}
    ],
    "sampleRecords": [
      {"id": "r1", "title": "Lunch", "subtitle": "Food · Today", "amount": 35, "type": "expense", "category": "Food", "createdAt": "Today"},
      {"id": "r2", "title": "Salary", "subtitle": "Income · This month", "amount": 8000, "type": "income", "category": "Salary", "createdAt": "This month"}
    ],
    "metrics": [
      {"id": "total", "label": "Total records", "value": "2"},
      {"id": "income", "label": "Income", "value": "¥8,000"},
      {"id": "expense", "label": "Expense", "value": "¥35"}
    ],
    "actions": [
      {"id": "add", "label": "Add record", "type": "add_record"},
      {"id": "delete", "label": "Delete record", "type": "delete_record"}
    ]
  }
}

Rules:
- "theme" must be one of: "light", "dark", "colorful"
- "pages" must have at least 4 items
- "components" must have at least 5 items
- "features" must have at least 4 items
- "tabs" must have at least 3 items
- "formFields" must have at least 3 items
- "sampleRecords" must have at least 2 items
- "metrics" must have at least 3 items
- field.type must be one of: "text", "number", "select", "textarea"
- record.type must be one of: "income", "expense", "neutral"
- action.type must be one of: "add_record", "delete_record", "toggle_status", "switch_tab"
- Content language should match the user's prompt language (Chinese prompt → Chinese content, English → English)
- Field names must always be in English
- Tailor formFields, sampleRecords, metrics, and tabs to the specific app type (accounting, fitness, tasks, learning, etc.)`;

export async function POST(req: Request) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Read prompt
  let prompt: string;
  try {
    const body = await req.json();
    prompt = body.prompt;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!prompt || !prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  prompt = prompt.trim();

  // Read env
  const apiKey = process.env.SILICONFLOW_API_KEY;
  const baseUrl =
    process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
  const model = process.env.SILICONFLOW_MODEL;

  // If missing config, return fallback
  if (!apiKey || !model) {
    console.warn("[generate] SiliconFlow env vars not configured, using fallback");
    return NextResponse.json({
      appSpec: createFallbackAppSpec(prompt),
      source: "fallback",
      warning: "SiliconFlow environment variables are not configured.",
    });
  }

  // Call SiliconFlow
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
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
      console.error(`[generate] SiliconFlow ${res.status}: ${errText}`);
      return NextResponse.json({
        appSpec: createFallbackAppSpec(prompt),
        source: "fallback",
        warning: `SiliconFlow returned ${res.status}.`,
      });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      console.error("[generate] Unexpected response structure:", JSON.stringify(data).slice(0, 200));
      return NextResponse.json({
        appSpec: createFallbackAppSpec(prompt),
        source: "fallback",
        warning: "Unexpected AI response structure.",
      });
    }

    const parsed = extractJsonFromText(content);
    const appSpec = normalizeAppSpec(parsed, prompt);

    return NextResponse.json({
      appSpec,
      source: "siliconflow",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[generate] Error: ${msg}`);
    return NextResponse.json({
      appSpec: createFallbackAppSpec(prompt),
      source: "fallback",
      warning: `AI generation failed: ${msg}`,
    });
  }
}

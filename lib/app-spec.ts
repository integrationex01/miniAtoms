import type { AppSpec, AppTheme } from "./types";

const VALID_THEMES: AppTheme[] = ["light", "dark", "colorful"];

export function createFallbackAppSpec(prompt: string): AppSpec {
  const shortName =
    prompt.length > 30 ? prompt.slice(0, 30) + "..." : prompt;

  return {
    name: shortName,
    description: `An app based on: "${prompt}"`,
    pages: ["Home", "Dashboard", "Settings", "Profile"],
    components: [
      "Header",
      "Navigation",
      "Content Card",
      "Sidebar",
      "Footer",
    ],
    features: [
      "User authentication",
      "Dashboard overview",
      "Data management",
      "Responsive layout",
    ],
    theme: "light",
  };
}

export function normalizeAppSpec(input: unknown, prompt: string): AppSpec {
  const fallback = createFallbackAppSpec(prompt);

  if (!input || typeof input !== "object") return fallback;

  const raw = input as Record<string, unknown>;

  const theme = VALID_THEMES.includes(raw.theme as AppTheme)
    ? (raw.theme as AppTheme)
    : fallback.theme;

  const toStringArray = (val: unknown, fallbackArr: string[]): string[] => {
    if (Array.isArray(val) && val.every((v) => typeof v === "string"))
      return val;
    return fallbackArr;
  };

  return {
    name:
      typeof raw.name === "string" && raw.name.trim()
        ? raw.name.trim()
        : fallback.name,
    description:
      typeof raw.description === "string" && raw.description.trim()
        ? raw.description.trim()
        : fallback.description,
    pages: toStringArray(raw.pages, fallback.pages),
    components: toStringArray(raw.components, fallback.components),
    features: toStringArray(raw.features, fallback.features),
    theme,
  };
}

export function extractJsonFromText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // try to find first {...} block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        throw new Error("Failed to extract JSON from text");
      }
    }
    throw new Error("No JSON found in text");
  }
}

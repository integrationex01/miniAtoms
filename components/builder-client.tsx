"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppSpec, AgentStep } from "@/lib/types";
import AgentSteps from "@/components/agent-steps";
import AppPreview from "@/components/app-preview";
import { AlertTriangle, Zap, Info } from "lucide-react";

const DEFAULT_STEPS: AgentStep[] = [
  {
    id: "understand",
    title: "Understanding request",
    description: "Analyzing the product idea and user intent.",
    status: "pending",
  },
  {
    id: "plan",
    title: "Planning app structure",
    description: "Designing pages, flows, and core modules.",
    status: "pending",
  },
  {
    id: "components",
    title: "Generating components",
    description: "Mapping the idea into UI blocks and interactions.",
    status: "pending",
  },
  {
    id: "preview",
    title: "Rendering preview",
    description: "Creating a visual app preview from the generated spec.",
    status: "pending",
  },
];

function updateStep(
  steps: AgentStep[],
  id: string,
  status: AgentStep["status"]
): AgentStep[] {
  return steps.map((s) => (s.id === id ? { ...s, status } : s));
}

export default function BuilderClient({
  initialPrompt,
}: {
  initialPrompt: string;
}) {
  const [steps, setSteps] = useState<AgentStep[]>(DEFAULT_STEPS);
  const [appSpec, setAppSpec] = useState<AppSpec | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setSteps(DEFAULT_STEPS);
    setAppSpec(null);
    setSource(null);
    setWarning(null);
    setError(null);

    // Step 1: understand
    setSteps((prev) => updateStep(prev, "understand", "running"));
    await new Promise((r) => setTimeout(r, 600));
    setSteps((prev) => updateStep(prev, "understand", "completed"));

    // Step 2: plan
    setSteps((prev) => updateStep(prev, "plan", "running"));
    await new Promise((r) => setTimeout(r, 400));
    setSteps((prev) => updateStep(prev, "plan", "completed"));

    // Step 3: generate (call API)
    setSteps((prev) => updateStep(prev, "components", "running"));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: initialPrompt }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      setSteps((prev) => updateStep(prev, "components", "completed"));
      setSource(data.source);
      setWarning(data.warning || null);
      setAppSpec(data.appSpec);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[builder] generation error:", msg);
      setSteps((prev) => updateStep(prev, "components", "error"));
      setError(msg);
    }

    // Step 4: preview
    setSteps((prev) => updateStep(prev, "preview", "running"));
    await new Promise((r) => setTimeout(r, 400));
    setSteps((prev) => updateStep(prev, "preview", "completed"));
  }, [initialPrompt]);

  useEffect(() => {
    if (initialPrompt) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Left panel */}
      <div className="lg:col-span-2 border-r border-gray-200/60 p-5 flex flex-col gap-5 overflow-y-auto">
        <AgentSteps steps={steps} />

        {/* Generation info */}
        {source && (
          <div className="rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-gray-600">
                Generation Info
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Source:{" "}
                <span className="font-medium text-gray-700">{source}</span>
              </p>
              <p>
                Prompt:{" "}
                <span className="text-gray-600">
                  {initialPrompt.length > 80
                    ? initialPrompt.slice(0, 80) + "..."
                    : initialPrompt}
                </span>
              </p>
            </div>
          </div>
        )}

        {warning && (
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">{warning}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200/60 bg-red-50/60 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Prompt display */}
        <div className="rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Current prompt</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {initialPrompt}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="lg:col-span-3 p-5">
        <AppPreview appSpec={appSpec} key={appSpec?.name || "empty"} />
      </div>
    </>
  );
}

"use client";

import type { AgentStep } from "@/lib/types";
import {
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Bot,
} from "lucide-react";

function StepIcon({ status }: { status: AgentStep["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />;
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    default:
      return <Circle className="w-4 h-4 text-gray-300" />;
  }
}

function stepBg(status: AgentStep["status"]): string {
  switch (status) {
    case "running":
      return "bg-indigo-50 border-indigo-200";
    case "completed":
      return "bg-emerald-50 border-emerald-200";
    case "error":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

export default function AgentSteps({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
        <Bot className="w-4 h-4" />
        Agent Progress
      </div>
      {steps.map((step) => (
        <div
          key={step.id}
          className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${stepBg(step.status)}`}
        >
          <div className="mt-0.5">
            <StepIcon status={step.status} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{step.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

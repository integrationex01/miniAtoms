"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import AgentStepsPlaceholder from "@/components/agent-steps-placeholder";
import AppPreviewPlaceholder from "@/components/app-preview-placeholder";

function BuilderContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              miniAtoms Builder
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Home
          </Link>
        </div>
        <Link
          href="/projects"
          className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Projects
        </Link>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-0">
        <div className="lg:col-span-2 border-r border-gray-200/60 p-6">
          <AgentStepsPlaceholder prompt={prompt} />
        </div>
        <div className="lg:col-span-3 p-6">
          <AppPreviewPlaceholder />
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}

"use client";

import { Bot, Cog, Loader2 } from "lucide-react";

export default function AgentStepsPlaceholder({ prompt }: { prompt: string | null }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <Bot className="w-4 h-4" />
        Agent is ready
      </div>

      <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Cog className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Planning</p>
            <p className="text-xs text-gray-400">Agent will analyze your request</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Generating</p>
            <p className="text-xs text-gray-400">Waiting for previous step</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Building preview</p>
            <p className="text-xs text-gray-400">Waiting for previous step</p>
          </div>
        </div>
      </div>

      {prompt && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 p-4">
          <p className="text-xs text-gray-400 mb-1">Current prompt:</p>
          <p className="text-sm text-gray-700 leading-relaxed">{prompt}</p>
        </div>
      )}
    </div>
  );
}

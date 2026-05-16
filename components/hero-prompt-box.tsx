"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Send, Sparkles, Plus, Mic } from "lucide-react";

export default function HeroPromptBox() {
  const [prompt, setPrompt] = useState("");
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    if (!isSignedIn) {
      sessionStorage.setItem("pendingPrompt", trimmed);
      openSignIn();
      return;
    }

    router.push(`/builder?prompt=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 blur-sm transition-opacity" />
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-purple-500/5">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask miniAtoms to create an app..."
            rows={3}
            className="w-full bg-transparent px-5 pt-4 pb-2 text-gray-800 placeholder-gray-400 resize-none focus:outline-none text-[15px] leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-colors cursor-pointer"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:hover:scale-100"
              disabled={!prompt.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import Navbar from "@/components/navbar";
import HeroPromptBox from "@/components/hero-prompt-box";
import PendingPromptRedirect from "@/components/pending-prompt-redirect";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(129,140,248,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(168,85,247,0.2) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 20% 30%, rgba(236,72,153,0.15) 0%, transparent 50%)",
        }}
      />

      <PendingPromptRedirect />
      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20">
        <div className="flex flex-col items-center gap-6 mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/60 text-sm text-purple-700 font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            AI-powered app builder
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            Build apps with
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Agents
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-md leading-relaxed">
            Create apps and websites by chatting with an AI agent.
          </p>
        </div>

        <HeroPromptBox />

        <p className="mt-6 text-xs text-gray-400">
          No sign-up required to start — just type your idea above.
        </p>
      </div>
    </main>
  );
}

import type { AppSpec } from "@/lib/types";
import { Eye, Monitor, Smartphone, LayoutGrid, Cpu, Sparkles } from "lucide-react";

function themeStyles(theme: AppSpec["theme"]) {
  switch (theme) {
    case "dark":
      return {
        bg: "bg-gray-900",
        card: "bg-gray-800 border-gray-700",
        text: "text-gray-100",
        sub: "text-gray-400",
        nav: "bg-gray-800",
        navText: "text-gray-300",
        accent: "from-indigo-400 to-purple-400",
        featureCard: "bg-gray-800/60 border-gray-700/60",
      };
    case "colorful":
      return {
        bg: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
        card: "bg-white/80 border-purple-200/60",
        text: "text-gray-900",
        sub: "text-gray-500",
        nav: "bg-white/80",
        navText: "text-purple-700",
        accent: "from-indigo-500 via-purple-500 to-pink-500",
        featureCard: "bg-white/60 border-purple-200/40",
      };
    default:
      return {
        bg: "bg-white",
        card: "bg-gray-50 border-gray-200",
        text: "text-gray-900",
        sub: "text-gray-500",
        nav: "bg-gray-50",
        navText: "text-gray-600",
        accent: "from-indigo-500 to-purple-500",
        featureCard: "bg-gray-50 border-gray-200/80",
      };
  }
}

export default function AppPreview({
  appSpec,
}: {
  appSpec: AppSpec | null;
}) {
  if (!appSpec) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Eye className="w-4 h-4" />
          App Preview
        </div>
        <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200/60 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              No preview yet
            </p>
            <p className="text-xs text-gray-300">
              Your generated app will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const s = themeStyles(appSpec.theme);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Eye className="w-4 h-4" />
          App Preview
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-gray-400" />
          <Smartphone className="w-3.5 h-3.5 text-gray-300" />
        </div>
      </div>

      <div className={`flex-1 rounded-xl border overflow-hidden ${s.card}`}>
        {/* App navbar */}
        <div className={`flex items-center justify-between px-4 py-2.5 ${s.nav} border-b border-inherit`}>
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded bg-gradient-to-br ${s.accent} flex items-center justify-center`}>
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className={`text-xs font-semibold ${s.text}`}>
              {appSpec.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {appSpec.pages.slice(0, 4).map((page) => (
              <span
                key={page}
                className={`text-[10px] ${s.navText} hover:opacity-80 cursor-default`}
              >
                {page}
              </span>
            ))}
          </div>
        </div>

        {/* App body */}
        <div className={`p-4 ${s.bg} min-h-[280px]`}>
          <div className="max-w-md mx-auto">
            <h2 className={`text-lg font-bold ${s.text} mb-1`}>
              {appSpec.name}
            </h2>
            <p className={`text-xs ${s.sub} mb-4 leading-relaxed`}>
              {appSpec.description}
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {appSpec.features.slice(0, 4).map((feature, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-2.5 ${s.featureCard}`}
                >
                  <LayoutGrid className={`w-3.5 h-3.5 mb-1.5 ${s.sub}`} />
                  <p className={`text-[11px] font-medium ${s.text}`}>
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            {/* Component list */}
            <div className={`rounded-lg border p-2.5 ${s.featureCard}`}>
              <p className={`text-[10px] font-medium ${s.sub} mb-1.5`}>
                Components
              </p>
              <div className="flex flex-wrap gap-1">
                {appSpec.components.map((comp) => (
                  <span
                    key={comp}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] ${s.sub} bg-black/5`}
                  >
                    <Cpu className="w-2 h-2" />
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

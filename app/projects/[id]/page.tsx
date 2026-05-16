import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <header className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Projects
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">
          Project Detail
        </h1>
        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
          {id}
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200/60 flex items-center justify-center mx-auto mb-5">
            <Eye className="w-7 h-7 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            App Preview
          </h2>
          <p className="text-sm text-gray-400">
            Project preview will appear here once implemented.
          </p>
        </div>
      </div>
    </div>
  );
}

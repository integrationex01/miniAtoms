import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import ProjectDetailClient from "@/components/project-detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <header className="flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Projects
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Home className="w-3 h-3" />
          Home
        </Link>
      </header>
      <ProjectDetailClient projectId={id} />
    </div>
  );
}

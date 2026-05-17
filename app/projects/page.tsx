import Link from "next/link";
import ProjectsClient from "@/components/projects-client";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <h1 className="text-lg font-semibold text-gray-900">My Projects</h1>
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Create new
        </Link>
      </header>
      <ProjectsClient />
    </div>
  );
}

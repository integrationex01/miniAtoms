import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";

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

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200/60 flex items-center justify-center mx-auto mb-5">
            <FolderOpen className="w-7 h-7 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            No projects yet
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Your generated apps will appear here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create your first app
          </Link>
        </div>
      </div>
    </div>
  );
}

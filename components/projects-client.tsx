"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  FolderOpen,
  Plus,
  Eye,
  Trash2,
  Clock,
  LayoutGrid,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete project.");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-3" />
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={fetchProjects}
            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
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
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm p-4 hover:shadow-md hover:border-gray-300/60 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                    {project.title}
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    {project.appSpec.theme}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
              {project.prompt}
            </p>

            <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <LayoutGrid className="w-3 h-3" />
                {project.appSpec.pages?.length || 0} pages
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {project.appSpec.features?.length || 0} features
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(project.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-3 h-3" />
                View
              </Link>
              <button
                onClick={() => handleDelete(project.id, project.title)}
                disabled={deleting === project.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting === project.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

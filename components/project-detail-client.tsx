"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import AppPreview from "@/components/app-preview";
import {
  ArrowLeft,
  Trash2,
  Clock,
  LayoutGrid,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  Home,
} from "lucide-react";

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.status === 404) {
          setError("Project not found");
          return;
        }
        if (!res.ok) throw new Error("Failed to load project");
        const data = await res.json();
        setProject(data.project);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  async function handleDelete() {
    if (!project) return;
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/projects");
    } catch {
      alert("Failed to delete project.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            {error || "Project not found"}
          </h2>
          <Link
            href="/projects"
            className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-5 flex-1">
        {/* Left panel: project info */}
        <div className="lg:col-span-2 border-r border-gray-200/60 p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {project.title}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              {project.prompt}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gray-200/60 bg-white/60 p-3">
              <p className="text-[10px] text-gray-400 mb-1">Created</p>
              <p className="text-[11px] font-medium text-gray-700">
                {formatDate(project.createdAt)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200/60 bg-white/60 p-3">
              <p className="text-[10px] text-gray-400 mb-1">Updated</p>
              <p className="text-[11px] font-medium text-gray-700">
                {formatDate(project.updatedAt)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200/60 bg-white/60 p-3">
              <p className="text-[10px] text-gray-400 mb-1">Theme</p>
              <p className="text-[11px] font-medium text-gray-700 capitalize">
                {project.appSpec.theme}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200/60 bg-white/60 p-3">
              <p className="text-[10px] text-gray-400 mb-1">Pages</p>
              <p className="text-[11px] font-medium text-gray-700">
                {project.appSpec.pages?.length || 0}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium text-gray-500">Features</p>
            {(project.appSpec.features || []).map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-gray-600"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                {f}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              Delete Project
            </button>
          </div>
        </div>

        {/* Right panel: interactive preview */}
        <div className="lg:col-span-3 p-5">
          <AppPreview appSpec={project.appSpec} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppSpec, Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import AppPreview from "@/components/app-preview";
import {
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle2,
  Send,
  AlertTriangle,
  Palette,
  BarChart3,
  Bell,
  LayoutGrid,
} from "lucide-react";

export default function ProjectDetailClient({
  projectId,
}: {
  projectId: string;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [currentAppSpec, setCurrentAppSpec] = useState<AppSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Iteration state
  const [instruction, setInstruction] = useState("");
  const [isIterating, setIsIterating] = useState(false);
  const [iterateError, setIterateError] = useState<string | null>(null);
  const [iterateWarning, setIterateWarning] = useState<string | null>(null);

  // Save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        setCurrentAppSpec(data.project.appSpec);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  async function handleIterate(inst?: string) {
    const text = inst || instruction;
    if (!text.trim() || isIterating || !project || !currentAppSpec) return;

    setIsIterating(true);
    setIterateError(null);
    setIterateWarning(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/iterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: project.prompt,
          instruction: text.trim(),
          appSpec: currentAppSpec,
        }),
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const data = await res.json();
      setCurrentAppSpec(data.appSpec);
      setHasUnsavedChanges(true);
      setInstruction("");

      if (data.warning) {
        setIterateWarning(data.warning);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setIterateError(msg);
    } finally {
      setIsIterating(false);
    }
  }

  async function handleSaveChanges() {
    if (!currentAppSpec || !project || isSavingChanges) return;

    setIsSavingChanges(true);
    setIterateError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentAppSpec.name,
          appSpec: currentAppSpec,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Save failed (${res.status})`);
      }

      const data = await res.json();
      setProject(data.project);
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setIterateError(msg);
    } finally {
      setIsSavingChanges(false);
    }
  }

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

  if (error || !project || !currentAppSpec) {
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

  const quickActions = [
    { label: "增加统计页面", icon: BarChart3 },
    { label: "改成暗色风格", icon: Palette },
    { label: "增加提醒功能", icon: Bell },
    { label: "优化首页布局", icon: LayoutGrid },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-5 flex-1">
        {/* Left panel */}
        <div className="lg:col-span-2 border-r border-gray-200/60 p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Project info */}
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
              <p className="text-[10px] text-gray-400 mb-1">Theme</p>
              <p className="text-[11px] font-medium text-gray-700 capitalize">
                {currentAppSpec.theme}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200/60 bg-white/60 p-3">
              <p className="text-[10px] text-gray-400 mb-1">Pages</p>
              <p className="text-[11px] font-medium text-gray-700">
                {currentAppSpec.pages?.length || 0}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-gray-500">Features</p>
            {(currentAppSpec.features || []).slice(0, 6).map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-gray-600"
              >
                <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200/60" />

          {/* Continue building */}
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-2">
              Continue building
            </p>
            <div className="relative">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleIterate();
                  }
                }}
                placeholder="告诉 miniAtoms 你想怎么修改这个应用..."
                rows={2}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                onClick={() => handleIterate()}
                disabled={isIterating || !instruction.trim()}
                className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isIterating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => handleIterate(qa.label)}
                  disabled={isIterating}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200/80 text-[10px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <qa.icon className="w-3 h-3" />
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unsaved changes / Save / Errors */}
          {iterateWarning && (
            <div className="rounded-lg border border-amber-200/60 bg-amber-50/60 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-700">{iterateWarning}</p>
              </div>
            </div>
          )}

          {iterateError && (
            <div className="rounded-lg border border-red-200/60 bg-red-50/60 p-3">
              <p className="text-[10px] text-red-600">{iterateError}</p>
            </div>
          )}

          {hasUnsavedChanges && (
            <div className="rounded-lg border border-indigo-200/60 bg-indigo-50/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-indigo-600">
                  Unsaved changes
                </span>
              </div>
              <button
                onClick={handleSaveChanges}
                disabled={isSavingChanges}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium bg-indigo-500 text-white hover:bg-indigo-400 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingChanges ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Changes saved
            </div>
          )}

          {/* Delete */}
          <div className="mt-auto pt-3 border-t border-gray-200/60">
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
          <AppPreview
            appSpec={currentAppSpec}
            key={currentAppSpec.name + currentAppSpec.theme}
          />
        </div>
      </div>
    </div>
  );
}

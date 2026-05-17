import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { AppSpec } from "@/lib/types";
import { ensureProjectsTable, getProjectById, deleteProject, updateProject } from "@/lib/projects";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await ensureProjectsTable();
    const project = await getProjectById({ id, userId });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err) {
    console.error("[project GET]", err);
    return NextResponse.json(
      { error: "Failed to load project." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, appSpec } = body;

  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return NextResponse.json({ error: "Title must be a non-empty string." }, { status: 400 });
  }
  if (!appSpec || typeof appSpec !== "object") {
    return NextResponse.json({ error: "AppSpec is required." }, { status: 400 });
  }

  try {
    await ensureProjectsTable();
    const updated = await updateProject({
      id,
      userId,
      title: (title as string).trim(),
      appSpec: appSpec as AppSpec,
    });
    if (!updated) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ project: updated });
  } catch (err) {
    console.error("[project PUT]", err);
    return NextResponse.json(
      { error: "Failed to update project." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await ensureProjectsTable();
    const deleted = await deleteProject({ id, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[project DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete project." },
      { status: 500 }
    );
  }
}

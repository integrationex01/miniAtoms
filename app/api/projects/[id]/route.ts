import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureProjectsTable, getProjectById, deleteProject } from "@/lib/projects";

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

export async function PUT() {
  return NextResponse.json({
    message: "Project update will be implemented in a future step.",
  });
}

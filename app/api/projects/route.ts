import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { AppSpec } from "@/lib/types";
import { ensureProjectsTable, createProject, getProjectsByUser } from "@/lib/projects";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureProjectsTable();
    const projects = await getProjectsByUser(userId);
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[projects GET]", err);
    return NextResponse.json(
      { error: "Failed to load projects." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, prompt, appSpec } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }
  if (!appSpec || typeof appSpec !== "object") {
    return NextResponse.json({ error: "AppSpec is required." }, { status: 400 });
  }

  try {
    await ensureProjectsTable();
    const project = await createProject({
      userId,
      title: (title as string).trim(),
      prompt: (prompt as string).trim(),
      appSpec: appSpec as AppSpec,
    });
    return NextResponse.json({ project });
  } catch (err) {
    console.error("[projects POST]", err);
    return NextResponse.json(
      { error: "Failed to save project." },
      { status: 500 }
    );
  }
}

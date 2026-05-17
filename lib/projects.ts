import { getSql } from "./db";
import type { AppSpec, Project } from "./types";

export async function ensureProjectsTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      app_spec JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_projects_user_id_created_at
    ON projects (user_id, created_at DESC)
  `;
}

function mapRow(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    prompt: row.prompt as string,
    appSpec: row.app_spec as AppSpec,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function createProject(input: {
  userId: string;
  title: string;
  prompt: string;
  appSpec: AppSpec;
}): Promise<Project> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO projects (user_id, title, prompt, app_spec)
    VALUES (${input.userId}, ${input.title}, ${input.prompt}, ${JSON.stringify(input.appSpec)})
    RETURNING id, user_id, title, prompt, app_spec, created_at, updated_at
  `) as Record<string, unknown>[];
  return mapRow(rows[0]);
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, user_id, title, prompt, app_spec, created_at, updated_at
    FROM projects
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as Record<string, unknown>[];
  return rows.map(mapRow);
}

export async function getProjectById(input: {
  id: string;
  userId: string;
}): Promise<Project | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, user_id, title, prompt, app_spec, created_at, updated_at
    FROM projects
    WHERE id = ${input.id} AND user_id = ${input.userId}
    LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) return null;
  return mapRow(rows[0] as Record<string, unknown>);
}

export async function deleteProject(input: {
  id: string;
  userId: string;
}): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM projects
    WHERE id = ${input.id} AND user_id = ${input.userId}
    RETURNING id
  `) as Record<string, unknown>[];
  return rows.length > 0;
}

export async function updateProject(input: {
  id: string;
  userId: string;
  title: string;
  appSpec: AppSpec;
}): Promise<Project | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE projects
    SET title = ${input.title},
        app_spec = ${JSON.stringify(input.appSpec)},
        updated_at = NOW()
    WHERE id = ${input.id} AND user_id = ${input.userId}
    RETURNING id, user_id, title, prompt, app_spec, created_at, updated_at
  `) as Record<string, unknown>[];
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

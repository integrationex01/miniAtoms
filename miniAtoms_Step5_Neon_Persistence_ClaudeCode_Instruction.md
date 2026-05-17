# Step 5：接入 Neon 项目持久化 — Claude Code 最终执行指令

你是一个资深 AI Native 全栈工程师。当前 miniAtoms 项目已经完成：

- Next.js App Router
- TypeScript
- Tailwind CSS
- Clerk 登录注册与受保护路由
- Lovable 风格首页
- SiliconFlow API 生成 AppSpec
- Builder 页面
- Agent Steps
- 可交互 App Preview

现在进入 **Step 5：接入 Neon PostgreSQL，实现项目保存、历史项目列表、项目详情和删除项目**。

请基于现有项目修改：

- 不要重建项目；
- 不要破坏现有 Clerk 登录流程；
- 不要破坏首页 Prompt 流程；
- 不要破坏 SiliconFlow 生成流程；
- 不要破坏现有 App Preview 交互能力；
- 不要接 Prisma；
- 不要接 Drizzle；
- 不要引入 React Router；
- 不要引入 shadcn/ui。

---

## 当前目标

用户在 Builder 页面生成 AppSpec 后，可以点击：

```txt
Save Project
```

系统将当前项目保存到 Neon PostgreSQL。

保存后：

- 停留在 Builder 页面；
- 显示保存成功状态；
- 显示 `View Project` 按钮；
- 点击后进入 `/projects/[id]`。

用户可以进入：

```txt
/projects
```

查看自己的历史项目列表。

用户可以进入：

```txt
/projects/[id]
```

查看项目详情和可交互 App Preview。

用户可以删除自己的项目。

---

## 技术方案

使用：

```txt
@neondatabase/serverless
```

数据库操作只允许在服务端执行：

- `app/api/projects/route.ts`
- `app/api/projects/[id]/route.ts`
- `lib/db.ts`
- `lib/projects.ts`

不要在 client component 中直接连接数据库。

数据库连接只读取：

```env
DATABASE_URL=
```

不要把数据库连接字符串写死在代码里。

---

## 1. 安装依赖

请安装：

```bash
npm install @neondatabase/serverless
```

---

## 2. 环境变量

确保 `.env.example` 中包含：

```env
DATABASE_URL=
```

不要创建 `.env.local`。

README 中提醒我本地和 Vercel 都需要配置：

```env
DATABASE_URL=postgresql://...
```

---

## 3. 创建数据库连接文件

创建：

```txt
lib/db.ts
```

要求：

```ts
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

export const sql = neon(databaseUrl);
```

注意：

- 这个文件只能被 server-side 代码引用；
- 不要在 client component 中 import 它。

---

## 4. 创建项目数据访问层

创建：

```txt
lib/projects.ts
```

要求实现以下函数：

```ts
import type { AppSpec, Project } from "@/lib/types";

export async function ensureProjectsTable(): Promise<void>;

export async function createProject(input: {
  userId: string;
  title: string;
  prompt: string;
  appSpec: AppSpec;
}): Promise<Project>;

export async function getProjectsByUser(userId: string): Promise<Project[]>;

export async function getProjectById(input: {
  id: string;
  userId: string;
}): Promise<Project | null>;

export async function deleteProject(input: {
  id: string;
  userId: string;
}): Promise<boolean>;
```

---

## 5. 数据库表结构

`ensureProjectsTable()` 需要执行：

```sql
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  app_spec JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

同时建议创建索引：

```sql
CREATE INDEX IF NOT EXISTS idx_projects_user_id_created_at
ON projects (user_id, created_at DESC);
```

要求：

- 在 `GET /api/projects`、`POST /api/projects`、`GET /api/projects/[id]`、`DELETE /api/projects/[id]` 中调用 `ensureProjectsTable()`；
- 如果表不存在，自动创建；
- 这样本地和 Vercel 第一次运行也能自初始化。

---

## 6. Project 类型映射

检查 `lib/types.ts` 中的 `Project` 类型。

应保持或更新为：

```ts
export type Project = {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  appSpec: AppSpec;
  createdAt: string;
  updatedAt: string;
};
```

数据库字段是 snake_case：

```txt
user_id
app_spec
created_at
updated_at
```

前端类型是 camelCase：

```txt
userId
appSpec
createdAt
updatedAt
```

请在 `lib/projects.ts` 中做映射，不要把 snake_case 泄漏到前端。

---

## 7. 实现 `POST /api/projects`

修改：

```txt
app/api/projects/route.ts
```

`POST` 要求：

- 使用 Clerk server-side `auth()` 获取 `userId`；
- 未登录返回 401；
- 调用 `ensureProjectsTable()`；
- 从 body 读取：
  - `title`
  - `prompt`
  - `appSpec`
- 校验：
  - `title` 必须是非空字符串；
  - `prompt` 必须是非空字符串；
  - `appSpec` 必须存在；
- 调用 `createProject()`；
- 返回：

```json
{
  "project": {}
}
```

错误情况：

- 未登录：401；
- 参数错误：400；
- 数据库错误：500，并返回友好错误信息。

---

## 8. 实现 `GET /api/projects`

同文件：

```txt
app/api/projects/route.ts
```

`GET` 要求：

- 使用 Clerk server-side `auth()` 获取 `userId`；
- 未登录返回 401；
- 调用 `ensureProjectsTable()`；
- 调用 `getProjectsByUser(userId)`；
- 只返回当前用户的项目；
- 按 `created_at DESC` 排序；
- 返回：

```json
{
  "projects": []
}
```

---

## 9. 实现 `GET /api/projects/[id]`

修改：

```txt
app/api/projects/[id]/route.ts
```

`GET` 要求：

- 使用 Clerk server-side `auth()` 获取 `userId`；
- 未登录返回 401；
- 读取 route param `id`；
- 调用 `ensureProjectsTable()`；
- 调用 `getProjectById({ id, userId })`；
- 只能读取当前用户自己的项目；
- 找不到返回 404；
- 找到返回：

```json
{
  "project": {}
}
```

---

## 10. 实现 `DELETE /api/projects/[id]`

同文件：

```txt
app/api/projects/[id]/route.ts
```

`DELETE` 要求：

- 使用 Clerk server-side `auth()` 获取 `userId`；
- 未登录返回 401；
- 读取 route param `id`；
- 调用 `ensureProjectsTable()`；
- 调用 `deleteProject({ id, userId })`；
- 只能删除当前用户自己的项目；
- 删除成功返回：

```json
{
  "ok": true
}
```

- 如果项目不存在，返回 404。

---

## 11. 暂时不要实现 PUT

本步骤不要实现项目更新。

如果已有 placeholder PUT，可以保留 placeholder，但不要实现真实更新逻辑。

继续迭代保存功能留到下一步。

---

## 12. Builder 页面新增保存功能

修改：

```txt
components/builder-client.tsx
```

或当前负责 Builder 状态的组件。

要求：

- 当 `appSpec` 成功生成后，显示 `Save Project` 按钮；
- 点击后调用：

```txt
POST /api/projects
```

请求 body：

```ts
{
  title: appSpec.name,
  prompt: initialPrompt,
  appSpec
}
```

保存过程中：

- 按钮显示 loading 状态，例如 `Saving...`；
- 禁止重复点击。

保存成功后：

- 显示 `Project saved`;
- 保存返回的 project id；
- 显示 `View Project` 按钮；
- 点击跳转到 `/projects/${project.id}`；
- 同时可以显示 `View Projects` 链接。

保存失败时：

- 显示错误提示；
- 页面不能崩溃。

注意：

- 只有 appSpec 存在时才显示保存按钮；
- fallback appSpec 也允许保存；
- 如果已保存过当前生成结果，避免重复保存，可以把按钮改成 `Saved`，但不强制做复杂去重。

---

## 13. Projects 页面读取真实数据

修改：

```txt
app/projects/page.tsx
```

如果需要 client component，可以创建：

```txt
components/projects-client.tsx
```

要求：

- 页面加载后请求：

```txt
GET /api/projects
```

- 显示 loading 状态；
- 显示错误状态；
- 如果没有项目，显示现有空状态；
- 如果有项目，渲染项目卡片列表。

每个项目卡片显示：

- 项目名称；
- prompt 简短摘要；
- 创建时间；
- theme；
- 页面数量；
- 功能数量；
- `View` 按钮；
- `Delete` 按钮。

点击 `View`：

```txt
/projects/[id]
```

点击 `Delete`：

- 调用 `DELETE /api/projects/[id]`；
- 删除成功后从列表中移除；
- 删除前可以用 `confirm()` 简单确认；
- 不要因为删除失败导致页面崩。

视觉要求：

- 保持当前 miniAtoms 风格；
- 卡片要简洁、有质感；
- 可以使用 lucide-react 图标，例如 `Folder`, `Clock`, `Trash2`, `Eye`。

---

## 14. Project Detail 页面读取真实数据

修改：

```txt
app/projects/[id]/page.tsx
```

如果需要 client component，可以创建：

```txt
components/project-detail-client.tsx
```

要求：

- 页面加载后请求：

```txt
GET /api/projects/[id]
```

- 显示 loading 状态；
- 显示 404 / not found 状态；
- 显示错误状态；
- 成功后展示：
  - 项目名称；
  - 原始 prompt；
  - 创建时间；
  - 更新时间；
  - theme；
  - pages；
  - features；
  - components；
  - 可交互 `AppPreview`。

要求复用现有：

```txt
components/app-preview.tsx
```

让历史项目详情里的预览也可以交互。

页面顶部需要：

- Back to Projects；
- Back Home；
- Delete Project，可选但建议做。

删除项目成功后跳转回：

```txt
/projects
```

---

## 15. 日期格式工具

可以在：

```txt
lib/utils.ts
```

增加简单日期格式化函数：

```ts
export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
```

如果已有 utils，请不要破坏已有函数。

---

## 16. README 更新

更新 README，增加 Step 5 内容：

- 已接入 Neon PostgreSQL；
- 项目数据持久化；
- 用户项目隔离；
- 数据库表结构；
- 需要配置 `DATABASE_URL`；
- Vercel 中需要添加 `DATABASE_URL` 环境变量；
- 当前支持：
  - 保存项目；
  - 查看项目列表；
  - 查看项目详情；
  - 删除项目；
- 当前暂不支持：
  - 更新项目；
  - 多版本管理；
  - 继续迭代保存。

---

## 17. Vercel 部署注意事项

README 中补充：

部署到 Vercel 时，需要配置以下环境变量：

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
SILICONFLOW_API_KEY=
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=
DATABASE_URL=
```

注意：

- `DATABASE_URL` 必须是 Neon 提供的连接字符串；
- 不要把 `.env.local` 提交到 GitHub；
- Vercel 部署后第一次访问 `/projects` 或第一次保存项目时会自动创建表。

---

## 18. 质量要求

- 不要在 client component 里 import `lib/db.ts` 或 `lib/projects.ts`；
- 不要把 `DATABASE_URL` 暴露到前端；
- 所有 API 都必须使用 Clerk `auth()` 验证用户；
- 所有项目查询都必须带 `userId` 过滤；
- 不能让用户读取或删除别人的项目；
- 没有配置 `DATABASE_URL` 时，API 应返回友好错误，不要导致整个页面白屏；
- TypeScript 不能有明显类型错误；
- `npm run dev` 必须正常；
- `npm run build` 尽量正常；
- 保持现有 UI 风格；
- 不要大规模重写无关文件。

---

## 19. 验收标准

完成后我会测试：

### 测试 1：保存项目

1. 登录；
2. 首页输入：

```txt
帮我生成一个个人记账应用
```

3. 进入 Builder；
4. 等待 AppSpec 生成；
5. 点击 `Save Project`；
6. 看到 `Project saved`；
7. 看到 `View Project` 按钮；
8. 点击进入项目详情。

预期：

- 项目成功保存到 Neon；
- 项目详情能显示真实数据；
- App Preview 仍可交互。

### 测试 2：项目列表

访问：

```txt
/projects
```

预期：

- 能看到刚才保存的项目；
- 卡片显示标题、prompt、创建时间、theme、页面数量、功能数量；
- 点击 View 能进入详情。

### 测试 3：删除项目

在列表或详情页点击 Delete。

预期：

- 弹出确认；
- 删除成功；
- 列表中不再显示该项目；
- 详情页删除后跳回 Projects。

### 测试 4：用户隔离

用另一个 Clerk 用户登录。

预期：

- 看不到第一个用户保存的项目。

### 测试 5：未登录访问

退出登录后访问：

```txt
/projects
```

预期：

- 被 Clerk 拦截；
- 无法访问项目数据。

---

## 20. 完成后请输出

1. 修改了哪些文件；
2. 新增了哪些功能；
3. 我需要配置哪些环境变量；
4. Neon 需要执行什么操作；
5. 如何本地测试；
6. 如何在 Vercel 配置；
7. 下一步建议。

# Step 2：miniAtoms 项目骨架初始化 — Claude Code 最终执行指令

你是一个资深 AI Native 全栈工程师。请帮我初始化一个名为 **miniAtoms** 的 Next.js Demo 项目。

## 项目目标

miniAtoms 是一个 Lovable 风格的 AI Agent App Builder。用户在首页输入自然语言需求，登录后进入 Builder 工作台，后续会调用 SiliconFlow API 生成应用结构，并保存到 Neon 数据库。

当前只做 **Step 2**：

- 项目骨架
- 首页视觉
- Clerk 登录基础接入
- 路由占位
- Vercel 可部署准备

请注意：

- 不要实现 Neon。
- 不要实现 SiliconFlow。
- 不要写复杂业务逻辑。
- 不要做自定义登录页，使用 Clerk 的 modal 登录注册。

---

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- lucide-react
- @clerk/nextjs

---

## 1. 项目初始化与依赖

如果当前目录还不是 Next.js 项目，请初始化 Next.js App Router 项目。

安装依赖：

- `@clerk/nextjs`
- `lucide-react`

确保项目可以通过以下命令运行：

```bash
npm run dev
```

---

## 2. 项目结构

请整理为类似结构：

```txt
app/
  layout.tsx
  page.tsx
  globals.css

  builder/
    page.tsx

  projects/
    page.tsx
    [id]/
      page.tsx

  api/
    generate/
      route.ts
    projects/
      route.ts
      [id]/
        route.ts

components/
  navbar.tsx
  hero-prompt-box.tsx
  pending-prompt-redirect.tsx
  agent-steps-placeholder.tsx
  app-preview-placeholder.tsx

lib/
  types.ts
  utils.ts

middleware.ts
.env.example
README.md
```

---

## 3. Clerk 接入

在 `app/layout.tsx` 中接入 `ClerkProvider`。

要求：

- 整个应用被 `ClerkProvider` 包裹；
- 保留 Next.js metadata；
- 保持 Tailwind 全局样式正常工作；
- 页面语言设置为 `en`。

---

## 4. middleware 路由保护

创建 `middleware.ts`。

使用 Clerk 的 `clerkMiddleware` 和 `createRouteMatcher` 保护以下路由：

```txt
/builder(.*)
/projects(.*)
/api/generate(.*)
/api/projects(.*)
```

要求：

- 未登录用户不能访问这些页面和 API；
- 首页 `/` 不需要登录；
- middleware 需要兼容 Vercel 部署；
- 使用 Clerk 官方推荐的 matcher 写法。

---

## 5. 环境变量模板

创建 `.env.example`，内容如下：

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon
DATABASE_URL=

# SiliconFlow
SILICONFLOW_API_KEY=
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=
```

不要创建或提交 `.env.local`。

---

## 6. 首页 `/`

创建 Lovable 风格首页。

视觉要求：

- 大面积蓝紫粉橙渐变背景；
- 页面高度至少 `min-h-screen`；
- 顶部极简导航栏；
- 左侧 Logo：`miniAtoms`；
- 中间导航项：
  - Solutions
  - Resources
  - Community
  - Pricing
- 右侧登录状态：
  - 未登录显示 `Log in` 和 `Get started`
  - 已登录显示 `Projects` 链接和 `UserButton`
- 中央主标题：
  - `Build apps with AI Agents`
- 副标题：
  - `Create apps and websites by chatting with an AI agent.`
- 居中大 Prompt 输入框；
- placeholder：
  - `Ask miniAtoms to create an app...`
- 输入框右下角有发送按钮；
- 发送按钮使用 `lucide-react` 的 `Send` 图标；
- 可以适当使用 `Sparkles`、`Plus`、`Mic` 图标增强质感。

首页整体要接近 Lovable 风格：柔和、极简、圆角大、阴影轻、有高级 AI 产品感。

---

## 7. 首页 Prompt 交互

创建 `components/hero-prompt-box.tsx`，作为客户端组件。

交互逻辑：

- 使用 `useState` 管理 prompt；
- 使用 Clerk 的 `useUser()` 判断是否登录；
- 使用 Clerk 的 `useClerk()` 获取 `openSignIn`；
- 使用 Next.js 的 `useRouter()` 跳转；
- 如果 prompt 为空，点击发送不做任何操作；
- 如果用户未登录：
  - 把 prompt 保存到 `sessionStorage`，key 为 `pendingPrompt`；
  - 调用 `openSignIn()` 打开登录弹窗；
- 如果用户已登录：
  - 跳转到 `/builder?prompt=${encodeURIComponent(prompt)}`。

---

## 8. 登录成功后继续 Prompt

创建 `components/pending-prompt-redirect.tsx`，作为客户端组件。

逻辑：

- 使用 `useUser()` 监听 Clerk 登录状态；
- 如果 `isLoaded && isSignedIn`；
- 检查 `sessionStorage.getItem("pendingPrompt")`；
- 如果存在：
  - 读取该 prompt；
  - 删除 `pendingPrompt`；
  - 跳转到 `/builder?prompt=${encodeURIComponent(prompt)}`。

在首页 `app/page.tsx` 中渲染这个组件。

目标体验：

用户在首页输入 prompt，点击发送，如果未登录则弹出 Clerk 登录窗口。登录成功后自动进入 Builder 页面，并保留刚才输入的 prompt。

---

## 9. Navbar

创建 `components/navbar.tsx`。

要求：

- 使用 `SignedIn`、`SignedOut`、`SignInButton`、`SignUpButton`、`UserButton`；
- 未登录状态：
  - `Log in` 使用 `SignInButton mode="modal"`；
  - `Get started` 使用 `SignUpButton mode="modal"`；
- 已登录状态：
  - 显示 `Projects` 链接；
  - 显示 `UserButton`；
- 视觉风格要和首页匹配。

---

## 10. Builder 页面 `/builder`

创建 `/builder` 页面。

当前只做占位，不调用 API。

要求：

- 读取 URL 中的 `prompt` 参数；
- 显示顶部栏：
  - `miniAtoms Builder`
  - 返回首页链接；
  - Projects 链接；
- 页面布局：
  - 左侧：Agent Steps 占位卡片；
  - 右侧：App Preview 占位卡片；
- 左侧卡片标题：`Agent is ready`
- 显示当前 prompt：
  - `Current prompt: ...`
- 右侧预览卡片标题：
  - `App Preview`
- 可以放一些 mock 的 UI 卡片，展示后续会生成应用预览。

注意：

`/builder` 是受保护路由，middleware 会要求登录。

---

## 11. Projects 页面 `/projects`

创建 `/projects` 页面。

当前只做占位，不接数据库。

要求：

- 标题：`My Projects`
- 副标题：`Your generated apps will appear here.`
- 空状态：`No projects yet`
- 按钮：`Create your first app`
- 点击按钮回到首页 `/`

注意：

`/projects` 是受保护路由。

---

## 12. Project Detail 页面 `/projects/[id]`

创建 `/projects/[id]` 页面。

当前只做占位。

要求：

- 标题：`Project Detail`
- 显示当前项目 id；
- 返回 Projects 链接；
- 显示一个占位的 App Preview 区域。

---

## 13. API Route placeholder

创建以下 API route：

```txt
app/api/generate/route.ts
app/api/projects/route.ts
app/api/projects/[id]/route.ts
```

当前只写 placeholder。

要求：

- `/api/generate` 支持 POST，返回：

```json
{ "message": "SiliconFlow integration will be implemented in the next step." }
```

- `/api/projects` 支持 GET 和 POST，返回：

```json
{ "message": "Neon project persistence will be implemented in the next step." }
```

- `/api/projects/[id]` 支持 GET、PUT、DELETE，返回类似 placeholder message；
- 不连接 Neon；
- 不调用 SiliconFlow；
- 不要在 placeholder 中使用未配置的环境变量。

---

## 14. 类型定义

创建 `lib/types.ts`。

定义以下类型：

```ts
export type AppTheme = "light" | "dark" | "colorful";

export type AppSpec = {
  name: string;
  description: string;
  pages: string[];
  components: string[];
  features: string[];
  theme: AppTheme;
};

export type AgentStepStatus = "pending" | "running" | "completed" | "error";

export type AgentStep = {
  id: string;
  title: string;
  description: string;
  status: AgentStepStatus;
};

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

---

## 15. README

创建或更新 `README.md`。

需要包含：

- 项目简介；
- 当前 Step 2 完成内容；
- 技术栈；
- 本地启动方式；
- 环境变量说明；
- Vercel 部署说明；
- 后续计划：
  - 接入 SiliconFlow API；
  - 接入 Neon；
  - 保存项目；
  - 项目历史；
  - 项目详情；
  - 继续迭代。

Vercel 部署说明需要写清楚：

1. 推送代码到 GitHub；
2. 在 Vercel 导入项目；
3. 设置环境变量；
4. 部署；
5. 在 Clerk 控制台确认生产域名配置。

---

## 16. 质量要求

- 保持代码简洁；
- 组件拆分清晰；
- 不要过度设计；
- 不要引入 shadcn/ui；
- 不要引入 React Router；
- 不要使用 localStorage；
- 不要接 Neon；
- 不要接 SiliconFlow；
- 不要写真实生成逻辑；
- 保证可以部署到 Vercel；
- 保证 `npm run dev` 可以运行；
- 尽量避免 hydration error。

---

## 完成后请输出

1. 你创建或修改的文件列表；
2. 我需要手动配置的环境变量；
3. 本地启动命令；
4. 下一步建议。

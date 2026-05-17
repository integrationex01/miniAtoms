# Step 4：接入 SiliconFlow API — Claude Code 最终执行指令

你是一个资深 AI Native 全栈工程师。当前 miniAtoms 项目已经完成 Next.js、Tailwind、Clerk、首页、Builder 占位和受保护路由。现在进入 **Step 4：接入 SiliconFlow API**，让 Builder 页面基于用户 prompt 生成结构化 AppSpec，并渲染预览。

请基于现有项目修改：

- 不要重建项目；
- 不要破坏现有 Clerk 登录流程；
- 不要破坏首页 Prompt 交互；
- 不要破坏受保护路由。

---

## 当前目标

用户从首页输入 prompt 并登录后进入：

```txt
/builder?prompt=xxx
```

Builder 页面应自动调用：

```txt
POST /api/generate
```

服务端 API 调用 SiliconFlow Chat Completions，根据 prompt 生成结构化 AppSpec JSON，然后返回给前端。

前端需要展示：

- Agent 执行步骤；
- 生成状态；
- 生成来源；
- 动态 App Preview；
- fallback 提示。

---

## 技术约束

- 使用 Next.js App Router；
- 使用 TypeScript；
- 使用现有 Tailwind 风格；
- 使用现有 Clerk 登录保护；
- 不要接 Neon；
- 不要实现项目保存；
- 不要引入 React Router；
- 不要引入 shadcn/ui；
- 不要把 SiliconFlow API Key 暴露到前端；
- SiliconFlow 只能在 server-side API route 中调用；
- API 调用失败时必须有 fallback AppSpec，保证页面可演示。

---

## 1. 环境变量

确保 `.env.example` 中已有：

```env
SILICONFLOW_API_KEY=
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=
```

不要创建 `.env.local`，只提醒我本地需要配置。

---

## 2. 类型更新

检查并更新 `lib/types.ts`，确保包含：

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
```

如果已有，则保持兼容，不要破坏现有类型。

---

## 3. 创建 AppSpec 工具函数

创建或更新：

```txt
lib/app-spec.ts
```

实现以下函数。

### 3.1 `createFallbackAppSpec(prompt: string): AppSpec`

要求：

- 根据 prompt 生成一个兜底 AppSpec；
- 不要返回空字段；
- `name` 可以从 prompt 简单提取；
- `pages` 至少 4 个；
- `components` 至少 5 个；
- `features` 至少 4 个；
- `theme` 默认为 `"light"`。

### 3.2 `normalizeAppSpec(input: unknown, prompt: string): AppSpec`

要求：

- 校验 AI 返回的数据；
- 如果字段缺失，用 fallback 补齐；
- `pages`、`components`、`features` 必须是字符串数组；
- `theme` 只能是 `"light" | "dark" | "colorful"`；
- 最终永远返回一个合法 AppSpec。

### 3.3 `extractJsonFromText(text: string): unknown`

要求：

- 优先直接 `JSON.parse(text)`；
- 如果失败，尝试从文本中提取第一个 `{...}` JSON 片段；
- 仍失败则抛错，由调用方 fallback。

---

## 4. 实现 `/api/generate`

修改：

```txt
app/api/generate/route.ts
```

要求：

- 只支持 POST；
- 使用 Clerk server-side `auth()` 获取 `userId`；
- 未登录返回 401；
- 从 request body 读取 `prompt`；
- prompt 为空返回 400；
- 从环境变量读取：
  - `SILICONFLOW_API_KEY`
  - `SILICONFLOW_BASE_URL`
  - `SILICONFLOW_MODEL`
- 如果缺少 API Key 或 model，不要崩溃，返回 fallback AppSpec，并带上：
  - `source: "fallback"`
  - `warning: "SiliconFlow environment variables are not configured."`

---

## 5. SiliconFlow 调用方式

使用 `fetch` 调用：

```ts
`${baseUrl}/chat/completions`
```

请求头：

```ts
{
  "Authorization": `Bearer ${apiKey}`,
  "Content-Type": "application/json"
}
```

请求体：

```ts
{
  model,
  messages: [
    {
      role: "system",
      content: "You are an AI app architect..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.4,
  max_tokens: 1200,
  response_format: { type: "json_object" }
}
```

system prompt 要求模型只返回 JSON：

- 不要 Markdown；
- 不要解释；
- 不要代码块；
- 只返回一个 JSON object。

JSON 结构必须是：

```json
{
  "name": "string",
  "description": "string",
  "pages": ["string"],
  "components": ["string"],
  "features": ["string"],
  "theme": "light"
}
```

约束：

- `theme` 只能是 `light`、`dark`、`colorful`；
- `pages` 至少 4 个；
- `components` 至少 5 个；
- `features` 至少 4 个；
- 内容可以根据用户 prompt 使用中文或英文；
- 字段名必须是英文。

---

## 6. API 返回格式

成功时返回：

```json
{
  "appSpec": {},
  "source": "siliconflow"
}
```

fallback 时返回：

```json
{
  "appSpec": {},
  "source": "fallback",
  "warning": "..."
}
```

---

## 7. 错误处理

必须处理以下情况：

- SiliconFlow 返回非 2xx；
- JSON 解析失败；
- fetch 超时；
- 网络失败；
- 模型返回非预期结构；
- 环境变量未配置。

处理要求：

- `console.error` 记录关键信息；
- 返回 fallback AppSpec；
- 不要让页面白屏；
- 不要让 API 直接 500 崩溃，除非是非常不可恢复的错误。

---

## 8. 创建 Builder 客户端组件

如果现有 `app/builder/page.tsx` 是服务端页面，请保留它作为页面入口，并创建：

```txt
components/builder-client.tsx
```

让 `app/builder/page.tsx` 读取 `searchParams` 中的 `prompt`，然后把 prompt 传给 `BuilderClient`。

`BuilderClient` 要求：

- 是 client component；
- 接收 `initialPrompt: string`；
- 页面加载后自动调用 `/api/generate`；
- 显示 loading 状态；
- 显示 source；
- 如果是 fallback，要显示 warning；
- 管理 agent steps 状态；
- 成功后展示 `appSpec`；
- 失败时也展示 fallback 结果；
- 不要重复调用 API，注意 `useEffect` 依赖；
- 不要在服务端组件里使用 `window`、`sessionStorage`、`useState`、`useEffect`。

---

## 9. Agent Steps UI

更新或替换：

```txt
components/agent-steps-placeholder.tsx
```

可以重命名为：

```txt
components/agent-steps.tsx
```

要求：

- 接收 `steps: AgentStep[]`；
- 根据 status 展示 `pending` / `running` / `completed` / `error`；
- 使用 lucide-react 图标增强：
  - `Loader2`
  - `CheckCircle2`
  - `Circle`
  - `AlertCircle`
- running 状态可以有简单旋转动画；
- 风格与当前 Builder 页面一致。

默认步骤：

```ts
[
  {
    id: "understand",
    title: "Understanding request",
    description: "Analyzing the product idea and user intent.",
    status: "pending"
  },
  {
    id: "plan",
    title: "Planning app structure",
    description: "Designing pages, flows, and core modules.",
    status: "pending"
  },
  {
    id: "components",
    title: "Generating components",
    description: "Mapping the idea into UI blocks and interactions.",
    status: "pending"
  },
  {
    id: "preview",
    title: "Rendering preview",
    description: "Creating a visual app preview from the generated spec.",
    status: "pending"
  }
]
```

---

## 10. App Preview UI

更新或替换：

```txt
components/app-preview-placeholder.tsx
```

可以重命名为：

```txt
components/app-preview.tsx
```

要求：

- 接收 `appSpec: AppSpec | null`；
- 如果 appSpec 为空，显示空态；
- 如果有 appSpec，动态渲染：
  - 应用名称；
  - 应用描述；
  - 页面导航 tabs；
  - 功能卡片；
  - 组件列表；
  - 一个模拟应用主区域；
- 根据 `theme` 简单调整视觉：
  - `light`：白色卡片；
  - `dark`：深色预览；
  - `colorful`：渐变色卡片；
- 视觉要尽量像一个真正生成出来的小应用，而不是纯 JSON。

---

## 11. Builder 页面布局

更新 Builder 页面，使其变成：

- 顶部栏：
  - miniAtoms Builder
  - 当前 prompt 简短展示
  - Back Home
  - Projects
- 主体：
  - 左侧 36%：Agent Steps + Generation Info
  - 右侧 64%：App Preview
- 页面背景可以用柔和渐变或浅灰背景；
- 保持响应式，移动端上下堆叠。

---

## 12. README 更新

更新 README，增加 Step 4 内容：

- 已接入 SiliconFlow API；
- `/api/generate` 的作用；
- 需要配置的环境变量；
- fallback 策略；
- 当前还未接入 Neon，项目保存会在下一步完成。

---

## 13. 验收标准

完成后请确保：

1. `npm run dev` 正常；
2. 未登录不能访问 `/builder`；
3. 已登录访问 `/builder?prompt=帮我生成一个健身打卡应用` 会自动生成 AppSpec；
4. 如果没有配置 SiliconFlow 环境变量，也能显示 fallback App Preview；
5. 配置 SiliconFlow 后，API 使用真实模型返回 AppSpec；
6. 任何 API 失败都不会导致页面白屏；
7. 不要破坏首页登录流程；
8. 不要破坏 Clerk middleware；
9. 不要破坏已有页面结构；
10. 不要引入 React Router。

---

## 14. 完成后请输出

1. 修改了哪些文件；
2. 我需要配置哪些环境变量；
3. 如何测试 SiliconFlow 是否生效；
4. 下一步建议。

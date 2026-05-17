# Step 6：支持已保存项目 AI 继续迭代 — Claude Code 最终执行指令

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
- Neon PostgreSQL 项目持久化
- 项目列表、项目详情、删除项目

现在进入 **Step 6：支持对已保存项目进行 AI 继续迭代**。

请基于现有项目修改：

- 不要重建项目；
- 不要破坏现有 Clerk 登录流程；
- 不要破坏首页 Prompt 流程；
- 不要破坏 SiliconFlow 初次生成流程；
- 不要破坏现有 App Preview 交互能力；
- 不要破坏现有 Neon 保存、列表、详情、删除功能；
- 不要接 Prisma；
- 不要接 Drizzle；
- 不要引入 React Router；
- 不要引入 shadcn/ui。

---

## 当前目标

在项目详情页 `/projects/[id]` 增加“继续迭代”能力。

用户可以输入修改指令，例如：

```txt
增加预算提醒功能
```

或：

```txt
把应用改成暗色风格
```

或：

```txt
增加一个月度统计页面
```

系统会调用 SiliconFlow，将当前项目的 `appSpec`、原始 `prompt` 和用户的 `instruction` 一起传给模型，让模型返回新版 `AppSpec`。

前端展示新版可交互 App Preview，并提示用户有未保存修改。

用户点击：

```txt
Save Changes
```

后，将新版 `appSpec` 保存回 Neon，直接覆盖当前项目。

---

## 1. 新增 `/api/iterate`

创建：

```txt
app/api/iterate/route.ts
```

实现 `POST /api/iterate`。

请求 body：

```json
{
  "prompt": "帮我生成一个个人记账应用",
  "instruction": "增加预算提醒功能",
  "appSpec": {}
}
```

返回：

```json
{
  "appSpec": {},
  "source": "siliconflow"
}
```

fallback 返回：

```json
{
  "appSpec": {},
  "source": "fallback",
  "warning": "..."
}
```

要求：

- 使用 Clerk server-side `auth()` 获取 `userId`；
- 未登录返回 401；
- 校验：
  - `prompt` 必须是字符串；
  - `instruction` 必须是非空字符串；
  - `appSpec` 必须存在；
- 读取环境变量：
  - `SILICONFLOW_API_KEY`
  - `SILICONFLOW_BASE_URL`
  - `SILICONFLOW_MODEL`
- SiliconFlow 只能在 server-side API route 里调用；
- 不要把 API Key 暴露到前端；
- 如果环境变量缺失，返回 fallback；
- 如果模型调用失败，返回 fallback；
- 如果 JSON 解析失败，返回 fallback；
- 页面不能因为 API 失败而白屏。

---

## 2. 迭代 API 的模型提示词

`/api/iterate` 的 system prompt 要求模型扮演 AI app iteration architect。

它需要根据：

1. 原始用户需求 `prompt`
2. 当前 AppSpec
3. 新的修改指令 `instruction`

生成一个完整的新 AppSpec。

重要要求：

- 必须返回完整 AppSpec，不要只返回 diff；
- 必须保留原应用中仍然合理的 pages、components、features；
- 必须根据 instruction 做明确变化；
- 如果 instruction 是“改成暗色风格”，则 `theme` 应为 `"dark"`；
- 如果 instruction 是“增加统计页面”，则 `pages` 和 `interactivePreview.tabs` 中应包含统计相关页面；
- 如果 instruction 是“增加提醒功能”，则 `features`、`components`、`interactivePreview.formFields` 或 `sampleRecords` 应体现提醒能力；
- 如果 instruction 是中文，内容尽量中文；
- 字段名必须英文；
- 不要 Markdown；
- 不要代码块；
- 不要解释；
- 只返回 JSON object。

返回 JSON 结构必须和现有 `AppSpec` 兼容，包含：

```json
{
  "name": "string",
  "description": "string",
  "pages": ["string"],
  "components": ["string"],
  "features": ["string"],
  "theme": "light",
  "interactivePreview": {
    "primaryEntityName": "string",
    "tabs": ["string"],
    "defaultTab": "string",
    "formTitle": "string",
    "formFields": [
      {
        "id": "string",
        "label": "string",
        "type": "text",
        "placeholder": "string",
        "options": ["string"],
        "required": false
      }
    ],
    "sampleRecords": [
      {
        "id": "string",
        "title": "string",
        "subtitle": "string",
        "amount": 100,
        "type": "neutral",
        "category": "string",
        "status": "string",
        "createdAt": "string"
      }
    ],
    "metrics": [
      {
        "id": "string",
        "label": "string",
        "value": "string",
        "hint": "string"
      }
    ],
    "actions": [
      {
        "id": "string",
        "label": "string",
        "type": "add_record"
      }
    ]
  }
}
```

字段约束：

- `theme` 只能是 `light`、`dark`、`colorful`；
- `field.type` 只能是 `text`、`number`、`select`、`textarea`；
- `record.type` 只能是 `income`、`expense`、`neutral`；
- `action.type` 只能是 `add_record`、`delete_record`、`toggle_status`、`switch_tab`；
- `tabs` 至少 3 个；
- `formFields` 至少 3 个；
- `sampleRecords` 至少 2 条；
- `metrics` 至少 3 个。

---

## 3. 复用现有 AppSpec 工具函数

请复用现有：

```txt
lib/app-spec.ts
```

尤其是：

```ts
extractJsonFromText()
normalizeAppSpec()
createFallbackAppSpec()
```

如果需要，请新增：

```ts
export function createIteratedFallbackAppSpec(input: {
  prompt: string;
  instruction: string;
  appSpec: AppSpec;
}): AppSpec
```

要求：

- 当 SiliconFlow 失败时，也能基于 instruction 做一个简单可见的变化；
- 如果 instruction 包含“暗色”或 “dark”，返回 theme 为 `"dark"`；
- 如果 instruction 包含“统计”或 “analytics”，确保 pages 和 interactivePreview.tabs 中包含统计页；
- 如果 instruction 包含“提醒”或 “reminder”，确保 features 中包含提醒相关功能；
- 如果无法识别，则至少把 instruction 追加到 features 中；
- 最终仍然通过 `normalizeAppSpec()` 保证结构合法。

---

## 4. 实现 `PUT /api/projects/[id]`

修改：

```txt
app/api/projects/[id]/route.ts
```

新增真实 `PUT` 支持。

请求 body：

```json
{
  "title": "新版项目名称",
  "appSpec": {}
}
```

要求：

- 使用 Clerk server-side `auth()` 获取 `userId`；
- 未登录返回 401；
- 读取 route param `id`；
- 校验项目属于当前用户；
- 校验：
  - `title` 如果存在，必须是非空字符串；
  - `appSpec` 必须存在；
- 更新：
  - `title`
  - `app_spec`
  - `updated_at = NOW()`
- 只能更新当前用户自己的项目；
- 更新成功返回：

```json
{
  "project": {}
}
```

- 如果项目不存在，返回 404；
- 如果参数错误，返回 400；
- 如果数据库错误，返回 500 友好错误。

---

## 5. 更新项目数据访问层

修改：

```txt
lib/projects.ts
```

新增函数：

```ts
export async function updateProject(input: {
  id: string;
  userId: string;
  title: string;
  appSpec: AppSpec;
}): Promise<Project | null>;
```

要求：

- SQL 必须带 `WHERE id = ${id} AND user_id = ${userId}`；
- 更新后返回完整 Project；
- 做 snake_case 到 camelCase 映射；
- 不允许更新其他用户的项目。

---

## 6. 更新 middleware 保护 `/api/iterate`

修改：

```txt
middleware.ts
```

确保 `/api/iterate(.*)` 是受保护路由。

未登录用户不能调用 `/api/iterate`。

---

## 7. 更新项目详情页交互

修改：

```txt
components/project-detail-client.tsx
```

在项目详情页增加“继续迭代”区域。

### UI 要求

页面建议布局：

```txt
左侧：
- 项目信息
- 原始 prompt
- pages / features / components 摘要
- Continue building 输入框
- 快捷指令按钮

右侧：
- App Preview
- Unsaved changes 提示
- Save Changes 按钮
```

### 迭代输入框

增加 textarea：

placeholder：

```txt
Ask miniAtoms to improve this app...
```

中文也可以：

```txt
告诉 miniAtoms 你想怎么修改这个应用...
```

快捷按钮建议：

```txt
增加统计页面
改成暗色风格
增加提醒功能
优化首页布局
```

用户点击快捷按钮时，可以把内容填入输入框，或直接触发迭代。

---

## 8. 详情页迭代逻辑

在 `ProjectDetailClient` 中维护状态：

```ts
const [currentAppSpec, setCurrentAppSpec] = useState(project.appSpec);
const [instruction, setInstruction] = useState("");
const [isIterating, setIsIterating] = useState(false);
const [isSavingChanges, setIsSavingChanges] = useState(false);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [iterateError, setIterateError] = useState<string | null>(null);
const [iterateWarning, setIterateWarning] = useState<string | null>(null);
```

点击 `Iterate`：

- 校验 instruction 非空；
- 调用 `POST /api/iterate`；
- body：

```ts
{
  prompt: project.prompt,
  instruction,
  appSpec: currentAppSpec
}
```

成功后：

- `setCurrentAppSpec(result.appSpec)`；
- `setHasUnsavedChanges(true)`；
- 清空 instruction；
- 如果 source 是 fallback，显示 warning；
- AppPreview 应立即显示新版结果。

失败时：

- 显示错误；
- 不要让页面崩。

---

## 9. 保存修改逻辑

当 `hasUnsavedChanges === true` 时显示：

```txt
Unsaved changes
Save Changes
```

点击 `Save Changes`：

调用：

```txt
PUT /api/projects/[id]
```

body：

```ts
{
  title: currentAppSpec.name,
  appSpec: currentAppSpec
}
```

成功后：

- 更新本地 project 状态；
- `setHasUnsavedChanges(false)`；
- 显示 `Changes saved`;
- 更新时间刷新；
- 页面继续显示新版 AppPreview。

失败时：

- 显示错误；
- 不要丢失当前未保存的 `currentAppSpec`。

---

## 10. App Preview 复用

继续复用：

```txt
components/app-preview.tsx
```

要求：

- 不要为迭代单独写一套 Preview；
- 新版 AppSpec 传进去后，预览自动变化；
- 如果 theme 改成 dark，预览区域应明显变暗；
- 如果新增页面，tabs 应变化；
- 如果新增功能，features 或 formFields 应变化。

---

## 11. README 更新

更新 README，增加 Step 6 内容：

- 已支持 AI 继续迭代；
- 新增 `/api/iterate`；
- 新增 `PUT /api/projects/[id]`；
- 支持在项目详情页输入修改指令；
- 支持生成新版预览；
- 支持手动 Save Changes 覆盖当前项目；
- 当前暂不支持版本历史和回滚。

---

## 12. 验收标准

完成后我会测试：

### 测试 1：暗色模式迭代

1. 保存一个“个人记账应用”项目；
2. 进入详情页；
3. 输入：

```txt
改成暗色风格
```

4. 点击 Iterate。

预期：

- App Preview 变成 dark theme；
- 显示 Unsaved changes；
- 点击 Save Changes 后刷新详情页仍是 dark theme。

### 测试 2：增加统计页面

输入：

```txt
增加一个月度统计页面
```

预期：

- pages 中增加统计相关页面；
- App Preview tabs 中有统计相关 tab；
- features 中有统计能力；
- Save Changes 后持久化。

### 测试 3：增加提醒功能

输入：

```txt
增加预算提醒功能
```

预期：

- features 中出现提醒相关功能；
- components 或 formFields 中体现提醒能力；
- App Preview 可正常交互；
- Save Changes 后持久化。

### 测试 4：API 失败 fallback

临时移除或改错 SiliconFlow API Key。

输入：

```txt
增加统计页面
```

预期：

- 页面不白屏；
- 使用 fallback 生成可见变化；
- 显示 warning；
- 仍可 Save Changes。

### 测试 5：用户隔离

用另一个账号尝试更新别人的项目。

预期：

- 无法更新；
- API 返回 404 或 403；
- 不会改到别人的数据。

---

## 13. 质量要求

- 不要引入大型依赖；
- 不要引入图表库；
- 不要引入 React Router；
- 不要引入 shadcn/ui；
- 不要使用 dangerouslySetInnerHTML；
- 不要让模型返回可执行代码；
- 不要让 API Key 暴露到前端；
- 不要让未登录用户调用 iterate；
- 不要让用户更新别人的项目；
- TypeScript 不能有明显错误；
- `npm run dev` 必须正常；
- `npm run build` 尽量正常；
- 保持现有 UI 风格；
- 不要大规模重写无关文件。

---

## 14. 完成后请输出

1. 修改了哪些文件；
2. 新增了哪些功能；
3. 如何测试继续迭代；
4. 如何测试保存修改；
5. 当前还有哪些限制；
6. 下一步建议。

# Step 4.5：让 App Preview 具备真实交互能力 — Claude Code 执行指令

你是一个资深 AI Native 全栈工程师。当前 miniAtoms 已经完成：

- Next.js App Router
- Clerk 登录
- SiliconFlow API 接入
- Builder 页面
- Agent Steps
- 根据 AppSpec 渲染 App Preview

现在进入下一步：让配置了 SiliconFlow API Key 后生成的 App Preview 具备真实交互能力。

请基于现有项目修改：

- 不要重建项目；
- 不要破坏现有登录流程；
- 不要破坏首页；
- 不要破坏 Builder；
- 不要破坏 SiliconFlow 调用流程。

---

## 当前问题

现在 `/builder?prompt=帮我生成一个个人记账应用` 可以生成 AppSpec，并在右侧 App Preview 中展示应用名称、页面、功能、组件等内容。

但是当前预览只是静态展示，用户无法在预览里进行操作。

我希望生成的预览像一个真正的小应用原型一样，可以交互。

例如用户输入：

```txt
帮我生成一个个人记账应用
```

生成的 App Preview 应该可以：

- 点击不同页面 tab，例如：首页、记账页、统计页、账单明细页；
- 在记账页输入金额、分类、备注；
- 点击按钮添加一条模拟账单；
- 新增记录后，账单列表和统计数字会更新；
- 可以删除一条模拟记录；
- 可以切换收入 / 支出类型；
- 统计页能根据模拟记录展示收入、支出、余额等数据。

如果用户生成的是其他类型应用，也应该有通用交互能力，例如：

- 表单输入；
- 添加记录；
- 删除记录；
- 切换页面；
- 切换状态；
- 更新统计卡片；
- 展示列表数据。

---

## 重要原则

不要让 SiliconFlow 直接返回 React 代码。

请继续使用结构化 JSON 的方式，让模型返回更丰富的 AppSpec。前端根据 AppSpec 渲染可交互预览。

也就是说：

```txt
SiliconFlow 负责生成应用结构和交互配置；
React 前端负责渲染和执行交互。
```

这样可以保证 Demo 稳定、安全、可控。

---

## 1. 扩展 AppSpec 类型

请更新 `lib/types.ts`。

在保持现有字段兼容的基础上，扩展 AppSpec。

当前字段大概是：

```ts
export type AppSpec = {
  name: string;
  description: string;
  pages: string[];
  components: string[];
  features: string[];
  theme: "light" | "dark" | "colorful";
};
```

请扩展为类似结构：

```ts
export type AppTheme = "light" | "dark" | "colorful";

export type PreviewField = {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

export type PreviewRecord = {
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  type?: "income" | "expense" | "neutral";
  category?: string;
  status?: string;
  createdAt?: string;
};

export type PreviewAction = {
  id: string;
  label: string;
  type: "add_record" | "delete_record" | "toggle_status" | "switch_tab";
};

export type PreviewMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type InteractivePreview = {
  primaryEntityName: string;
  tabs: string[];
  defaultTab: string;
  formTitle: string;
  formFields: PreviewField[];
  sampleRecords: PreviewRecord[];
  metrics: PreviewMetric[];
  actions: PreviewAction[];
};

export type AppSpec = {
  name: string;
  description: string;
  pages: string[];
  components: string[];
  features: string[];
  theme: AppTheme;
  interactivePreview?: InteractivePreview;
};
```

要求：

- 保持向后兼容；
- 如果旧数据没有 `interactivePreview`，AppPreview 也不能报错；
- fallback AppSpec 也要包含一个默认的 interactivePreview。

---

## 2. 更新 fallback 生成逻辑

请更新 `lib/app-spec.ts` 中的 `createFallbackAppSpec(prompt: string)`。

要求：

- fallback 也要生成 `interactivePreview`；
- 如果 prompt 包含“记账”、“账单”、“收入”、“支出”等关键词，则 fallback 生成记账应用的交互预览；
- 否则生成通用管理类应用的交互预览。

记账类 fallback 示例：

```ts
interactivePreview: {
  primaryEntityName: "Transaction",
  tabs: ["首页", "记账页", "统计页", "账单明细"],
  defaultTab: "首页",
  formTitle: "新增账单",
  formFields: [
    {
      id: "title",
      label: "账单名称",
      type: "text",
      placeholder: "例如：午餐、工资、交通"
    },
    {
      id: "amount",
      label: "金额",
      type: "number",
      placeholder: "输入金额"
    },
    {
      id: "type",
      label: "类型",
      type: "select",
      options: ["支出", "收入"]
    },
    {
      id: "category",
      label: "分类",
      type: "select",
      options: ["餐饮", "交通", "购物", "工资", "其他"]
    },
    {
      id: "note",
      label: "备注",
      type: "textarea",
      placeholder: "补充说明"
    }
  ],
  sampleRecords: [
    {
      id: "r1",
      title: "午餐",
      subtitle: "餐饮 · 今天",
      amount: 35,
      type: "expense",
      category: "餐饮",
      createdAt: "今天"
    },
    {
      id: "r2",
      title: "工资",
      subtitle: "收入 · 本月",
      amount: 8000,
      type: "income",
      category: "工资",
      createdAt: "本月"
    }
  ],
  metrics: [
    {
      id: "income",
      label: "本月收入",
      value: "¥8,000"
    },
    {
      id: "expense",
      label: "本月支出",
      value: "¥35"
    },
    {
      id: "balance",
      label: "结余",
      value: "¥7,965"
    }
  ],
  actions: [
    {
      id: "add",
      label: "添加记录",
      type: "add_record"
    },
    {
      id: "delete",
      label: "删除记录",
      type: "delete_record"
    }
  ]
}
```

---

## 3. 更新 normalizeAppSpec

请更新 `normalizeAppSpec(input, prompt)`。

要求：

- 校验 `interactivePreview`；
- 如果缺失或结构不合法，用 fallback 的 `interactivePreview` 补齐；
- `tabs` 必须至少 3 个；
- `formFields` 必须至少 3 个；
- `sampleRecords` 至少 2 条；
- `metrics` 至少 3 个；
- 所有 id 都必须是字符串；
- 所有字段缺失时要有兜底；
- 最终返回的 AppSpec 一定可以被前端安全渲染。

---

## 4. 更新 SiliconFlow system prompt

请修改 `/api/generate/route.ts` 中调用 SiliconFlow 的 system prompt。

要求模型返回新的 AppSpec JSON，包含 `interactivePreview`。

新的 JSON 结构必须是：

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

system prompt 需要明确告诉模型：

- 只返回 JSON object；
- 不要 Markdown；
- 不要解释；
- 字段名必须是英文；
- 内容语言可以跟随用户 prompt；
- 如果用户要的是记账应用，必须生成适合记账的 tabs、formFields、sampleRecords、metrics；
- 如果是任务管理应用，生成任务相关字段；
- 如果是健身打卡应用，生成训练记录相关字段；
- 如果是学习计划应用，生成课程、任务或进度相关字段；
- `theme` 只能是 `light`、`dark`、`colorful`；
- `field.type` 只能是 `text`、`number`、`select`、`textarea`；
- `record.type` 只能是 `income`、`expense`、`neutral`；
- `action.type` 只能是 `add_record`、`delete_record`、`toggle_status`、`switch_tab`。

---

## 5. 重写 AppPreview 为可交互组件

请更新 `components/app-preview.tsx`。

要求：

- 必须是 client component；
- 接收 `appSpec: AppSpec | null`；
- 如果没有 appSpec，显示空状态；
- 如果有 appSpec，读取 `appSpec.interactivePreview`；
- 支持 tab 切换；
- 支持表单输入；
- 支持新增记录；
- 支持删除记录；
- 支持根据记录动态计算简单统计；
- UI 看起来像一个真实的小应用，而不是表单 demo。

---

### 5.1 Tab 切换

根据 `interactivePreview.tabs` 渲染顶部 tabs。

用户点击 tab 后，右侧内容区域切换。

至少支持：

- 首页 / Overview；
- 表单页；
- 统计页；
- 列表页。

如果 AI 返回的 tab 名称不同，也要兼容。

---

### 5.2 首页 / Overview

显示：

- 应用名称；
- 应用描述；
- metrics 卡片；
- 最近 records；
- 快捷入口按钮。

---

### 5.3 表单页

根据 `interactivePreview.formFields` 动态渲染表单。

字段类型支持：

- text
- number
- select
- textarea

用户填写后点击按钮，可以新增一条 record。

新增 record 逻辑：

- title 从第一个 text 字段取；
- amount 从第一个 number 字段取；
- type 如果 select 中包含“收入”，则为 income；如果包含“支出”，则为 expense；否则 neutral；
- category 从 category 字段或 select 字段取；
- subtitle 自动生成；
- createdAt 使用 “Just now” 或 “刚刚”；
- id 使用 `crypto.randomUUID()`，如果不可用则用时间戳。

新增成功后：

- 清空表单；
- 切换到列表页或显示成功提示；
- 记录列表更新；
- metrics 更新。

---

### 5.4 统计页

展示动态统计。

对于记账类应用：

- 计算总收入；
- 计算总支出；
- 计算余额；
- 展示记录数量。

对于通用应用：

- 展示总记录数；
- 已完成数量；
- 活跃记录数；
- 最近更新时间。

不要求画真实图表，可以用进度条、统计卡片、简易条形图模拟。

---

### 5.5 列表页

展示 records 列表。

每条 record 显示：

- title；
- subtitle；
- amount，如果有；
- category；
- status；
- createdAt；
- 删除按钮。

点击删除按钮后，该记录从列表移除，并更新统计。

---

## 6. 主题支持

根据 `appSpec.theme` 调整预览区域样式：

- `light`：白色背景、浅灰边框；
- `dark`：深色背景、浅色文字；
- `colorful`：渐变背景、彩色卡片。

注意：

- 不要影响整个 Builder 页面；
- 只影响 App Preview 内部模拟应用。

---

## 7. Builder 页面不用大改

`components/builder-client.tsx` 不需要重写，只要能正常把新的 AppSpec 传给 AppPreview。

如果类型报错，请修复。

---

## 8. 兼容 fallback 和旧数据

必须保证以下情况都不会崩：

- SiliconFlow 没有配置；
- SiliconFlow 返回旧版 AppSpec，没有 interactivePreview；
- SiliconFlow 返回字段不完整；
- records 没有 amount；
- formFields 没有 options；
- tabs 为空；
- 用户连续添加和删除记录。

---

## 9. 验收方式

完成后我会测试：

### 测试 1：记账应用

prompt：

```txt
帮我生成一个个人记账应用
```

预期：

- 预览里有多个 tab；
- 能进入记账 / 表单页面；
- 能输入账单名称、金额、类型、分类；
- 能添加记录；
- 添加后列表更新；
- 统计数字更新；
- 能删除记录。

### 测试 2：健身打卡应用

prompt：

```txt
帮我生成一个健身打卡应用
```

预期：

- 预览里有训练或打卡相关字段；
- 能添加训练记录；
- 能查看记录列表；
- 能看到统计信息。

### 测试 3：任务看板应用

prompt：

```txt
帮我做一个团队任务看板，支持任务状态、负责人和截止时间
```

预期：

- 预览里有任务相关字段；
- 能添加任务；
- 能删除任务；
- 能查看任务列表和统计。

---

## 10. 质量要求

- 保持现有 UI 风格；
- 不要引入大型依赖；
- 不要引入图表库；
- 不要引入 shadcn/ui；
- 不要引入 React Router；
- 不要接 Neon；
- 不要实现保存项目；
- 不要让模型返回可执行代码；
- 不要使用 `dangerouslySetInnerHTML`；
- 不要让页面白屏；
- TypeScript 不能有明显类型错误；
- `npm run dev` 必须正常；
- `npm run build` 尽量正常。

---

## 完成后请输出

1. 修改的文件列表；
2. 新增的交互能力；
3. 如何测试；
4. 下一步建议。

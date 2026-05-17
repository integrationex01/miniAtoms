import type {
  AppSpec,
  AppTheme,
  InteractivePreview,
  PreviewField,
  PreviewRecord,
  PreviewMetric,
  PreviewAction,
} from "./types";

const VALID_THEMES: AppTheme[] = ["light", "dark", "colorful"];
const VALID_FIELD_TYPES = ["text", "number", "select", "textarea"] as const;
const VALID_RECORD_TYPES = ["income", "expense", "neutral"] as const;
const VALID_ACTION_TYPES = [
  "add_record",
  "delete_record",
  "toggle_status",
  "switch_tab",
] as const;

function isAccountingPrompt(prompt: string): boolean {
  const keywords = ["记账", "账单", "收入", "支出", "财务", "预算", "accounting", "finance", "expense", "budget"];
  return keywords.some((k) => prompt.toLowerCase().includes(k));
}

function createAccountingPreview(): InteractivePreview {
  return {
    primaryEntityName: "Transaction",
    tabs: ["首页", "记账页", "统计页", "账单明细"],
    defaultTab: "首页",
    formTitle: "新增账单",
    formFields: [
      {
        id: "title",
        label: "账单名称",
        type: "text",
        placeholder: "例如：午餐、工资、交通",
      },
      {
        id: "amount",
        label: "金额",
        type: "number",
        placeholder: "输入金额",
      },
      {
        id: "type",
        label: "类型",
        type: "select",
        options: ["支出", "收入"],
      },
      {
        id: "category",
        label: "分类",
        type: "select",
        options: ["餐饮", "交通", "购物", "工资", "其他"],
      },
      {
        id: "note",
        label: "备注",
        type: "textarea",
        placeholder: "补充说明",
      },
    ],
    sampleRecords: [
      {
        id: "r1",
        title: "午餐",
        subtitle: "餐饮 · 今天",
        amount: 35,
        type: "expense",
        category: "餐饮",
        createdAt: "今天",
      },
      {
        id: "r2",
        title: "工资",
        subtitle: "收入 · 本月",
        amount: 8000,
        type: "income",
        category: "工资",
        createdAt: "本月",
      },
    ],
    metrics: [
      { id: "income", label: "本月收入", value: "¥8,000" },
      { id: "expense", label: "本月支出", value: "¥35" },
      { id: "balance", label: "结余", value: "¥7,965" },
    ],
    actions: [
      { id: "add", label: "添加记录", type: "add_record" },
      { id: "delete", label: "删除记录", type: "delete_record" },
    ],
  };
}

function createGenericPreview(prompt: string): InteractivePreview {
  const shortName =
    prompt.length > 20 ? prompt.slice(0, 20) + "..." : prompt;
  return {
    primaryEntityName: "Item",
    tabs: ["Overview", "Add New", "Stats", "Records"],
    defaultTab: "Overview",
    formTitle: `Add new item`,
    formFields: [
      {
        id: "title",
        label: "Title",
        type: "text",
        placeholder: "Enter title",
      },
      {
        id: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter details",
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: ["Work", "Personal", "Learning", "Other"],
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: ["Active", "Pending", "Done"],
      },
    ],
    sampleRecords: [
      {
        id: "r1",
        title: "Sample item 1",
        subtitle: "Work · Active",
        category: "Work",
        status: "Active",
        createdAt: "Today",
      },
      {
        id: "r2",
        title: "Sample item 2",
        subtitle: "Personal · Pending",
        category: "Personal",
        status: "Pending",
        createdAt: "Yesterday",
      },
    ],
    metrics: [
      { id: "total", label: "Total", value: "2" },
      { id: "active", label: "Active", value: "1" },
      { id: "pending", label: "Pending", value: "1" },
    ],
    actions: [
      { id: "add", label: "Add item", type: "add_record" },
      { id: "delete", label: "Delete item", type: "delete_record" },
    ],
  };
}

export function createFallbackAppSpec(prompt: string): AppSpec {
  const shortName =
    prompt.length > 30 ? prompt.slice(0, 30) + "..." : prompt;

  const interactivePreview = isAccountingPrompt(prompt)
    ? createAccountingPreview()
    : createGenericPreview(prompt);

  return {
    name: shortName,
    description: `An app based on: "${prompt}"`,
    pages: interactivePreview.tabs,
    components: [
      "Header",
      "Navigation",
      "Content Card",
      "Form",
      "Record List",
    ],
    features: [
      "Data management",
      "Record creation",
      "Statistics dashboard",
      "Responsive layout",
    ],
    theme: "light",
    interactivePreview,
  };
}

function toStringArray(val: unknown, fallbackArr: string[]): string[] {
  if (Array.isArray(val) && val.every((v) => typeof v === "string"))
    return val;
  return fallbackArr;
}

function normalizeFields(
  raw: unknown,
  fallback: PreviewField[]
): PreviewField[] {
  if (!Array.isArray(raw)) return fallback;
  return raw
    .map((f: unknown, i: number) => {
      if (!f || typeof f !== "object") return fallback[i] || fallback[0];
      const field = f as Record<string, unknown>;
      const type = VALID_FIELD_TYPES.includes(field.type as typeof VALID_FIELD_TYPES[number])
        ? (field.type as PreviewField["type"])
        : "text";
      return {
        id: typeof field.id === "string" ? field.id : `field_${i}`,
        label: typeof field.label === "string" ? field.label : `Field ${i + 1}`,
        type,
        placeholder:
          typeof field.placeholder === "string" ? field.placeholder : "",
        options: Array.isArray(field.options)
          ? field.options.filter((o: unknown) => typeof o === "string")
          : [],
        required: field.required === true,
      } satisfies PreviewField;
    })
    .filter(Boolean);
}

function normalizeRecords(
  raw: unknown,
  fallback: PreviewRecord[]
): PreviewRecord[] {
  if (!Array.isArray(raw)) return fallback;
  return raw.map((r: unknown, i: number) => {
    if (!r || typeof r !== "object") return fallback[i] || fallback[0];
    const rec = r as Record<string, unknown>;
    const type = VALID_RECORD_TYPES.includes(rec.type as typeof VALID_RECORD_TYPES[number])
      ? (rec.type as PreviewRecord["type"])
      : undefined;
    return {
      id: typeof rec.id === "string" ? rec.id : `rec_${i}`,
      title: typeof rec.title === "string" ? rec.title : `Record ${i + 1}`,
      subtitle: typeof rec.subtitle === "string" ? rec.subtitle : "",
      amount: typeof rec.amount === "number" ? rec.amount : undefined,
      type,
      category: typeof rec.category === "string" ? rec.category : undefined,
      status: typeof rec.status === "string" ? rec.status : undefined,
      createdAt: typeof rec.createdAt === "string" ? rec.createdAt : undefined,
    };
  });
}

function normalizeMetrics(
  raw: unknown,
  fallback: PreviewMetric[]
): PreviewMetric[] {
  if (!Array.isArray(raw)) return fallback;
  return raw.map((m: unknown, i: number) => {
    if (!m || typeof m !== "object") return fallback[i] || fallback[0];
    const metric = m as Record<string, unknown>;
    return {
      id: typeof metric.id === "string" ? metric.id : `metric_${i}`,
      label: typeof metric.label === "string" ? metric.label : `Metric ${i + 1}`,
      value: typeof metric.value === "string" ? metric.value : "0",
      hint: typeof metric.hint === "string" ? metric.hint : undefined,
    };
  });
}

function normalizeActions(
  raw: unknown,
  fallback: PreviewAction[]
): PreviewAction[] {
  if (!Array.isArray(raw)) return fallback;
  return raw.map((a: unknown, i: number) => {
    if (!a || typeof a !== "object") return fallback[i] || fallback[0];
    const action = a as Record<string, unknown>;
    const type = VALID_ACTION_TYPES.includes(action.type as typeof VALID_ACTION_TYPES[number])
      ? (action.type as PreviewAction["type"])
      : "add_record";
    return {
      id: typeof action.id === "string" ? action.id : `action_${i}`,
      label: typeof action.label === "string" ? action.label : "Action",
      type,
    };
  });
}

function normalizeInteractivePreview(
  raw: unknown,
  fallback: InteractivePreview
): InteractivePreview {
  if (!raw || typeof raw !== "object") return fallback;
  const ip = raw as Record<string, unknown>;

  const tabs = toStringArray(ip.tabs, fallback.tabs);
  const formFields = normalizeFields(ip.formFields, fallback.formFields);
  const sampleRecords = normalizeRecords(ip.sampleRecords, fallback.sampleRecords);
  const metrics = normalizeMetrics(ip.metrics, fallback.metrics);
  const actions = normalizeActions(ip.actions, fallback.actions);

  return {
    primaryEntityName:
      typeof ip.primaryEntityName === "string"
        ? ip.primaryEntityName
        : fallback.primaryEntityName,
    tabs: tabs.length >= 3 ? tabs : fallback.tabs,
    defaultTab:
      typeof ip.defaultTab === "string" ? ip.defaultTab : tabs[0] || fallback.defaultTab,
    formTitle:
      typeof ip.formTitle === "string" ? ip.formTitle : fallback.formTitle,
    formFields: formFields.length >= 3 ? formFields : fallback.formFields,
    sampleRecords: sampleRecords.length >= 2 ? sampleRecords : fallback.sampleRecords,
    metrics: metrics.length >= 3 ? metrics : fallback.metrics,
    actions: actions.length >= 1 ? actions : fallback.actions,
  };
}

export function normalizeAppSpec(input: unknown, prompt: string): AppSpec {
  const fallback = createFallbackAppSpec(prompt);

  if (!input || typeof input !== "object") return fallback;

  const raw = input as Record<string, unknown>;

  const theme = VALID_THEMES.includes(raw.theme as AppTheme)
    ? (raw.theme as AppTheme)
    : fallback.theme;

  const interactivePreview = normalizeInteractivePreview(
    raw.interactivePreview,
    fallback.interactivePreview!
  );

  return {
    name:
      typeof raw.name === "string" && raw.name.trim()
        ? raw.name.trim()
        : fallback.name,
    description:
      typeof raw.description === "string" && raw.description.trim()
        ? raw.description.trim()
        : fallback.description,
    pages: toStringArray(raw.pages, fallback.pages),
    components: toStringArray(raw.components, fallback.components),
    features: toStringArray(raw.features, fallback.features),
    theme,
    interactivePreview,
  };
}

export function extractJsonFromText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        throw new Error("Failed to extract JSON from text");
      }
    }
    throw new Error("No JSON found in text");
  }
}

"use client";

import { useState, useMemo } from "react";
import type {
  AppSpec,
  InteractivePreview,
  PreviewRecord,
} from "@/lib/types";
import {
  Eye,
  Monitor,
  Smartphone,
  Sparkles,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  BarChart3,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Styles = {
  bg: string;
  card: string;
  text: string;
  sub: string;
  nav: string;
  navText: string;
  navActive: string;
  accent: string;
  featureCard: string;
  input: string;
  inputBorder: string;
  btn: string;
  btnHover: string;
  badge: string;
};

function themeStyles(theme: AppSpec["theme"]): Styles {
  switch (theme) {
    case "dark":
      return {
        bg: "bg-gray-900",
        card: "bg-gray-800 border-gray-700",
        text: "text-gray-100",
        sub: "text-gray-400",
        nav: "bg-gray-800",
        navText: "text-gray-400",
        navActive: "text-indigo-400 border-indigo-400",
        accent: "from-indigo-400 to-purple-400",
        featureCard: "bg-gray-700/50 border-gray-600/50",
        input: "bg-gray-700 text-gray-100 placeholder-gray-500",
        inputBorder: "border-gray-600",
        btn: "bg-indigo-500 text-white",
        btnHover: "hover:bg-indigo-400",
        badge: "bg-gray-700 text-gray-300",
      };
    case "colorful":
      return {
        bg: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
        card: "bg-white/80 border-purple-200/60",
        text: "text-gray-900",
        sub: "text-gray-500",
        nav: "bg-white/80",
        navText: "text-purple-500",
        navActive: "text-purple-700 border-purple-600",
        accent: "from-indigo-500 via-purple-500 to-pink-500",
        featureCard: "bg-white/60 border-purple-200/40",
        input: "bg-white text-gray-800 placeholder-gray-400",
        inputBorder: "border-purple-200",
        btn: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
        btnHover: "hover:from-indigo-400 hover:to-purple-400",
        badge: "bg-purple-100 text-purple-700",
      };
    default:
      return {
        bg: "bg-white",
        card: "bg-gray-50 border-gray-200",
        text: "text-gray-900",
        sub: "text-gray-500",
        nav: "bg-gray-50",
        navText: "text-gray-400",
        navActive: "text-gray-900 border-gray-900",
        accent: "from-indigo-500 to-purple-500",
        featureCard: "bg-gray-50 border-gray-200/80",
        input: "bg-white text-gray-800 placeholder-gray-400",
        inputBorder: "border-gray-200",
        btn: "bg-gray-900 text-white",
        btnHover: "hover:bg-gray-800",
        badge: "bg-gray-100 text-gray-600",
      };
  }
}

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

function formatAmount(amount: number | undefined): string {
  if (amount === undefined) return "";
  return amount.toLocaleString("zh-CN", { style: "currency", currency: "CNY" });
}

function computeMetrics(
  records: PreviewRecord[],
  baseMetrics: InteractivePreview["metrics"]
): InteractivePreview["metrics"] {
  const hasAmounts = records.some((r) => r.amount !== undefined);
  if (!hasAmounts) {
    return [
      { id: "total", label: "Total records", value: String(records.length) },
      {
        id: "recent",
        label: "Latest",
        value: records.length > 0 ? (records[0].createdAt || "Just now") : "-",
      },
      ...baseMetrics.slice(2),
    ];
  }

  const income = records
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const expense = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const balance = income - expense;

  return [
    { id: "income", label: "Income", value: formatAmount(income) },
    { id: "expense", label: "Expense", value: formatAmount(expense) },
    { id: "balance", label: "Balance", value: formatAmount(balance) },
    { id: "count", label: "Records", value: String(records.length) },
  ];
}

type TabName = "overview" | "form" | "stats" | "records";

function tabIcon(tab: TabName) {
  switch (tab) {
    case "overview":
      return <LayoutGrid className="w-3 h-3" />;
    case "form":
      return <FileText className="w-3 h-3" />;
    case "stats":
      return <BarChart3 className="w-3 h-3" />;
    case "records":
      return <List className="w-3 h-3" />;
  }
}

export default function AppPreview({
  appSpec,
}: {
  appSpec: AppSpec | null;
}) {
  const [activeTab, setActiveTab] = useState<TabName>("overview");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const preview = appSpec?.interactivePreview;

  const [records, setRecords] = useState<PreviewRecord[]>(
    preview?.sampleRecords || []
  );

  // Reset records when appSpec changes
  const currentSpec = appSpec?.name;
  if (preview && records !== preview.sampleRecords) {
    const isStale =
      records.length > 0 &&
      preview.sampleRecords.length > 0 &&
      !records.some((r) => preview.sampleRecords.some((s) => s.id === r.id)) &&
      records.length === preview.sampleRecords.length;
    // Only reset on initial mount or spec change — handled via key on parent
  }

  const s = themeStyles(appSpec?.theme || "light");

  const metrics = useMemo(
    () => computeMetrics(records, preview?.metrics || []),
    [records, preview]
  );

  // No spec → empty state
  if (!appSpec || !preview) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Eye className="w-4 h-4" />
          App Preview
        </div>
        <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200/60 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              No preview yet
            </p>
            <p className="text-xs text-gray-300">
              Your generated app will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: TabName; label: string }[] = [
    { key: "overview", label: preview.tabs[0] || "Overview" },
    { key: "form", label: preview.tabs[1] || "Add New" },
    { key: "stats", label: preview.tabs[2] || "Stats" },
    { key: "records", label: preview.tabs[3] || "Records" },
  ];

  // Form submit handler
  const handleSubmit = () => {
    const fields = preview.formFields;
    const titleField = fields.find((f) => f.type === "text");
    const amountField = fields.find((f) => f.type === "number");

    const title =
      (titleField && formData[titleField.id]) || "New record";
    const amount =
      amountField && formData[amountField.id]
        ? parseFloat(formData[amountField.id])
        : undefined;

    // Determine type
    const typeSelect = fields.find(
      (f) => f.type === "select" && f.options?.some((o) => /收入|income/i.test(o))
    );
    let recordType: "income" | "expense" | "neutral" = "neutral";
    if (typeSelect && formData[typeSelect.id]) {
      const val = formData[typeSelect.id];
      if (/收入|income/i.test(val)) recordType = "income";
      else if (/支出|expense/i.test(val)) recordType = "expense";
    }

    // Category
    const catField = fields.find(
      (f) =>
        f.id.toLowerCase().includes("category") ||
        f.id.toLowerCase().includes("categor") ||
        f.id.toLowerCase().includes("分类")
    );
    const category = catField ? formData[catField.id] : undefined;

    const newRecord: PreviewRecord = {
      id: generateId(),
      title,
      subtitle: `${category || "General"} · Just now`,
      amount: !isNaN(amount as number) ? amount : undefined,
      type: recordType,
      category,
      createdAt: "Just now",
    };

    setRecords((prev) => [newRecord, ...prev]);
    setFormData({});
    setActiveTab("records");
    showToast("Record added!");
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast("Record deleted");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Eye className="w-4 h-4" />
          App Preview
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-gray-400" />
          <Smartphone className="w-3.5 h-3.5 text-gray-300" />
        </div>
      </div>

      {/* Preview frame */}
      <div className={`flex-1 rounded-xl border overflow-hidden flex flex-col ${s.card}`}>
        {/* App nav */}
        <div className={`flex items-center justify-between px-4 py-2 ${s.nav} border-b border-inherit`}>
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded bg-gradient-to-br ${s.accent} flex items-center justify-center`}>
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className={`text-xs font-semibold ${s.text}`}>
              {appSpec.name}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b border-inherit px-3 ${s.nav}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? s.navActive
                  : `${s.navText} border-transparent hover:opacity-70`
              }`}
            >
              {tabIcon(tab.key)}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`flex-1 p-4 ${s.bg} overflow-y-auto`}>
          {/* Toast */}
          {toast && (
            <div className="absolute top-14 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-medium shadow-lg animate-pulse">
              <CheckCircle2 className="w-3 h-3" />
              {toast}
            </div>
          )}

          {activeTab === "overview" && (
            <OverviewTab appSpec={appSpec} s={s} metrics={metrics} records={records} onNavigate={setActiveTab} />
          )}
          {activeTab === "form" && (
            <FormTab
              preview={preview}
              s={s}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
            />
          )}
          {activeTab === "stats" && (
            <StatsTab s={s} metrics={metrics} records={records} />
          )}
          {activeTab === "records" && (
            <RecordsTab s={s} records={records} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Overview Tab ──────────────────────────────────── */

function OverviewTab({
  appSpec,
  s,
  metrics,
  records,
  onNavigate,
}: {
  appSpec: AppSpec;
  s: Styles;
  metrics: InteractivePreview["metrics"];
  records: PreviewRecord[];
  onNavigate: (tab: TabName) => void;
}) {
  return (
    <div className="max-w-md mx-auto">
      <h2 className={`text-base font-bold ${s.text} mb-0.5`}>
        {appSpec.name}
      </h2>
      <p className={`text-[11px] ${s.sub} mb-4 leading-relaxed`}>
        {appSpec.description}
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {metrics.slice(0, 4).map((m) => (
          <div
            key={m.id}
            className={`rounded-lg border p-3 ${s.featureCard}`}
          >
            <p className={`text-[10px] ${s.sub} mb-1`}>{m.label}</p>
            <p className={`text-sm font-bold ${s.text}`}>{m.value}</p>
            {m.hint && (
              <p className={`text-[9px] ${s.sub} mt-0.5`}>{m.hint}</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent records */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className={`text-[11px] font-medium ${s.sub}`}>Recent</p>
          <button
            onClick={() => onNavigate("records")}
            className={`text-[10px] ${s.navText} hover:opacity-70 cursor-pointer`}
          >
            View all →
          </button>
        </div>
        {records.slice(0, 3).map((r) => (
          <div
            key={r.id}
            className={`flex items-center justify-between py-2 border-b last:border-0 ${s.featureCard} border-t-0 border-x-0`}
            style={{ borderBottomColor: "rgba(128,128,128,0.1)" }}
          >
            <div>
              <p className={`text-[11px] font-medium ${s.text}`}>{r.title}</p>
              <p className={`text-[9px] ${s.sub}`}>{r.subtitle}</p>
            </div>
            {r.amount !== undefined && (
              <span
                className={`text-[11px] font-bold ${
                  r.type === "income"
                    ? "text-emerald-500"
                    : r.type === "expense"
                    ? "text-red-400"
                    : s.text
                }`}
              >
                {r.type === "expense" ? "-" : r.type === "income" ? "+" : ""}
                {formatAmount(r.amount)}
              </span>
            )}
          </div>
        ))}
        {records.length === 0 && (
          <p className={`text-[10px] ${s.sub} text-center py-4`}>
            No records yet
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate("form")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium ${s.btn} ${s.btnHover} transition-colors cursor-pointer`}
        >
          <Plus className="w-3 h-3" />
          Add New
        </button>
        <button
          onClick={() => onNavigate("stats")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium border ${s.featureCard} ${s.text} cursor-pointer`}
        >
          <BarChart3 className="w-3 h-3" />
          Statistics
        </button>
      </div>
    </div>
  );
}

/* ─── Form Tab ──────────────────────────────────────── */

function FormTab({
  preview,
  s,
  formData,
  setFormData,
  onSubmit,
}: {
  preview: InteractivePreview;
  s: Styles;
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: () => void;
}) {
  return (
    <div className="max-w-md mx-auto">
      <h3 className={`text-sm font-bold ${s.text} mb-3`}>
        {preview.formTitle}
      </h3>

      <div className="space-y-3">
        {preview.formFields.map((field) => (
          <div key={field.id}>
            <label className={`block text-[11px] font-medium ${s.sub} mb-1`}>
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={formData[field.id] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))
                }
                placeholder={field.placeholder}
                rows={2}
                className={`w-full rounded-lg border px-3 py-2 text-[12px] ${s.input} ${s.inputBorder} focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none`}
              />
            ) : field.type === "select" ? (
              <select
                value={formData[field.id] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))
                }
                className={`w-full rounded-lg border px-3 py-2 text-[12px] ${s.input} ${s.inputBorder} focus:outline-none focus:ring-1 focus:ring-indigo-400`}
              >
                <option value="">Select...</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={formData[field.id] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))
                }
                placeholder={field.placeholder}
                className={`w-full rounded-lg border px-3 py-2 text-[12px] ${s.input} ${s.inputBorder} focus:outline-none focus:ring-1 focus:ring-indigo-400`}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onSubmit}
        className={`w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-medium ${s.btn} ${s.btnHover} transition-colors cursor-pointer`}
      >
        <Plus className="w-3.5 h-3.5" />
        {preview.actions.find((a) => a.type === "add_record")?.label || "Submit"}
      </button>
    </div>
  );
}

/* ─── Stats Tab ─────────────────────────────────────── */

function StatsTab({
  s,
  metrics,
  records,
}: {
  s: Styles;
  metrics: InteractivePreview["metrics"];
  records: PreviewRecord[];
}) {
  const hasAmounts = records.some((r) => r.amount !== undefined);

  // Simple bar chart for amounts
  const incomeRecords = records.filter((r) => r.type === "income");
  const expenseRecords = records.filter((r) => r.type === "expense");
  const maxAmount = Math.max(
    ...records.map((r) => r.amount || 0),
    1
  );

  return (
    <div className="max-w-md mx-auto">
      <h3 className={`text-sm font-bold ${s.text} mb-3`}>Statistics</h3>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {metrics.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg border p-3 ${s.featureCard}`}
          >
            <p className={`text-[10px] ${s.sub} mb-1`}>{m.label}</p>
            <p className={`text-sm font-bold ${s.text}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Simple bar visualization */}
      {hasAmounts && (
        <div className={`rounded-lg border p-3 ${s.featureCard}`}>
          <p className={`text-[11px] font-medium ${s.sub} mb-3`}>
            Income vs Expense
          </p>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] ${s.sub} flex items-center gap-1`}>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  Income
                </span>
                <span className="text-[10px] text-emerald-500 font-medium">
                  {incomeRecords.length} records
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-200/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(
                      (incomeRecords.reduce((s, r) => s + (r.amount || 0), 0) /
                        maxAmount) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] ${s.sub} flex items-center gap-1`}>
                  <TrendingDown className="w-3 h-3 text-red-400" />
                  Expense
                </span>
                <span className="text-[10px] text-red-400 font-medium">
                  {expenseRecords.length} records
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-200/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-300 to-red-400 transition-all"
                  style={{
                    width: `${Math.min(
                      (expenseRecords.reduce((s, r) => s + (r.amount || 0), 0) /
                        maxAmount) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record count by category */}
      {!hasAmounts && (
        <div className={`rounded-lg border p-3 ${s.featureCard}`}>
          <p className={`text-[11px] font-medium ${s.sub} mb-3`}>
            Records by Category
          </p>
          {Array.from(new Set(records.map((r) => r.category || "Other"))).map(
            (cat) => {
              const count = records.filter(
                (r) => (r.category || "Other") === cat
              ).length;
              return (
                <div key={cat} className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] ${s.sub} w-20 truncate`}>
                    {cat}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-200/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${s.accent} transition-all`}
                      style={{
                        width: `${Math.min(
                          (count / Math.max(records.length, 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className={`text-[10px] ${s.text}`}>{count}</span>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Records Tab ───────────────────────────────────── */

function RecordsTab({
  s,
  records,
  onDelete,
}: {
  s: Styles;
  records: PreviewRecord[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-bold ${s.text}`}>
          All Records ({records.length})
        </h3>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${s.sub} opacity-50`} />
          <p className={`text-[11px] ${s.sub}`}>No records yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div
              key={r.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${s.featureCard} group`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-[12px] font-medium ${s.text} truncate`}>
                    {r.title}
                  </p>
                  {r.type && (
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${
                        r.type === "income"
                          ? "bg-emerald-100 text-emerald-700"
                          : r.type === "expense"
                          ? "bg-red-100 text-red-600"
                          : s.badge
                      }`}
                    >
                      {r.type}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] ${s.sub} mt-0.5`}>
                  {[r.category, r.createdAt].filter(Boolean).join(" · ") || r.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {r.amount !== undefined && (
                  <span
                    className={`text-[12px] font-bold ${
                      r.type === "income"
                        ? "text-emerald-500"
                        : r.type === "expense"
                        ? "text-red-400"
                        : s.text
                    }`}
                  >
                    {r.type === "expense" ? "-" : r.type === "income" ? "+" : ""}
                    {formatAmount(r.amount)}
                  </span>
                )}
                <button
                  onClick={() => onDelete(r.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-300 hover:text-red-500 transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

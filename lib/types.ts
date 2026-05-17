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

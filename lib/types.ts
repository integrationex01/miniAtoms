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

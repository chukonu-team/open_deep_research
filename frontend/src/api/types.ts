export type { Thread, Run, ThreadState } from "@langchain/langgraph-sdk";

export type RunStatus = "pending" | "running" | "error" | "success" | "timeout" | "interrupted";

export type SearchAPI = "tavily" | "openai" | "anthropic" | "none";

export interface ResearchConfig {
  search_api: SearchAPI;
  research_model: string;
  summarization_model: string;
  compression_model: string;
  final_report_model: string;
  max_concurrent_research_units: number;
  max_researcher_iterations: number;
  max_react_tool_calls: number;
  allow_clarification: boolean;
}

export interface Message {
  type: string;
  content: string;
  id?: string;
  tool_calls?: unknown[];
}

export interface ResearchState {
  messages: Message[];
  research_brief?: string;
  notes?: string[];
  raw_notes?: string[];
  final_report?: string;
}

export interface StreamEventData {
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
}

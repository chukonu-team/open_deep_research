import type { ResearchConfig, SearchAPI } from "../api/types";

export const SEARCH_API_OPTIONS: { label: string; value: SearchAPI }[] = [
  { label: "Tavily", value: "tavily" },
  { label: "OpenAI Web Search", value: "openai" },
  { label: "Anthropic Web Search", value: "anthropic" },
  { label: "None", value: "none" },
];

export const DEFAULT_CONFIG: ResearchConfig = {
  search_api: "tavily",
  research_model: "openai:gpt-4.1",
  summarization_model: "openai:gpt-4.1-mini",
  compression_model: "openai:gpt-4.1",
  final_report_model: "openai:gpt-4.1",
  max_concurrent_research_units: 5,
  max_researcher_iterations: 6,
  max_react_tool_calls: 10,
  allow_clarification: true,
};

export interface StageInfo {
  id: string;
  label: string;
  nodeNames: string[];
}

export const PIPELINE_STAGES: StageInfo[] = [
  {
    id: "clarify",
    label: "Clarification",
    nodeNames: ["clarify_with_user"],
  },
  {
    id: "brief",
    label: "Research Brief",
    nodeNames: ["write_research_brief"],
  },
  {
    id: "research",
    label: "Research",
    nodeNames: ["research_supervisor"],
  },
  {
    id: "report",
    label: "Report Generation",
    nodeNames: ["final_report_generation"],
  },
  {
    id: "complete",
    label: "Complete",
    nodeNames: [],
  },
];

export function getStageIndex(nodeName: string): number {
  return PIPELINE_STAGES.findIndex((stage) =>
    stage.nodeNames.includes(nodeName)
  );
}

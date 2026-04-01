import { Client } from "@langchain/langgraph-sdk";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const client = new Client({ apiUrl: API_URL });

let cachedAssistantId: string | null = null;

export async function getAssistantId(): Promise<string> {
  if (cachedAssistantId) return cachedAssistantId;
  const assistants = await client.assistants.search({
    graphId: "Deep Researcher",
  });
  if (assistants.length === 0) {
    throw new Error(
      'No assistant found for graph "Deep Researcher". Is the LangGraph server running?'
    );
  }
  cachedAssistantId = assistants[0].assistant_id;
  return cachedAssistantId;
}

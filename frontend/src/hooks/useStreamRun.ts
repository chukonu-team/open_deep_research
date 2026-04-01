import { useCallback, useReducer, useRef } from "react";
import { client, getAssistantId } from "../api/client";
import type { ResearchConfig, StreamEventData } from "../api/types";
import { getStageIndex } from "../lib/constants";

export interface StreamState {
  status: "idle" | "streaming" | "completed" | "error" | "cancelled";
  currentNode: string | null;
  threadId: string | null;
  runId: string | null;
  events: StreamEventData[];
  completedStages: number[];
  activeStageIndex: number;
  finalReport: string | null;
  researchBrief: string | null;
  clarificationQuestion: string | null;
  error: string | null;
}

const initialState: StreamState = {
  status: "idle",
  currentNode: null,
  threadId: null,
  runId: null,
  events: [],
  completedStages: [],
  activeStageIndex: -1,
  finalReport: null,
  researchBrief: null,
  clarificationQuestion: null,
  error: null,
};

type Action =
  | { type: "START"; threadId: string }
  | { type: "SET_RUN_ID"; runId: string }
  | { type: "NODE_UPDATE"; nodeName: string; data: Record<string, unknown> }
  | { type: "STREAM_EVENT"; event: StreamEventData }
  | { type: "COMPLETED" }
  | { type: "ERROR"; error: string }
  | { type: "CANCELLED" }
  | { type: "RESET" };

function reducer(state: StreamState, action: Action): StreamState {
  switch (action.type) {
    case "START":
      return {
        ...initialState,
        status: "streaming",
        threadId: action.threadId,
      };
    case "SET_RUN_ID":
      return { ...state, runId: action.runId };
    case "NODE_UPDATE": {
      const stageIdx = getStageIndex(action.nodeName);
      const newCompleted = [...state.completedStages];
      if (stageIdx >= 0 && !newCompleted.includes(stageIdx)) {
        // Mark all previous stages as completed too
        for (let i = 0; i <= stageIdx; i++) {
          if (!newCompleted.includes(i)) newCompleted.push(i);
        }
      }

      let { finalReport, researchBrief, clarificationQuestion } = state;
      const nodeData = action.data as Record<string, unknown>;

      if (action.nodeName === "final_report_generation" && nodeData.final_report) {
        finalReport = nodeData.final_report as string;
      }
      if (action.nodeName === "write_research_brief" && nodeData.research_brief) {
        researchBrief = nodeData.research_brief as string;
      }
      if (action.nodeName === "clarify_with_user" && nodeData.messages) {
        const msgs = nodeData.messages as { type: string; content: string }[];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && (lastMsg.type === "ai" || lastMsg.type === "AIMessage")) {
          clarificationQuestion = lastMsg.content;
        }
      }

      return {
        ...state,
        currentNode: action.nodeName,
        completedStages: newCompleted,
        activeStageIndex: stageIdx >= 0 ? stageIdx : state.activeStageIndex,
        finalReport,
        researchBrief,
        clarificationQuestion,
      };
    }
    case "STREAM_EVENT":
      return { ...state, events: [...state.events, action.event] };
    case "COMPLETED": {
      const completedStages = [...state.completedStages];
      // Mark the "complete" stage (index 4)
      if (state.finalReport && !completedStages.includes(4)) {
        completedStages.push(4);
      }
      return {
        ...state,
        status: "completed",
        activeStageIndex: state.finalReport ? 4 : state.activeStageIndex,
        completedStages,
      };
    }
    case "ERROR":
      return { ...state, status: "error", error: action.error };
    case "CANCELLED":
      return { ...state, status: "cancelled" };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useStreamRun() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef(false);

  const startRun = useCallback(
    async (
      question: string,
      config: Partial<ResearchConfig>,
      existingThreadId?: string
    ) => {
      abortRef.current = false;

      try {
        const assistantId = await getAssistantId();
        const threadId =
          existingThreadId ||
          (await client.threads.create()).thread_id;

        dispatch({ type: "START", threadId });

        const stream = client.runs.stream(threadId, assistantId, {
          input: { messages: [{ role: "human", content: question }] },
          config: { configurable: config },
          streamMode: "updates",
        });

        for await (const event of stream) {
          if (abortRef.current) break;

          const timestamp = Date.now();

          if (event.event === "metadata" && event.data) {
            const runId = (event.data as Record<string, string>).run_id;
            if (runId) dispatch({ type: "SET_RUN_ID", runId });
          }

          if (event.event === "updates" && event.data) {
            const data = event.data as Record<string, Record<string, unknown>>;
            for (const [nodeName, nodeData] of Object.entries(data)) {
              dispatch({ type: "NODE_UPDATE", nodeName, data: nodeData });
              dispatch({
                type: "STREAM_EVENT",
                event: { event: "updates", data: { [nodeName]: nodeData }, timestamp },
              });
            }
          }
        }

        if (!abortRef.current) {
          dispatch({ type: "COMPLETED" });
        }
      } catch (err) {
        if (!abortRef.current) {
          dispatch({
            type: "ERROR",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    },
    []
  );

  const cancelRun = useCallback(async () => {
    abortRef.current = true;
    if (state.threadId && state.runId) {
      try {
        await client.runs.cancel(state.threadId, state.runId);
      } catch {
        // Run may already be finished
      }
    }
    dispatch({ type: "CANCELLED" });
  }, [state.threadId, state.runId]);

  const reset = useCallback(() => {
    abortRef.current = true;
    dispatch({ type: "RESET" });
  }, []);

  return { state, startRun, cancelRun, reset };
}

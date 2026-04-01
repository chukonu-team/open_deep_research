import { useCallback, useEffect, useState } from "react";
import { client } from "../api/client";
import type { Thread, Run } from "../api/types";

export interface ThreadWithRuns {
  thread: Thread;
  runs: Run[];
  latestRunStatus: string | null;
  firstHumanMessage: string | null;
}

export function useThreads(pollInterval = 10000) {
  const [threads, setThreads] = useState<ThreadWithRuns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      const result = await client.threads.search({ limit: 50 });
      const threadsWithRuns: ThreadWithRuns[] = await Promise.all(
        result.map(async (thread) => {
          try {
            const runs = await client.runs.list(thread.thread_id) as Run[];
            const latestRun = runs[0];
            let firstHumanMessage: string | null = null;

            try {
              const stateResult = await client.threads.getState(thread.thread_id);
              const values = stateResult.values as Record<string, unknown> | undefined;
              const messages = values?.messages as { type: string; content: string }[] | undefined;
              if (messages) {
                const human = messages.find(
                  (m) => m.type === "human" || m.type === "user"
                );
                firstHumanMessage = human?.content || null;
              }
            } catch {
              // Thread may not have state yet
            }

            return {
              thread,
              runs,
              latestRunStatus: latestRun?.status || null,
              firstHumanMessage,
            };
          } catch {
            return {
              thread,
              runs: [],
              latestRunStatus: null,
              firstHumanMessage: null,
            };
          }
        })
      );
      setThreads(threadsWithRuns);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch threads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, pollInterval);
    return () => clearInterval(interval);
  }, [fetchThreads, pollInterval]);

  const deleteThread = useCallback(
    async (threadId: string) => {
      await client.threads.delete(threadId);
      setThreads((prev) => prev.filter((t) => t.thread.thread_id !== threadId));
    },
    []
  );

  const cancelRun = useCallback(
    async (threadId: string, runId: string) => {
      await client.runs.cancel(threadId, runId);
      await fetchThreads();
    },
    [fetchThreads]
  );

  return { threads, loading, error, refresh: fetchThreads, deleteThread, cancelRun };
}

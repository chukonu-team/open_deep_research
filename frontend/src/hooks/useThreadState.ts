import { useCallback, useEffect, useState } from "react";
import { client } from "../api/client";
import type { ResearchState, Run } from "../api/types";

export function useThreadState(threadId: string | null) {
  const [state, setState] = useState<ResearchState | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    if (!threadId) return;
    setLoading(true);
    try {
      const [stateResult, runsResult] = await Promise.all([
        client.threads.getState(threadId),
        client.runs.list(threadId) as Promise<Run[]>,
      ]);
      setState(stateResult.values as unknown as ResearchState);
      setRuns(runsResult);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch state");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return { state, runs, loading, error, refresh: fetchState };
}

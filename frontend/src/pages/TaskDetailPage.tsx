import { useParams, Link } from "react-router-dom";
import { useThreadState } from "../hooks/useThreadState";
import ReportView from "../components/ReportView";
import TaskStatusBadge from "../components/TaskStatusBadge";
import { formatRelativeTime, extractFirstHumanMessage } from "../lib/utils";
import { client } from "../api/client";
import { useCallback } from "react";

export default function TaskDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { state, runs, loading, error, refresh } = useThreadState(
    threadId || null
  );

  const latestRun = runs[0];
  const isRunning = latestRun?.status === "running";

  const handleCancel = useCallback(async () => {
    if (threadId && latestRun) {
      await client.runs.cancel(threadId, latestRun.run_id);
      refresh();
    }
  }, [threadId, latestRun, refresh]);

  const handleDelete = useCallback(async () => {
    if (threadId && confirm("Delete this research task?")) {
      await client.threads.delete(threadId);
      window.location.href = "/";
    }
  }, [threadId]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 mt-3">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          &larr; Back to tasks
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const question = state?.messages
    ? extractFirstHumanMessage(state.messages)
    : "";

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        &larr; Back to tasks
      </Link>

      {/* Header */}
      <div className="border border-gray-200 rounded-lg bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {question || "Research Task"}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <TaskStatusBadge status={latestRun?.status || null} />
              {latestRun && (
                <span className="text-xs text-gray-400">
                  Started {formatRelativeTime(latestRun.created_at)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isRunning && (
              <button
                onClick={handleCancel}
                className="text-xs px-3 py-1.5 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={refresh}
              className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleDelete}
              className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Research Brief */}
      {state?.research_brief && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Research Brief
          </h3>
          <p className="text-sm text-gray-700">{state.research_brief}</p>
        </div>
      )}

      {/* Running indicator */}
      {isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-blue-700">
            Research is in progress. Refresh to check for updates.
          </p>
        </div>
      )}

      {/* Final Report */}
      {state?.final_report && <ReportView report={state.final_report} />}

      {/* No report yet */}
      {!state?.final_report && !isRunning && latestRun && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            {latestRun.status === "error"
              ? "This research task encountered an error."
              : latestRun.status === "interrupted"
                ? "This research task was cancelled."
                : "No report available yet."}
          </p>
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import type { ThreadWithRuns } from "../hooks/useThreads";
import TaskStatusBadge from "./TaskStatusBadge";
import { formatRelativeTime, truncate } from "../lib/utils";

interface Props {
  items: ThreadWithRuns[];
  onDelete: (threadId: string) => void;
  onCancel: (threadId: string, runId: string) => void;
}

export default function TaskList({ items, onDelete, onCancel }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">No research tasks yet.</p>
        <Link
          to="/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Start Your First Research
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(({ thread, runs, latestRunStatus, firstHumanMessage }) => {
        const latestRun = runs[0];
        const isRunning = latestRunStatus === "running";

        return (
          <div
            key={thread.thread_id}
            className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/task/${thread.thread_id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {firstHumanMessage
                      ? truncate(firstHumanMessage, 120)
                      : "Untitled Research"}
                  </Link>
                  <div className="flex items-center gap-3 mt-2">
                    <TaskStatusBadge status={latestRunStatus} />
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(thread.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isRunning && latestRun && (
                    <button
                      onClick={() =>
                        onCancel(thread.thread_id, latestRun.run_id)
                      }
                      className="text-xs px-2.5 py-1 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Delete this research task?")) {
                        onDelete(thread.thread_id);
                      }
                    }}
                    className="text-xs px-2.5 py-1 border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

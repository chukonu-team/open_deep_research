import { useThreads } from "../hooks/useThreads";
import TaskList from "../components/TaskList";

export default function TaskListPage() {
  const { threads, loading, error, refresh, deleteThread, cancelRun } =
    useThreads();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Research Tasks</h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-500 mt-1">
            Make sure the LangGraph server is running at the configured API URL.
          </p>
        </div>
      )}

      {loading && threads.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 mt-3">Loading tasks...</p>
        </div>
      ) : (
        <TaskList
          items={threads}
          onDelete={deleteThread}
          onCancel={cancelRun}
        />
      )}
    </div>
  );
}

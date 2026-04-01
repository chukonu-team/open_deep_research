import { useCallback, useState } from "react";
import { useStreamRun } from "../hooks/useStreamRun";
import ResearchForm from "../components/ResearchForm";
import ProgressTracker from "../components/ProgressTracker";
import StreamLog from "../components/StreamLog";
import ReportView from "../components/ReportView";
import type { ResearchConfig } from "../api/types";

export default function NewResearchPage() {
  const { state, startRun, cancelRun, reset } = useStreamRun();
  const [lastConfig, setLastConfig] = useState<Partial<ResearchConfig>>({});

  const handleSubmit = useCallback(
    async (question: string, config: ResearchConfig) => {
      setLastConfig(config);
      await startRun(question, config);
    },
    [startRun]
  );

  const handleClarificationResponse = useCallback(
    async (response: string) => {
      if (state.threadId) {
        await startRun(response, lastConfig, state.threadId);
      }
    },
    [startRun, state.threadId, lastConfig]
  );

  const isStreaming = state.status === "streaming";
  const isCompleted = state.status === "completed";
  const hasError = state.status === "error";
  const isCancelled = state.status === "cancelled";
  const needsClarification =
    isCompleted && !state.finalReport && state.clarificationQuestion;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Research</h1>

      {/* Phase 1: Input form (or clarification response) */}
      {(state.status === "idle" || needsClarification) && (
        <ResearchForm
          onSubmit={
            needsClarification ? handleClarificationResponse : handleSubmit
          }
          clarificationQuestion={
            needsClarification ? state.clarificationQuestion : null
          }
        />
      )}

      {/* Phase 2: Progress */}
      {(isStreaming || isCompleted || hasError || isCancelled) &&
        !needsClarification && (
          <div className="space-y-4">
            <ProgressTracker
              completedStages={state.completedStages}
              activeStageIndex={state.activeStageIndex}
            />

            {state.researchBrief && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Research Brief
                </h3>
                <p className="text-sm text-gray-700">{state.researchBrief}</p>
              </div>
            )}

            <StreamLog events={state.events} />

            {isStreaming && (
              <button
                onClick={cancelRun}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                Cancel Research
              </button>
            )}

            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  Error: {state.error}
                </p>
              </div>
            )}

            {isCancelled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  Research was cancelled.
                </p>
              </div>
            )}
          </div>
        )}

      {/* Phase 3: Report */}
      {state.finalReport && <ReportView report={state.finalReport} />}

      {/* Reset button */}
      {(isCompleted || hasError || isCancelled) && !needsClarification && (
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          Start New Research
        </button>
      )}
    </div>
  );
}

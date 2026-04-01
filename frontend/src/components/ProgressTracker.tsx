import { PIPELINE_STAGES } from "../lib/constants";

interface Props {
  completedStages: number[];
  activeStageIndex: number;
}

export default function ProgressTracker({ completedStages, activeStageIndex }: Props) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {PIPELINE_STAGES.map((stage, index) => {
          const isCompleted = completedStages.includes(index);
          const isActive = index === activeStageIndex && !completedStages.includes(index);

          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-blue-500 text-white animate-pulse ring-4 ring-blue-200"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium text-center whitespace-nowrap ${
                    isCompleted
                      ? "text-green-600"
                      : isActive
                        ? "text-blue-600"
                        : "text-gray-400"
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {index < PIPELINE_STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${
                    completedStages.includes(index) ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import type { ResearchConfig, SearchAPI } from "../api/types";
import { DEFAULT_CONFIG, SEARCH_API_OPTIONS } from "../lib/constants";

interface Props {
  config: ResearchConfig;
  onChange: (config: ResearchConfig) => void;
}

export default function ConfigPanel({ config, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const update = <K extends keyof ResearchConfig>(
    key: K,
    value: ResearchConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>Advanced Configuration</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Search API */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Search API
              </label>
              <select
                value={config.search_api}
                onChange={(e) => update("search_api", e.target.value as SearchAPI)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SEARCH_API_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Allow Clarification */}
            <div className="flex items-center gap-2 self-end pb-1">
              <input
                type="checkbox"
                id="allow_clarification"
                checked={config.allow_clarification}
                onChange={(e) => update("allow_clarification", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allow_clarification" className="text-sm text-gray-700">
                Allow Clarification
              </label>
            </div>

            {/* Model fields */}
            {(
              [
                ["research_model", "Research Model"],
                ["summarization_model", "Summarization Model"],
                ["compression_model", "Compression Model"],
                ["final_report_model", "Final Report Model"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={config[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}

            {/* Sliders */}
            {(
              [
                ["max_concurrent_research_units", "Max Concurrent Units", 1, 20],
                ["max_researcher_iterations", "Max Researcher Iterations", 1, 10],
                ["max_react_tool_calls", "Max Tool Calls", 1, 30],
              ] as const
            ).map(([key, label, min, max]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label}: {config[key]}
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={config[key]}
                  onChange={(e) => update(key, parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{min}</span>
                  <span>{max}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_CONFIG })}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import type { ResearchConfig } from "../api/types";
import { DEFAULT_CONFIG } from "../lib/constants";
import ConfigPanel from "./ConfigPanel";

interface Props {
  onSubmit: (question: string, config: ResearchConfig) => void;
  disabled?: boolean;
  clarificationQuestion?: string | null;
}

export default function ResearchForm({
  onSubmit,
  disabled,
  clarificationQuestion,
}: Props) {
  const [question, setQuestion] = useState("");
  const [config, setConfig] = useState<ResearchConfig>({ ...DEFAULT_CONFIG });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit(question.trim(), config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {clarificationQuestion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">
            Clarification needed:
          </p>
          <p className="text-sm text-blue-700">{clarificationQuestion}</p>
        </div>
      )}

      <div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            clarificationQuestion
              ? "Type your response..."
              : "What would you like to research?"
          }
          rows={4}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      {!clarificationQuestion && <ConfigPanel config={config} onChange={setConfig} />}

      <button
        type="submit"
        disabled={disabled || !question.trim()}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {clarificationQuestion ? "Continue Research" : "Start Research"}
      </button>
    </form>
  );
}

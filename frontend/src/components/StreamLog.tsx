import { useEffect, useRef } from "react";
import type { StreamEventData } from "../api/types";

interface Props {
  events: StreamEventData[];
}

function formatNodeName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StreamLog({ events }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="px-4 py-2 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Stream Log ({events.length})
        </h3>
      </div>
      <div
        ref={containerRef}
        className="max-h-64 overflow-y-auto p-3 space-y-1 font-mono text-xs"
      >
        {events.map((evt, i) => {
          const time = new Date(evt.timestamp).toLocaleTimeString();
          const nodeName = Object.keys(evt.data)[0] || "unknown";

          return (
            <div key={i} className="flex gap-2 text-gray-600">
              <span className="text-gray-400 shrink-0">{time}</span>
              <span className="text-blue-600 font-medium shrink-0">
                {formatNodeName(nodeName)}
              </span>
              <span className="text-gray-400 truncate">
                {nodeName === "final_report_generation"
                  ? "Report generated"
                  : "Update received"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

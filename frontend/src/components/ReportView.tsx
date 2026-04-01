import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { copyToClipboard, downloadMarkdown } from "../lib/utils";
import { useState } from "react";

interface Props {
  report: string;
}

export default function ReportView({ report }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(report);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const title = report.match(/^#\s+(.+)/m)?.[1] || "research-report";
    const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".md";
    downloadMarkdown(report, filename);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Research Report</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {copied ? "Copied!" : "Copy Markdown"}
          </button>
          <button
            onClick={handleDownload}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Download .md
          </button>
        </div>
      </div>
      <div className="p-6 report-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
      </div>
    </div>
  );
}

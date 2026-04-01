interface Props {
  status: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  running: "bg-amber-100 text-amber-800",
  pending: "bg-gray-100 text-gray-600",
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  timeout: "bg-orange-100 text-orange-800",
  interrupted: "bg-yellow-100 text-yellow-800",
};

const STATUS_LABELS: Record<string, string> = {
  running: "Running",
  pending: "Pending",
  success: "Completed",
  error: "Failed",
  timeout: "Timed Out",
  interrupted: "Cancelled",
};

export default function TaskStatusBadge({ status }: Props) {
  const key = status || "pending";
  const style = STATUS_STYLES[key] || "bg-gray-100 text-gray-600";
  const label = STATUS_LABELS[key] || key;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {key === "running" && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5" />
      )}
      {label}
    </span>
  );
}

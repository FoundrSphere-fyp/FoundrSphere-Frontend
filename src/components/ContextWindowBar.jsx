"use client";

import { cn } from "@/lib/utils";
import { getContextBarColor } from "@/lib/context-window";

function formatShort(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function ContextWindowBar({
  contextWindow,
  loading = false,
  className,
}) {
  if (!contextWindow) return null;

  const percent = Math.min(100, contextWindow.usedPercent ?? 0);
  const barColor = getContextBarColor(percent);
  const usedLabel = contextWindow.display?.used ?? "—";
  const maxLabel = contextWindow.display?.max ?? "128K";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {loading && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          )}
          <span className="font-medium text-foreground/80">Context window</span>
          {loading ? (
            <span>building…</span>
          ) : (
            <span>
              {usedLabel} / {maxLabel}
              {contextWindow.isEstimated ? " (est.)" : ""}
            </span>
          )}
        </span>
        <span>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barColor,
            loading && "animate-pulse"
          )}
          style={{ width: `${Math.max(percent, loading ? 2 : 0)}%` }}
        />
      </div>
      {!loading && contextWindow.promptTokens != null && (
        <p className="text-[10px] text-muted-foreground">
          Prompt {contextWindow.display?.prompt ?? "—"} tokens
          {contextWindow.completionTokens
            ? ` · last reply ${formatShort(contextWindow.completionTokens)}`
            : ""}
          {contextWindow.messageCount != null
            ? ` · ${contextWindow.messageCount} messages in window`
            : ""}
        </p>
      )}
    </div>
  );
}

"use client"

import { LayoutGrid, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Switch between full directory and personalized recommendations.
 */
export default function BrowseRecommendedToggle({
  value,
  onChange,
  allLabel,
  recLabel,
  className,
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border bg-muted/50 p-1 shadow-sm",
        className
      )}
      role="tablist"
      aria-label="View mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "all"}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          value === "all"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onChange("all")}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" />
        {allLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "recommended"}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          value === "recommended"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onChange("recommended")}
      >
        <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
        {recLabel}
      </button>
    </div>
  )
}

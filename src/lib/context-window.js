const DEFAULT_MAX_CONTEXT = 131072;
const DEFAULT_RESERVED_OUTPUT = 1024;

export function estimateTokenCount(text) {
  if (!text) return 0;
  const str = String(text);
  const specialMatches = str.match(/<\|[^|]+\|>/g) || [];
  return Math.ceil(str.length / 3.8) + specialMatches.length;
}

export function formatTokens(tokens) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return String(Math.round(tokens));
}

/** Client-side preview while waiting for the server (rough). */
export function estimateContextFromMessages(messages, maxTokens = DEFAULT_MAX_CONTEXT) {
  const reserved = DEFAULT_RESERVED_OUTPUT;
  const text = (messages || [])
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  const systemOverhead = 600;
  const promptTokens = estimateTokenCount(text) + systemOverhead;
  const contextUsed = promptTokens + reserved;
  const usedPercent = Math.min(100, (contextUsed / maxTokens) * 100);

  return {
    maxTokens,
    promptTokens,
    contextUsed,
    remainingTokens: Math.max(0, maxTokens - contextUsed),
    usedPercent: Math.round(usedPercent * 10) / 10,
    isEstimated: true,
    display: {
      used: formatTokens(contextUsed),
      max: formatTokens(maxTokens),
      prompt: formatTokens(promptTokens),
    },
  };
}

export function getContextBarColor(percent) {
  if (percent >= 85) return "bg-destructive";
  if (percent >= 60) return "bg-amber-500";
  return "bg-primary";
}

const base = () => process.env.NEXT_PUBLIC_API_URL

export async function fetchRecommendInvestors() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (!token) {
    return { type: "error", message: "Not logged in." }
  }
  const res = await fetch(`${base()}/founders/recommend-investors`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.json()
}

export async function fetchRecommendFounders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (!token) {
    return { type: "error", message: "Not logged in." }
  }
  const res = await fetch(`${base()}/founders/recommend-founders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.json()
}

export function formatFitHints(breakdown) {
  if (!breakdown) return null
  const parts = []
  if (breakdown.industry !== 0) {
    parts.push(breakdown.industry > 0 ? "Industry ✓" : "Industry ✗")
  }
  if (breakdown.stage !== 0) {
    parts.push(breakdown.stage > 0 ? "Stage ✓" : "Stage ✗")
  }
  if (breakdown.funding !== 0) {
    parts.push(breakdown.funding > 0 ? "Check size ✓" : "Check size ✗")
  }
  if (breakdown.location !== 0) {
    parts.push(breakdown.location > 0 ? "Location ✓" : "Location ✗")
  }
  return parts.length ? parts.join("  ") : null
}

export const STRONG_MATCH_MIN = 0.32

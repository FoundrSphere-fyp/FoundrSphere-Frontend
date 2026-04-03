const api = () => process.env.NEXT_PUBLIC_API_URL

export async function fetchFounderDetail(founderId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  const res = await fetch(`${api()}/founders/get-specific-founder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ id: founderId }),
  })
  return res.json()
}

export async function fetchInvestorDetail(investorId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  const res = await fetch(`${api()}/founders/get-specific-investor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ id: investorId }),
  })
  return res.json()
}

/** Project detail; sends Bearer token when logged in so owners can open private projects. */
export async function fetchPublicProject(projectId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  const res = await fetch(`${api()}/projects/${projectId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return res.json()
}

const api = () => process.env.NEXT_PUBLIC_API_URL

function authHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchAccountSettings() {
  const res = await fetch(`${api()}/auth/account-settings`, {
    method: "GET",
    headers: authHeaders(),
  })
  return res.json()
}

export async function updateAccountSettings(payload) {
  const res = await fetch(`${api()}/auth/account-settings`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  return res.json()
}

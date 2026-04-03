const api = () => process.env.NEXT_PUBLIC_API_URL

function authHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchMyProjects() {
  const res = await fetch(`${api()}/projects/my`, {
    method: "GET",
    headers: authHeaders(),
  })
  return res.json()
}

export async function createProject(body) {
  const res = await fetch(`${api()}/projects/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function updateProject(projectId, body) {
  const res = await fetch(`${api()}/projects/update/${projectId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  return res.json()
}

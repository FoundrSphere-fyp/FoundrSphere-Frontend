const api = () => process.env.NEXT_PUBLIC_API_URL

export function getAdminToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function authHeaders() {
  const token = getAdminToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function buildQuery(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, String(value))
    }
  })
  const s = q.toString()
  return s ? `?${s}` : ""
}

async function adminFetch(path, options = {}) {
  const res = await fetch(`${api()}/admin${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  })
  const data = await res.json().catch(() => ({
    type: "error",
    message: "Invalid server response.",
  }))
  return { ok: res.ok, status: res.status, data }
}

export async function adminLogin(username, password) {
  const res = await fetch(`${api()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  return res.json()
}

export function getStats() {
  return adminFetch("/stats")
}

export function listUsers(params) {
  return adminFetch(`/users${buildQuery(params)}`)
}

export function getUser(id) {
  return adminFetch(`/users/${id}`)
}

export function updateUser(id, body) {
  return adminFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export function updateUserStatus(id, isActive) {
  return adminFetch(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  })
}

export function deleteUser(id) {
  return adminFetch(`/users/${id}`, { method: "DELETE" })
}

export function listProjects(params) {
  return adminFetch(`/projects${buildQuery(params)}`)
}

export function getProject(id) {
  return adminFetch(`/projects/${id}`)
}

export function updateProject(id, body) {
  return adminFetch(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export function deleteProject(id) {
  return adminFetch(`/projects/${id}`, { method: "DELETE" })
}

export function listGroups(params) {
  return adminFetch(`/groups${buildQuery(params)}`)
}

export function getGroup(id) {
  return adminFetch(`/groups/${id}`)
}

export function updateGroup(id, body) {
  return adminFetch(`/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export function deleteGroup(id) {
  return adminFetch(`/groups/${id}`, { method: "DELETE" })
}

export function listPosts(params) {
  return adminFetch(`/posts${buildQuery(params)}`)
}

export function getPost(id) {
  return adminFetch(`/posts/${id}`)
}

export function updatePost(id, body) {
  return adminFetch(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export function deletePost(id) {
  return adminFetch(`/posts/${id}`, { method: "DELETE" })
}

export function listChatbotConversations(params) {
  return adminFetch(`/chatbot/conversations${buildQuery(params)}`)
}

export function getChatbotConversation(id) {
  return adminFetch(`/chatbot/conversations/${id}`)
}

export function deleteChatbotConversation(id) {
  return adminFetch(`/chatbot/conversations/${id}`, { method: "DELETE" })
}

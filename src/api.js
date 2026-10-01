const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new Error(`Could not reach the EduPilot API at ${API_BASE}. Start the FastAPI server and try again.`)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const detail = Array.isArray(body.detail)
      ? body.detail.map((item) => item.msg).join(', ')
      : body.detail
    throw new Error(detail || body.message || `Request failed with status ${response.status}`)
  }
  return response.json()
}

const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
export const generateRoadmap = (body) => post('/generate-roadmap', body)
export const predictDifficulty = (body) => post('/predict', body)
export const sendChat = (message) => post('/chat', { message })
export const getRoadmaps = () => request('/roadmaps')
export const getProgress = (id) => request(`/roadmaps/${encodeURIComponent(id)}/progress`)
export const updateTask = (id, taskId, completed) => request(
  `/roadmaps/${encodeURIComponent(id)}/tasks/${encodeURIComponent(taskId)}`,
  { method: 'PUT', body: JSON.stringify({ completed }) },
)

import { useEffect, useState } from 'react'
import { getProgress, getRoadmaps, generateRoadmap, predictDifficulty, sendChat, updateTask } from './api'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'

const INITIAL_MESSAGE = { id: 'welcome', role: 'assistant', text: 'Hi! I can help you find learning resources and think through your next step. What are you hoping to learn?' }

function loadMessages() {
  try { return JSON.parse(sessionStorage.getItem('edupilot-chat')) || [INITIAL_MESSAGE] } catch { return [INITIAL_MESSAGE] }
}

export default function App() {
  const [page, setPage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roadmaps, setRoadmaps] = useState([])
  const [roadmap, setRoadmap] = useState(null)
  const [progress, setProgress] = useState({})
  const [messages, setMessages] = useState(loadMessages)
  const [loading, setLoading] = useState(false)
  const [chatBusy, setChatBusy] = useState(false)
  const [savingTask, setSavingTask] = useState(null)
  const [homeError, setHomeError] = useState('')
  const [dashboardError, setDashboardError] = useState('')
  const [chatError, setChatError] = useState('')

  useEffect(() => {
    getRoadmaps().then(({ roadmaps: saved }) => {
      setRoadmaps(saved)
      if (saved.length) setRoadmap((current) => current || saved[0])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!roadmap?.id) { setProgress({}); return }
    let cancelled = false
    getProgress(roadmap.id).then((result) => { if (!cancelled) setProgress(result.completed) }).catch(() => { if (!cancelled) setProgress({}) })
    return () => { cancelled = true }
  }, [roadmap?.id])

  useEffect(() => { sessionStorage.setItem('edupilot-chat', JSON.stringify(messages)) }, [messages])
  const activeId = roadmap?.id

  async function createRoadmap(input) {
    setLoading(true); setHomeError('')
    try {
      const result = await generateRoadmap(input)
      const experience = { beginner: 0.15, intermediate: 0.5, advanced: 0.8 }[input.level] ?? 0.15
      const goal = result.goal || input.goal
      const complexity = Math.min(1, 0.3 + goal.split(/\s+/).length * 0.035 + (/machine learning|deep learning|advanced|full stack/i.test(goal) ? 0.15 : 0))
      try {
        result.prediction = await predictDifficulty({ hours_per_week: input.hours_per_week, prior_experience: experience, goal_complexity: complexity, duration_weeks: result.duration_weeks })
      } catch { /* the roadmap endpoint also returns a prediction */ }
      setRoadmap(result); setProgress({}); setRoadmaps((current) => [result, ...current.filter((item)=>item.id!==result.id)]); setPage('dashboard')
    } catch (error) { setHomeError(error.message) }
    finally { setLoading(false) }
  }

  async function toggleTask(task) {
    if (!roadmap || savingTask) return
    const completed = !progress[task.id]
    setSavingTask(task.id); setDashboardError('')
    try {
      const result = await updateTask(roadmap.id, task.id, completed)
      setProgress(result.completed)
    } catch (error) {
      setDashboardError(error.message)
    } finally { setSavingTask(null) }
  }

  async function chatSend(text) {
    const userMessage = { id: crypto.randomUUID?.() || String(Date.now()), role: 'user', text }
    setMessages((items) => [...items, userMessage]); setChatBusy(true); setChatError('')
    try {
      const result = await sendChat(text)
      setMessages((items) => [...items, { id: crypto.randomUUID?.() || String(Date.now()+1), role: 'assistant', text: result.reply, resources: result.resources || [] }])
    } catch (error) { setChatError(error.message) }
    finally { setChatBusy(false) }
  }

  const title = page
  return <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
    <Sidebar page={title} setPage={setPage} roadmaps={roadmaps} activeId={activeId} onSelectRoadmap={setRoadmap} open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>
    <div className="min-h-screen md:pl-[258px]"><Navbar page={title} onMenu={()=>setSidebarOpen((open)=>!open)}/><main className="px-4 py-6 md:px-8 md:py-8">
      {page==='home'&&<Home onGenerate={createRoadmap} busy={loading} error={homeError} roadmaps={roadmaps} onOpenRoadmap={(item)=>{setRoadmap(item);setPage('dashboard')}}/>}
      {page==='dashboard'&&<Dashboard roadmap={roadmap} progress={progress} onToggleTask={toggleTask} savingTask={savingTask} error={dashboardError} onCreatePlan={()=>setPage('home')}/>}
      {page==='chat'&&<Chat messages={messages} onSend={chatSend} busy={chatBusy} error={chatError}/>}
    </main><footer className="px-4 pb-6 pt-1 text-center text-[10px] text-slate-400 md:pl-8">EduPilot AI <span className="px-1">·</span> Your goals, one day at a time.</footer></div>
  </div>
}

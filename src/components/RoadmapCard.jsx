import { useState } from 'react'
import { BookOpen, Check, ChevronDown, Clock3, ExternalLink, Layers3, LoaderCircle, Sparkles } from 'lucide-react'

export function PredictionCard({ prediction }) {
  if (!prediction) return null
  const score = Math.max(0, Math.min(1, Number(prediction.difficulty_score) || 0))
  const label = prediction.difficulty || (score < .34 ? 'Gentle' : score < .68 ? 'Steady' : 'Intensive')
  return <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[.13em] text-violet-500">ML difficulty estimate</p><h3 className="mt-2 text-2xl font-extrabold text-slate-800">{label}</h3></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-violet-600 shadow-sm"><Sparkles size={18}/></div></div>
    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-600"><span>Difficulty score</span><span>{Math.round(score*100)} / 100</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-600 transition-all" style={{width:`${score*100}%`}}/></div>
    <p className="mt-3 text-xs leading-relaxed text-slate-500">{prediction.explanation || 'This estimate considers your available study time, experience, goal scope, and timeframe.'}</p><p className="mt-3 text-[10px] text-slate-400">{prediction.model_source || 'PyTorch model'}</p>
  </section>
}

export default function RoadmapCard({ roadmap, progress = {}, onToggleTask, savingTask }) {
  const [openWeek, setOpenWeek] = useState(1)
  if (!roadmap) return null
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <div className="mb-5 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-violet-600"><Layers3 size={13}/> Learning sequence</div><h2 className="mt-2 font-display text-lg font-bold text-slate-800">Your weekly roadmap</h2><p className="mt-1 text-xs text-slate-400">{roadmap.duration_weeks} weeks · {roadmap.level} · {roadmap.hours_per_week} hours per week</p></div><span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">{roadmap.weeks?.length || 0} WEEKS</span></div>
    <div className="space-y-2">{roadmap.weeks?.map((week)=><div key={week.week} className="overflow-hidden rounded-xl border border-slate-100">
      <button onClick={()=>setOpenWeek(openWeek===week.week?0:week.week)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-50"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-xs font-bold text-violet-700">{String(week.week).padStart(2,'0')}</span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-700">Week {week.week}</span><span className="mt-1 block truncate text-[11px] text-slate-400">{week.focus}</span></span><span className="text-[10px] text-slate-400">{week.days.filter(d=>progress[d.id]).length}/{week.days.length}</span><ChevronDown size={15} className={`text-slate-400 transition-transform ${openWeek===week.week?'rotate-180':''}`}/></button>
      {openWeek===week.week&&<div className="border-t border-slate-100 px-3 pb-2 pl-[60px]">{week.days.map((task)=><label key={task.id} className="flex cursor-pointer items-start gap-2.5 border-b border-slate-50 py-3 last:border-0"><input className="peer sr-only" type="checkbox" checked={!!progress[task.id]} disabled={savingTask===task.id} onChange={()=>onToggleTask(task)}/><span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${progress[task.id]?'border-emerald-500 bg-emerald-500 text-white':'border-slate-300 text-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300'}`}>{savingTask===task.id?<LoaderCircle size={11} className="animate-spin"/>:<Check size={11}/>}</span><span className={`flex-1 text-[11px] leading-relaxed ${progress[task.id]?'text-slate-400 line-through':'text-slate-600'}`}>{task.title}<span className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><Clock3 size={11}/>{task.minutes} min <span className="px-0.5">·</span>{task.date}</span></span></label>)}</div>}
    </div>)}</div>
  </section>
}

export function ResourceList({ resources = [] }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2"><BookOpen size={16} className="text-violet-600"/><h3 className="text-sm font-bold text-slate-800">Suggested resources</h3></div><div className="divide-y divide-slate-100">{resources.length ? resources.map((resource)=><a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 py-3 first:pt-1"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-violet-500"><BookOpen size={15}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-700 group-hover:text-violet-700">{resource.title}</span><span className="mt-1 block text-[10px] text-slate-400">{resource.type} · {resource.level}</span></span><ExternalLink size={14} className="text-slate-300 group-hover:text-violet-500"/></a>) : <p className="py-3 text-xs leading-relaxed text-slate-400">No close resource matches were found. Try a more specific topic.</p>}</div></section>
}

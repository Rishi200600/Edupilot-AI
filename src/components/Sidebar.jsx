import { BookOpen, Bot, Compass, LayoutDashboard, Plus, Sparkles, X } from 'lucide-react'

const items = [{ id: 'home', label: 'Create a roadmap', icon: Plus }, { id: 'dashboard', label: 'My dashboard', icon: LayoutDashboard }, { id: 'chat', label: 'Learning guide', icon: Bot }]

export default function Sidebar({ page, setPage, roadmaps, activeId, onSelectRoadmap, open, onClose }) {
  return <>
    {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"/>}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-2"><a className="flex items-center gap-2.5 font-display text-[17px] font-extrabold tracking-tight text-slate-800" href="#home" onClick={(e)=>{e.preventDefault();setPage('home')}}><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200"><Compass size={19}/></span>EduPilot <span className="-ml-2 text-violet-600">AI</span></a><button onClick={onClose} className="text-slate-400 md:hidden" aria-label="Close menu"><X size={18}/></button></div>
      <div className="mb-2 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Workspace</div>
      <nav className="space-y-1">{items.map(({id,label,icon:Icon})=><button key={id} onClick={()=>{setPage(id);onClose()}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${page===id?'bg-violet-50 text-violet-700':'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Icon size={17}/>{label}</button>)}</nav>
      <div className="mb-2 mt-9 flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400"><span>Recent roadmaps</span><BookOpen size={14}/></div>
      <div className="space-y-1 overflow-auto">{roadmaps.length ? roadmaps.map((roadmap)=><button key={roadmap.id} onClick={()=>{onSelectRoadmap(roadmap);setPage('dashboard');onClose()}} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition ${activeId===roadmap.id?'bg-slate-100 font-semibold text-slate-800':'text-slate-500 hover:bg-slate-50'}`}><span className="h-2 w-2 shrink-0 rounded-full bg-violet-300"/><span className="truncate">{roadmap.goal}</span></button>) : <p className="px-3 py-2 text-xs text-slate-400">Your plans will appear here.</p>}</div>
      <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-4"><div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm"><Sparkles size={16}/></div><p className="text-xs font-bold text-slate-700">Small steps add up</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">A little practice each day beats a perfect plan you never start.</p></div>
      <div className="mt-4 border-t border-slate-100 px-3 pt-4 text-[10px] text-slate-400">EduPilot AI <span className="px-1">·</span> Personal learning workspace</div>
    </aside>
  </>
}

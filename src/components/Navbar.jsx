import { Bell, CircleHelp, Menu, Sparkles } from 'lucide-react'

const titles = { home: ['Build a learning plan', 'Start with one goal. EduPilot will break it into practical steps.'], dashboard: ['Your learning dashboard', 'A clear view of your roadmap, progress, and next steps.'], chat: ['Learning guide', 'Ask a question and find a helpful place to begin.'] }

export default function Navbar({ page, onMenu }) {
  const [title, subtitle] = titles[page]
  return <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur md:px-9">
    <div className="flex items-center gap-3">
      <button onClick={onMenu} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 md:hidden" aria-label="Toggle navigation"><Menu size={18}/></button>
      <div><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.14em] text-violet-600"><Sparkles size={13}/> EduPilot AI</div><h1 className="mt-0.5 text-[15px] font-bold text-slate-800 md:text-base">{title}</h1><p className="hidden text-xs text-slate-400 md:block">{subtitle}</p></div>
    </div>
    <div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Planner ready</div><button className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label="Help"><CircleHelp size={17}/></button><button className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label="Notifications"><Bell size={17}/><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500"/></button><div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">E</div></div>
  </header>
}

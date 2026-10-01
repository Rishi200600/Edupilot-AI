import { BookOpen, Lightbulb } from 'lucide-react'
import ChatBox from '../components/ChatBox'

export default function Chat({ messages, onSend, busy, error }) {
  return <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
    <ChatBox messages={messages} onSend={onSend} busy={busy} error={error}/>
    <aside className="space-y-4"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Lightbulb size={16} className="text-amber-500"/><h3 className="text-xs font-bold text-slate-800">Try asking</h3></div><ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-500"><li className="rounded-xl bg-slate-50 p-3">“What should I learn before machine learning?”</li><li className="rounded-xl bg-slate-50 p-3">“Can you suggest a good Python resource?”</li><li className="rounded-xl bg-slate-50 p-3">“How do I stay consistent with daily practice?”</li></ul></section><section className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5"><div className="flex items-center gap-2 text-violet-700"><BookOpen size={16}/><h3 className="text-xs font-bold">Make it a plan</h3></div><p className="mt-2 text-[11px] leading-relaxed text-violet-800/70">The guide can point you toward resources. To get weekly milestones and track daily tasks, create a roadmap from the sidebar.</p></section></aside>
  </div>
}

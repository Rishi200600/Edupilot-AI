import { useEffect, useRef, useState } from 'react'
import { Bot, LoaderCircle, Send, Sparkles, UserRound } from 'lucide-react'

export default function ChatBox({ messages, onSend, busy, error, compact = false }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),[messages,busy])
  async function submit(event) {
    event.preventDefault()
    const value = text.trim()
    if (!value || busy) return
    setText('')
    await onSend(value)
  }
  return <div className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${compact?'':'min-h-[570px]'}`}>
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><Bot size={19}/></div><div className="flex-1"><p className="text-sm font-bold text-slate-800">Your learning guide</p><p className="mt-0.5 text-[11px] text-slate-400">Roadmap advice and relevant resources</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold tracking-wide text-emerald-700">READY</span></div>
    <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5">{messages.map((message,index)=><div key={message.id || index} className={`flex gap-2.5 ${message.role==='user'?'flex-row-reverse':''}`}><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${message.role==='user'?'bg-sky-50 text-sky-600':'bg-violet-50 text-violet-600'}`}>{message.role==='user'?<UserRound size={15}/>:<Sparkles size={15}/>}</div><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${message.role==='user'?'rounded-tr-sm bg-violet-600 text-white':'rounded-tl-sm bg-slate-50 text-slate-600'}`}><p className="whitespace-pre-wrap">{message.text}</p>{message.resources?.length>0&&<div className="mt-3 space-y-1.5">{message.resources.map((resource)=><a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-violet-700 hover:border-violet-200">{resource.title} ↗</a>)}</div>}</div></div>)}{busy&&<div className="flex gap-2.5"><div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-50 text-violet-600"><Bot size={15}/></div><div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3 text-xs text-slate-400"><LoaderCircle size={13} className="animate-spin"/>Thinking through that…</div></div>}{error&&<p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}<div ref={bottomRef}/></div>
    <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-100 p-3"><input aria-label="Message your learning guide" value={text} onChange={(event)=>setText(event.target.value)} placeholder="Ask about a topic, resource, or study plan…" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50"/><button disabled={!text.trim()||busy} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message">{busy?<LoaderCircle size={17} className="animate-spin"/>:<Send size={16}/>}</button></form>
  </div>
}

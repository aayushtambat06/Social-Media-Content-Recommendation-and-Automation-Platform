import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Platform = 'instagram' | 'youtube' | 'twitter'

interface ScheduledItem {
  id: string
  title: string
  platform: Platform
  scheduled_at: string   
  status: string
}

interface DraftItem {
  id: string
  title: string
  platform: Platform
}

interface Form {
  draftId: string
  title: string
  platform: Platform
  day: string
  fMonth: string
  fYear: string
  time: string
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const PLAT: Record<Platform, { color: string; bg: string; border: string; label: string }> = {
  instagram: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', label: 'Instagram' },
  youtube:   { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', label: 'YouTube'   },
  twitter:   { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)',  label: 'Twitter'   },
}

const BEST_TIMES = [
  { platform: 'Instagram', times: ['Tue 6–8 PM', 'Fri 12–2 PM', 'Sun 8–10 AM'] },
  { platform: 'YouTube',   times: ['Thu 2–4 PM', 'Sat 10 AM–12 PM'] },
  { platform: 'Twitter',   times: ['Mon 8–10 AM', 'Wed 12–2 PM', 'Fri 9–11 AM'] },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function isoToDateStr(iso: string) { return iso.slice(0, 10) }
function isoToTimeStr(iso: string) { return iso.slice(11, 16) }
function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Skeleton({ h = 36, r = 8 }: { h?: number; r?: number }) {
  return (
    <div style={{
      height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #0d1225, #111827, #0d1225)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  )
}

function PlatBadge({ platform }: { platform: Platform }) {
  const p = PLAT[platform] ?? PLAT.instagram
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:p.color, background:p.bg, border:`1px solid ${p.border}` }}>
      {p.label}
    </span>
  )
}

function TrashIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

const C = {
  bg2: '#0d1225', bg3: '#111827',
  border: 'rgba(255,255,255,0.06)',
  text: '#e8edf5', text2: '#8892a4', text3: '#4f5a6e',
  accent: '#63b3ed', accent2: '#4ade80', accent3: '#f59e0b', danger: '#f87171',
}

const card: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(13,18,37,0.95), rgba(8,12,24,0.98))',
  border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
}

const baseInput: React.CSSProperties = {
  width: '100%', padding: '9px 13px', borderRadius: 9,
  background: 'rgba(8,12,24,0.85)', border: '1px solid rgba(255,255,255,0.07)',
  color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
}

// ─── SCHEDULE SECTION ─────────────────────────────────────────────────────────
export function ScheduleSection({
  toast: externalToast,
}: {
  toast?: (msg: string, type?: 'success' | 'error' | 'info') => void
} = {}) {
  const now = new Date()

  const [inlineToasts, setInlineToasts] = useState<{ id: number; msg: string; type: string }[]>([])
  const inlineToast = (msg: string, type = 'info') => {
    const id = Date.now()
    setInlineToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setInlineToasts(t => t.filter(x => x.id !== id)), 3200)
  }
  const toast = externalToast ?? inlineToast

  const [month,    setMonth]    = useState(now.getMonth())
  const [year,     setYear]     = useState(now.getFullYear())
  const [selected, setSelected] = useState<string | null>(null)
  const [items,    setItems]    = useState<ScheduledItem[]>([])
  const [drafts,   setDrafts]   = useState<DraftItem[]>([]) 
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const [form, setForm] = useState<Form>({
    draftId: '', title: '', platform: 'youtube', day: '', fMonth: '', fYear: '', time: '18:00',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true); setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: schedData, error: schedErr } = await supabase
        .from('content')
        .select('id, title, platform, scheduled_at, status')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: true })

      if (schedErr) throw schedErr
      setItems((schedData as ScheduledItem[]) ?? [])

      const { data: draftData, error: draftErr } = await supabase
        .from('content')
        .select('id, title, platform')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })

      if (draftErr) throw draftErr
      setDrafts(draftData || [])

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    }
    setLoading(false)
  }

  const handleDraftSelect = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId)
    if (draft) {
      setForm(prev => ({ ...prev, draftId, title: draft.title, platform: draft.platform }))
    } else {
      setForm(prev => ({ ...prev, draftId: '', title: '' }))
    }
  }

  async function addItem() {
    if (!form.draftId) { toast('Please select a draft video to schedule', 'error'); return }
    const d = parseInt(form.day)
    const m = parseInt(form.fMonth)
    const y = parseInt(form.fYear)

    if (
      !form.day || !form.fMonth || !form.fYear ||
      isNaN(d) || isNaN(m) || isNaN(y) ||
      d < 1 || d > 31 || m < 1 || m > 12 || y < 2020 || y > 2100
    ) { toast('Enter a valid date', 'error'); return }
    if (!form.time) { toast('Fill in a time', 'error'); return }

    const dateStr     = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const scheduledAt = `${dateStr}T${form.time}:00+00:00`

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('content')
        .update({
          status: 'scheduled',
          scheduled_at: scheduledAt,
          title: form.title.trim(),
        })
        .eq('id', form.draftId)
        .select('id, title, platform, scheduled_at, status')
        .single()

      if (error) throw error

      setItems(prev => [...prev, data as ScheduledItem].sort((a,b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ))
      setDrafts(prev => prev.filter(d => d.id !== form.draftId))
      
      setMonth(m - 1); setYear(y); setSelected(dateStr)
      setForm({ draftId:'', title:'', platform:'youtube', day:'', fMonth:'', fYear:'', time:'18:00' })
      toast('Post scheduled successfully!', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to schedule post', 'error')
    }
    setSaving(false)
  }

  async function removeItem(id: string) {
    try {
      const { error } = await supabase
        .from('content')
        .update({ status: 'draft', scheduled_at: null })
        .eq('id', id)

      if (error) throw error
      setItems(prev => prev.filter(i => i.id !== id))
      fetchData() 
      toast('Post returned to drafts', 'info')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to remove post', 'error')
    }
  }

  const firstDay     = new Date(year, month, 1).getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const scheduledDates = new Set(items.map(i => isoToDateStr(i.scheduled_at)))
  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const selectedItems = selected ? items.filter(i => isoToDateStr(i.scheduled_at) === selected) : []

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .cal-cell:hover    { background:rgba(99,179,237,0.08) !important; border-color:rgba(99,179,237,0.2) !important; color:#e8edf5 !important; }
        .sched-row:hover   { background:rgba(255,255,255,0.02); }
        .nav-btn:hover     { background:rgba(255,255,255,0.08) !important; color:#e8edf5 !important; }
        .del-btn:hover     { background:rgba(248,113,113,0.15) !important; border-color:rgba(248,113,113,0.4) !important; }
        .primary-btn:hover { box-shadow:0 0 20px rgba(99,179,237,0.15); border-color:rgba(99,179,237,0.6) !important; }
        .sc-input:focus    { border-color:rgba(99,179,237,0.4) !important; box-shadow:0 0 0 3px rgba(99,179,237,0.07) !important; }
        select option      { background:#0d1225; color:#e8edf5; }
      `}</style>

      {!externalToast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, display:'flex', flexDirection:'column', gap:8 }}>
          {inlineToasts.map(t => (
            <div key={t.id} style={{
              padding:'10px 16px', borderRadius:10, fontSize:12, fontWeight:500, border:'1px solid', maxWidth:300,
              background:  t.type==='success'?'rgba(74,222,128,0.1)' :t.type==='error'?'rgba(248,113,113,0.1)' :'rgba(99,179,237,0.1)',
              borderColor: t.type==='success'?'rgba(74,222,128,0.3)' :t.type==='error'?'rgba(248,113,113,0.3)' :'rgba(99,179,237,0.3)',
              color:       t.type==='success'?'#4ade80'              :t.type==='error'?'#f87171'              :'#63b3ed',
            }}>
              {t.type==='success'?'✓ ':t.type==='error'?'⚠ ':'ℹ '}{t.msg}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:9, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', color:C.danger, fontSize:12, fontFamily:'monospace' }}>
          ⚠ {error}
        </div>
      )}

      {/* ── RESPONSIVE GRID WRAPPER ─────────────────────────────────────────── */}
      <div className="responsive-grid-2" style={{ alignItems:'start' }}>

        {/* ══ LEFT: Calendar ══════════════════════════════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <button className="nav-btn" onClick={prevMonth} style={{ padding:'5px 11px', borderRadius:7, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, color:C.text2, fontSize:14, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>←</button>
              <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{MONTHS[month]} {year}</div>
              <button className="nav-btn" onClick={nextMonth} style={{ padding:'5px 11px', borderRadius:7, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, color:C.text2, fontSize:14, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>→</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:6 }}>
              {WEEKDAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:9, fontWeight:600, color:C.text3, fontFamily:'monospace', letterSpacing:'0.1em', padding:'4px 0' }}>{d}</div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} style={{ aspectRatio:'1' }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d       = i + 1
                const dateStr = fmt(d)
                const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear()
                const hasPost = scheduledDates.has(dateStr)
                const isSel   = selected === dateStr

                return (
                  <div
                    key={d}
                    className="cal-cell"
                    style={{
                      aspectRatio:'1', borderRadius:8, display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600,
                      cursor:'pointer', position:'relative', gap:3, transition:'all 0.12s',
                      border:'1px solid transparent',
                      color:   isSel ? '#63b3ed' : isToday ? '#63b3ed' : C.text2,
                      background: isSel ? 'rgba(99,179,237,0.14)' : isToday ? 'rgba(99,179,237,0.06)' : 'transparent',
                      borderColor: isSel ? '#63b3ed' : isToday ? 'rgba(99,179,237,0.35)' : 'transparent',
                    }}
                    onClick={() => {
                      const toggling = isSel
                      setSelected(toggling ? null : dateStr)
                      if (!toggling) {
                        setForm(f => ({ ...f, day: String(d), fMonth: String(month+1), fYear: String(year) }))
                      }
                    }}
                  >
                    <span>{d}</span>
                    {hasPost && <div style={{ width:4, height:4, borderRadius:'50%', background:C.accent2, position:'absolute', bottom:4 }} />}
                  </div>
                )
              })}
            </div>

            <div style={{ display:'flex', gap:12, marginTop:14, paddingTop:14, borderTop:`1px solid rgba(255,255,255,0.05)` }}>
              {[
                { color:'rgba(99,179,237,0.2)', border:'rgba(99,179,237,0.5)', label:'Today' },
                { color:'#4ade80',              border:'none',                  label:'Has post', dot:true },
                { color:'rgba(99,179,237,0.14)', border:'#63b3ed',             label:'Selected' },
              ].map((l, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:C.text3 }}>
                  {l.dot
                    ? <div style={{ width:6, height:6, borderRadius:'50%', background:l.color }} />
                    : <div style={{ width:8, height:8, borderRadius:2, background:l.color, border:`1px solid ${l.border}` }} />
                  }
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div style={{ ...card, animation:'fadeIn 0.2s ease' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:11, color:C.text3, fontFamily:'monospace' }}>{selected}</span>
                <span style={{ fontSize:11, color:C.text3 }}>{selectedItems.length} post{selectedItems.length!==1?'s':''}</span>
              </div>
              {selectedItems.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0', fontSize:13, color:C.text3 }}>
                  No posts this day — fill the form →
                </div>
              ) : (
                selectedItems.map(item => (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>{item.title}</div>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <PlatBadge platform={item.platform} />
                        <span style={{ fontSize:10, color:C.text3, fontFamily:'monospace' }}>{isoToTimeStr(item.scheduled_at)}</span>
                      </div>
                    </div>
                    <button className="del-btn" onClick={() => removeItem(item.id)} style={{ padding:'5px 10px', borderRadius:7, border:'1px solid rgba(248,113,113,0.25)', background:'rgba(248,113,113,0.08)', color:C.danger, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:4, transition:'all 0.15s', flexShrink:0 }}>
                      <TrashIcon />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ══ RIGHT: Form + Best Times + All Scheduled ════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Schedule form */}
          <div style={card}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:18 }}>Schedule New Post</div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.08em', marginBottom:6, fontFamily:'monospace', textTransform:'uppercase' }}>Select Video Draft</div>
              <select 
                className="sc-input" 
                style={{ ...baseInput, appearance:'none', cursor:'pointer' } as React.CSSProperties} 
                value={form.draftId} 
                onChange={e => handleDraftSelect(e.target.value)}
              >
                <option value="" disabled>-- Select a draft to schedule --</option>
                {drafts.length === 0 && <option value="" disabled>No drafts available. Go upload one!</option>}
                {drafts.map(d => (
                  <option key={d.id} value={d.id}>{d.title} ({d.platform})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.08em', marginBottom:6, fontFamily:'monospace', textTransform:'uppercase' }}>Post Title</div>
              <input className="sc-input" style={baseInput} placeholder="What's this post about?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.08em', marginBottom:6, fontFamily:'monospace', textTransform:'uppercase' }}>Date</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.4fr', gap:8 }}>
                {[
                  { label:'DD', key:'day',    placeholder:'dd', max:2  },
                  { label:'MM', key:'fMonth', placeholder:'mm', max:2  },
                  { label:'YYYY', key:'fYear', placeholder:'yyyy', max:4 },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize:10, color:C.text3, marginBottom:4, fontFamily:'monospace' }}>{f.label}</div>
                    <input
                      className="sc-input"
                      style={baseInput}
                      placeholder={f.placeholder}
                      maxLength={f.max}
                      value={(form as Record<string,string>)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value.replace(/\D/g,'').slice(0,f.max) }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.08em', marginBottom:6, fontFamily:'monospace', textTransform:'uppercase' }}>Time</div>
              <input className="sc-input" style={{ ...baseInput, width:'auto' }} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>

            <button
              className="primary-btn"
              onClick={addItem}
              disabled={saving}
              style={{
                width:'100%', padding:'11px 0', borderRadius:9,
                background:'linear-gradient(135deg, rgba(99,179,237,0.18), rgba(99,179,237,0.08))',
                border:'1px solid rgba(99,179,237,0.35)', color:'#63b3ed',
                fontSize:13, fontWeight:600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.15s',
              }}
            >
              {saving ? 'Saving…' : '+ Add to Schedule'}
            </button>
          </div>

          <div style={card}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>Best Times to Post</div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:16 }}>Based on your audience engagement patterns</div>
            {BEST_TIMES.map((p, i) => {
              const platKey = p.platform.toLowerCase() as Platform
              const platStyle = PLAT[platKey] ?? PLAT.instagram
              return (
                <div key={i} style={{ marginBottom: i < BEST_TIMES.length-1 ? 14 : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:platStyle.color }} />
                    <span style={{ fontSize:11, fontWeight:600, color:platStyle.color, fontFamily:'monospace' }}>{p.platform}</span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {p.times.map(t => (
                      <span key={t} style={{ fontSize:10, padding:'3px 9px', borderRadius:20, color:platStyle.color, background:platStyle.bg, border:`1px solid ${platStyle.border}`, fontFamily:'monospace' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>All Scheduled Posts</div>
              <span style={{ fontSize:11, color:C.text3, fontFamily:'monospace' }}>{items.length} post{items.length!==1?'s':''}</span>
            </div>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {Array.from({length:3}).map((_,i) => <Skeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', fontSize:13, color:C.text3 }}>
                No scheduled posts yet
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={item.id}
                  className="sched-row"
                  style={{
                    display:'flex', alignItems:'center', gap:12, padding:'11px 8px',
                    borderBottom: idx < items.length-1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                    borderRadius:6, transition:'background 0.12s',
                  }}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <PlatBadge platform={item.platform} />
                      <span style={{ fontSize:10, color:C.text3, fontFamily:'monospace' }}>
                        {formatDisplayDate(item.scheduled_at)} · {isoToTimeStr(item.scheduled_at)}
                      </span>
                    </div>
                  </div>
                  <button className="del-btn" onClick={() => removeItem(item.id)} style={{ padding:'5px 10px', borderRadius:7, border:'1px solid rgba(248,113,113,0.25)', background:'rgba(248,113,113,0.08)', color:C.danger, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:4, transition:'all 0.15s', flexShrink:0 }}>
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
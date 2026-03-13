import { useState } from 'react'
 
// ─── TYPES ────────────────────────────────────────────────────────────────────
type Platform = 'Instagram' | 'YouTube' | 'Twitter'
 
interface ScheduledItem {
  id: number
  title: string
  platform: Platform
  date: string
  time: string
}
 
interface Form {
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
 
const PLAT: Record<Platform, { color: string; bg: string; border: string }> = {
  Instagram: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  YouTube:   { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
  Twitter:   { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)'  },
}
 
const BEST_TIMES: { platform: Platform; times: string[] }[] = [
  { platform: 'Instagram', times: ['Tue 6–8 PM', 'Fri 12–2 PM', 'Sun 8–10 AM'] },
  { platform: 'YouTube',   times: ['Thu 2–4 PM', 'Sat 10 AM–12 PM'] },
  { platform: 'Twitter',   times: ['Mon 8–10 AM', 'Wed 12–2 PM', 'Fri 9–11 AM'] },
]
 
// ─── TOAST ────────────────────────────────────────────────────────────────────
interface ToastMsg { id: number; msg: string; type: 'success' | 'error' | 'info' }
 
function useInlineToast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const show = (msg: string, type: ToastMsg['type'] = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }
  return { toasts, show }
}
 
// ─── BADGE ────────────────────────────────────────────────────────────────────
function PlatBadge({ platform }: { platform: Platform }) {
  const p = PLAT[platform]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
      fontFamily: 'monospace',
      color: p.color, background: p.bg, border: `1px solid ${p.border}`,
    }}>
      {platform}
    </span>
  )
}
 
// ─── ICON ─────────────────────────────────────────────────────────────────────
function Trash() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}
 
// ─── SHARED STYLE TOKENS ──────────────────────────────────────────────────────
const S = {
  card: {
    background: 'linear-gradient(135deg, rgba(13,18,37,0.95), rgba(8,12,24,0.98))',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 20,
  } as React.CSSProperties,
 
  input: {
    width: '100%',
    padding: '9px 13px',
    borderRadius: 9,
    background: 'rgba(8,12,24,0.8)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: '#e8edf5',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  } as React.CSSProperties,
 
  label: {
    display: 'block',
    fontSize: 10,
    fontWeight: 600,
    color: '#8892a4',
    letterSpacing: '0.08em',
    marginBottom: 6,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  } as React.CSSProperties,
 
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e8edf5',
    letterSpacing: '-0.01em',
  } as React.CSSProperties,
 
  btnPrimary: {
    width: '100%',
    padding: '10px 0',
    borderRadius: 9,
    background: 'linear-gradient(135deg, rgba(99,179,237,0.18), rgba(99,179,237,0.08))',
    border: '1px solid rgba(99,179,237,0.35)',
    color: '#63b3ed',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.15s',
  } as React.CSSProperties,
 
  btnSm: {
    padding: '5px 10px',
    borderRadius: 7,
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: '#f87171',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    flexShrink: 0,
  } as React.CSSProperties,
 
  btnNav: {
    padding: '5px 11px',
    borderRadius: 7,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#8892a4',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  } as React.CSSProperties,
}
 
// ─── SCHEDULE SECTION ─────────────────────────────────────────────────────────
export function ScheduleSection({
  toast: externalToast,
}: {
  toast?: (msg: string, type?: 'success' | 'error' | 'info') => void
} = {}) {
  const now = new Date()
  const { toasts, show: inlineShow } = useInlineToast()
  const toast = externalToast ?? inlineShow
 
  const [month,    setMonth]    = useState(now.getMonth())
  const [year,     setYear]     = useState(now.getFullYear())
  const [selected, setSelected] = useState<string | null>(null)
 
  const [items, setItems] = useState<ScheduledItem[]>([
    {
      id: 1, title: 'Morning routine for creators', platform: 'Instagram',
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-10`,
      time: '18:00',
    },
    {
      id: 2, title: 'Q&A session highlights', platform: 'YouTube',
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-14`,
      time: '15:00',
    },
  ])
 
  const [form, setForm] = useState<Form>({
    title: '', platform: 'Instagram', day: '', fMonth: '', fYear: '', time: '18:00',
  })
 
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const scheduledDates = new Set(items.map(i => i.date))
 
  const fmt = (d: number) =>
    `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
 
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
 
  const addItem = () => {
    const d = parseInt(form.day), m = parseInt(form.fMonth), y = parseInt(form.fYear)
    if (!form.title.trim()) { toast('Post title is required', 'error'); return }
    if (!form.day || !form.fMonth || !form.fYear || isNaN(d)||isNaN(m)||isNaN(y)
      || d<1||d>31||m<1||m>12||y<2020||y>2100) {
      toast('Enter a valid date (day / month / year)', 'error'); return
    }
    if (!form.time) { toast('Fill in a time', 'error'); return }
 
    const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    setItems(prev => [...prev, { id: Date.now(), title: form.title.trim(), platform: form.platform, date: dateStr, time: form.time }])
    setMonth(m - 1); setYear(y); setSelected(dateStr)
    setForm({ title: '', platform: 'Instagram', day: '', fMonth: '', fYear: '', time: '18:00' })
    toast('Post scheduled!', 'success')
  }
 
  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
    toast('Post removed', 'info')
  }
 
  const selectedItems = selected ? items.filter(i => i.date === selected) : []
 
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { transform:translateX(16px); opacity:0 } to { transform:translateX(0); opacity:1 } }
        .cal-cell:hover { background: rgba(99,179,237,0.08) !important; border-color: rgba(99,179,237,0.2) !important; color: #e8edf5 !important; }
        .sched-row:hover { background: rgba(255,255,255,0.02); }
        .nav-btn:hover { background: rgba(255,255,255,0.08) !important; color: #e8edf5 !important; }
        .del-btn:hover { background: rgba(248,113,113,0.15) !important; border-color: rgba(248,113,113,0.4) !important; }
        .primary-btn:hover { box-shadow: 0 0 20px rgba(99,179,237,0.15); border-color: rgba(99,179,237,0.55) !important; }
        .sched-input:focus { border-color: rgba(99,179,237,0.4) !important; box-shadow: 0 0 0 3px rgba(99,179,237,0.07) !important; }
        select option { background: #0d1225; color: #e8edf5; }
      `}</style>
 
      {/* Inline toasts */}
      {!externalToast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, display:'flex', flexDirection:'column', gap:8 }}>
          {toasts.map(t => (
            <div key={t.id} style={{
              padding:'10px 16px', borderRadius:10, fontSize:12, fontWeight:500,
              border:'1px solid', maxWidth:300, animation:'slideIn 0.25s ease',
              background:  t.type==='success'?'rgba(74,222,128,0.1)' :t.type==='error'?'rgba(248,113,113,0.1)' :'rgba(99,179,237,0.1)',
              borderColor: t.type==='success'?'rgba(74,222,128,0.3)' :t.type==='error'?'rgba(248,113,113,0.3)' :'rgba(99,179,237,0.3)',
              color:       t.type==='success'?'#4ade80'               :t.type==='error'?'#f87171'               :'#63b3ed',
            }}>
              {t.type==='success'?'✓ ':t.type==='error'?'⚠ ':'ℹ '}{t.msg}
            </div>
          ))}
        </div>
      )}
 
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
 
        {/* ══ LEFT: Calendar ═══════════════════════════════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={S.card}>
 
            {/* Month nav */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <button className="nav-btn" style={S.btnNav} onClick={prevMonth}>←</button>
              <div style={{ fontWeight:700, fontSize:14, color:'#e8edf5' }}>{MONTHS[month]} {year}</div>
              <button className="nav-btn" style={S.btnNav} onClick={nextMonth}>→</button>
            </div>
 
            {/* Weekday headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:6 }}>
              {WEEKDAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:9, fontWeight:600, color:'#4f5a6e', fontFamily:'monospace', letterSpacing:'0.1em', padding:'4px 0' }}>
                  {d}
                </div>
              ))}
            </div>
 
            {/* Day cells */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
              {/* Empty leading cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} style={{ aspectRatio:'1' }} />
              ))}
 
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d       = i + 1
                const dateStr = fmt(d)
                const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear()
                const hasPost = scheduledDates.has(dateStr)
                const isSel   = selected === dateStr
 
                const cellStyle: React.CSSProperties = {
                  aspectRatio: '1',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  position: 'relative',
                  gap: 3,
                  transition: 'all 0.12s',
                  border: '1px solid transparent',
                  color: isSel ? '#63b3ed' : isToday ? '#63b3ed' : '#8892a4',
                  background: isSel
                    ? 'rgba(99,179,237,0.14)'
                    : isToday
                    ? 'rgba(99,179,237,0.06)'
                    : 'transparent',
                  borderColor: isSel
                    ? '#63b3ed'
                    : isToday
                    ? 'rgba(99,179,237,0.35)'
                    : 'transparent',
                }
 
                return (
                  <div
                    key={d}
                    className="cal-cell"
                    style={cellStyle}
                    onClick={() => {
                      const toggling = isSel
                      setSelected(toggling ? null : dateStr)
                      if (!toggling) {
                        setForm(f => ({ ...f, day: String(d), fMonth: String(month+1), fYear: String(year) }))
                      }
                    }}
                  >
                    <span>{d}</span>
                    {hasPost && (
                      <div style={{ width:4, height:4, borderRadius:'50%', background:'#4ade80', position:'absolute', bottom:4 }} />
                    )}
                  </div>
                )
              })}
            </div>
 
            {/* Legend */}
            <div style={{ display:'flex', gap:12, marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#4f5a6e' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:'rgba(99,179,237,0.2)', border:'1px solid rgba(99,179,237,0.5)' }} />
                Today
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#4f5a6e' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80' }} />
                Has post
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#4f5a6e' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:'rgba(99,179,237,0.14)', border:'1px solid #63b3ed' }} />
                Selected
              </div>
            </div>
          </div>
 
          {/* Selected day detail */}
          {selected && (
            <div style={{ ...S.card, animation:'fadeIn 0.2s ease' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:11, color:'#4f5a6e', fontFamily:'monospace' }}>{selected}</span>
                <span style={{ fontSize:11, color:'#4f5a6e' }}>
                  {selectedItems.length} post{selectedItems.length !== 1 ? 's' : ''}
                </span>
              </div>
 
              {selectedItems.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0', fontSize:13, color:'#4f5a6e' }}>
                  No posts this day — fill the form →
                </div>
              ) : (
                selectedItems.map(item => (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#e8edf5', marginBottom:4 }}>{item.title}</div>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <PlatBadge platform={item.platform} />
                        <span style={{ fontSize:10, color:'#4f5a6e', fontFamily:'monospace' }}>{item.time}</span>
                      </div>
                    </div>
                    <button className="del-btn" style={S.btnSm} onClick={() => removeItem(item.id)}>
                      <Trash />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
 
        {/* ══ RIGHT: Form + Best Times + All Posts ═════════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
 
          {/* Form */}
          <div style={S.card}>
            <div style={{ ...S.sectionTitle, marginBottom:18 }}>Schedule New Post</div>
 
            {/* Title */}
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Post Title</label>
              <input
                className="sched-input"
                style={S.input}
                placeholder="What's this post about?"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
 
            {/* Platform */}
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Platform</label>
              <select
                className="sched-input"
                style={{ ...S.input, appearance:'none', cursor:'pointer' } as React.CSSProperties}
                value={form.platform}
                onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
              >
                {(['Instagram','YouTube','Twitter'] as Platform[]).map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
 
            {/* Date inputs */}
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Date</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.4fr', gap:8 }}>
                <div>
                  <div style={{ fontSize:10, color:'#4f5a6e', marginBottom:4, fontFamily:'monospace' }}>DD</div>
                  <input
                    className="sched-input"
                    style={S.input}
                    placeholder="dd"
                    maxLength={2}
                    value={form.day}
                    onChange={e => setForm(f => ({ ...f, day: e.target.value.replace(/\D/g,'').slice(0,2) }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize:10, color:'#4f5a6e', marginBottom:4, fontFamily:'monospace' }}>MM</div>
                  <input
                    className="sched-input"
                    style={S.input}
                    placeholder="mm"
                    maxLength={2}
                    value={form.fMonth}
                    onChange={e => setForm(f => ({ ...f, fMonth: e.target.value.replace(/\D/g,'').slice(0,2) }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize:10, color:'#4f5a6e', marginBottom:4, fontFamily:'monospace' }}>YYYY</div>
                  <input
                    className="sched-input"
                    style={S.input}
                    placeholder="yyyy"
                    maxLength={4}
                    value={form.fYear}
                    onChange={e => setForm(f => ({ ...f, fYear: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                  />
                </div>
              </div>
            </div>
 
            {/* Time */}
            <div style={{ marginBottom:18 }}>
              <label style={S.label}>Time</label>
              <input
                className="sched-input"
                style={{ ...S.input, width:'auto' }}
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>
 
            <button className="primary-btn" style={S.btnPrimary} onClick={addItem}>
              + Add to Schedule
            </button>
          </div>
 
          {/* Best times */}
          <div style={S.card}>
            <div style={{ ...S.sectionTitle, marginBottom:4 }}>Best Times to Post</div>
            <div style={{ fontSize:11, color:'#4f5a6e', marginBottom:16 }}>Based on your audience engagement patterns</div>
 
            {BEST_TIMES.map((p, i) => (
              <div key={i} style={{ marginBottom: i < BEST_TIMES.length - 1 ? 14 : 0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background: PLAT[p.platform].color }} />
                  <span style={{ fontSize:11, fontWeight:600, color: PLAT[p.platform].color, fontFamily:'monospace' }}>
                    {p.platform}
                  </span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {p.times.map(t => (
                    <span key={t} style={{
                      fontSize:10, padding:'3px 9px', borderRadius:20,
                      color: PLAT[p.platform].color,
                      background: PLAT[p.platform].bg,
                      border: `1px solid ${PLAT[p.platform].border}`,
                      fontFamily:'monospace',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
 
          {/* All scheduled posts */}
          <div style={S.card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={S.sectionTitle}>All Scheduled Posts</div>
              <span style={{ fontSize:11, color:'#4f5a6e', fontFamily:'monospace' }}>
                {items.length} post{items.length !== 1 ? 's' : ''}
              </span>
            </div>
 
            {items.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', fontSize:13, color:'#4f5a6e' }}>
                No scheduled posts yet
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={item.id}
                  className="sched-row"
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'11px 8px',
                    borderBottom: idx < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    borderRadius:6,
                    transition:'background 0.12s',
                  }}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#e8edf5', marginBottom:5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <PlatBadge platform={item.platform} />
                      <span style={{ fontSize:10, color:'#4f5a6e', fontFamily:'monospace' }}>
                        {item.date} · {item.time}
                      </span>
                    </div>
                  </div>
                  <button className="del-btn" style={S.btnSm} onClick={() => removeItem(item.id)}>
                    <Trash />
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

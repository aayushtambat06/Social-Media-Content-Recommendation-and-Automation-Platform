import { useState } from 'react'
 
// ─── MOCK DATA ────────────────────────────────────────────────────────────────
type Platform = 'Instagram' | 'YouTube' | 'Twitter'
type Status   = 'published' | 'scheduled' | 'draft'
 
interface Post {
  id: number; platform: Platform; title: string; status: Status
  views: number; likes: number; comments: number; shares: number; date: string
}
 
const MOCK_POSTS: Post[] = [
  { id:1, platform:'Instagram', title:'Behind the scenes: studio day',          status:'published', views:14200, likes:980,  comments:87,  shares:42, date:'Feb 28' },
  { id:2, platform:'YouTube',   title:'3 editing tricks that changed everything',status:'published', views:22800, likes:1640, comments:134, shares:89, date:'Feb 25' },
  { id:3, platform:'Instagram', title:'Morning routine for creators',            status:'scheduled', views:0,     likes:0,    comments:0,   shares:0,  date:'Mar 10' },
  { id:4, platform:'Twitter',   title:'Thread: 5 tips for viral content',       status:'draft',     views:0,     likes:0,    comments:0,   shares:0,  date:'—'      },
]
 
const WEEKLY = [
  { day:'Mon', views:3200 }, { day:'Tue', views:4800 }, { day:'Wed', views:2900 },
  { day:'Thu', views:6100 }, { day:'Fri', views:7400 }, { day:'Sat', views:5600 }, { day:'Sun', views:4200 },
]
 
const BEST_TIMES = [
  { day:'Monday',   slots:[{ time:'7–9 PM',      score:92 }],                              platform:'Twitter'           },
  { day:'Tuesday',  slots:[{ time:'6–8 PM',      score:96 }],                              platform:'Instagram'         },
  { day:'Thursday', slots:[{ time:'2–4 PM',      score:88 }],                              platform:'YouTube'           },
  { day:'Friday',   slots:[{ time:'12–2 PM',     score:91 }, { time:'9–11 PM', score:85 }], platform:'Instagram / Twitter' },
  { day:'Saturday', slots:[{ time:'10 AM–12 PM', score:87 }],                              platform:'YouTube'           },
  { day:'Sunday',   slots:[{ time:'8–10 AM',     score:82 }],                              platform:'Instagram'         },
]
 
// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg2:'#0d1225', bg3:'#111827',
  border:'rgba(255,255,255,0.06)',
  text:'#e8edf5', text2:'#8892a4', text3:'#4f5a6e',
  accent:'#63b3ed', accent2:'#4ade80', accent3:'#f59e0b', accent4:'#a78bfa', danger:'#f87171',
}
 
const PLAT_STYLE: Record<Platform, { color:string; bg:string; border:string }> = {
  Instagram: { color:C.accent4, bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)' },
  YouTube:   { color:C.danger,  bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)' },
  Twitter:   { color:'#38bdf8', bg:'rgba(56,189,248,0.1)',  border:'rgba(56,189,248,0.3)'  },
}
const STATUS_STYLE: Record<Status, { color:string; bg:string; border:string }> = {
  published: { color:C.accent2, bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)'  },
  scheduled: { color:C.accent3, bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)'  },
  draft:     { color:C.accent,  bg:'rgba(99,179,237,0.1)',  border:'rgba(99,179,237,0.3)'  },
}
 
const card: React.CSSProperties = {
  background:'linear-gradient(135deg, rgba(13,18,37,0.95), rgba(8,12,24,0.98))',
  border:`1px solid ${C.border}`, borderRadius:12, padding:20,
}
const TH: React.CSSProperties = {
  fontSize:10, letterSpacing:'0.1em', color:C.text3, fontFamily:'monospace',
  fontWeight:600, padding:'10px 12px', textAlign:'left', borderBottom:`1px solid ${C.border}`,
}
const TD: React.CSSProperties = {
  padding:'12px 12px', borderBottom:'1px solid rgba(255,255,255,0.03)',
  color:C.text2, verticalAlign:'middle',
}
 
// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────
function PlatBadge({ platform }: { platform: Platform }) {
  const s = PLAT_STYLE[platform]
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{platform}</span>
}
function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{status}</span>
}
function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height:4, background:C.bg3, borderRadius:2, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, borderRadius:2, background:color, transition:'width 0.5s ease' }} />
    </div>
  )
}
 
// stable heatmap (no random re-renders)
const HEATMAP = Array.from({ length:8 }, (_, h) =>
  Array.from({ length:7 }, (_, d) => 0.1 + ((h*7+d+h*d) % 17) / 17 * 0.9)
)
 
// ─── MAIN ─────────────────────────────────────────────────────────────────────
export function AnalyticsSection() {
  const [tab,      setTab]      = useState<'overview'|'posts'|'best times'>('overview')
  const [platform, setPlatform] = useState<Platform|'All'>('All')
 
  const totals = MOCK_POSTS.reduce(
    (a, p) => ({ views:a.views+p.views, likes:a.likes+p.likes, comments:a.comments+p.comments, shares:a.shares+p.shares }),
    { views:0, likes:0, comments:0, shares:0 }
  )
  const maxViews      = Math.max(...WEEKLY.map(d => d.views))
  const filteredPosts = platform === 'All' ? MOCK_POSTS : MOCK_POSTS.filter(p => p.platform === platform)
 
  const KPI = [
    { label:'Total Views',   value:totals.views.toLocaleString(),    icon:'👁',  color:C.accent,  pct:72 },
    { label:'Total Likes',   value:totals.likes.toLocaleString(),    icon:'❤️', color:C.accent4, pct:81 },
    { label:'Comments',      value:totals.comments.toLocaleString(), icon:'💬',  color:C.accent2, pct:55 },
    { label:'Shares',        value:totals.shares.toLocaleString(),   icon:'🔁',  color:C.accent3, pct:63 },
  ]
 
  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .an-tab:hover  { color: #e8edf5 !important; }
        .an-bar:hover  { background: linear-gradient(to top,rgba(99,179,237,0.75),rgba(99,179,237,0.35)) !important; }
        .an-row:hover td { background: rgba(255,255,255,0.025); }
        .an-cell:hover { opacity:0.75; }
        select option  { background:#0d1225; color:#e8edf5; }
      `}</style>
 
      {/* ── Pill tabs ─────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:2, background:C.bg2, borderRadius:10, padding:3, marginBottom:20 }}>
        {(['overview','posts','best times'] as const).map(t => (
          <div key={t} className="an-tab" onClick={() => setTab(t)} style={{
            flex:1, padding:'7px 12px', borderRadius:8, fontSize:12, fontWeight:600,
            cursor:'pointer', textAlign:'center', transition:'all 0.15s',
            color: tab===t ? C.text : C.text3,
            background: tab===t ? C.bg3 : 'transparent',
            boxShadow: tab===t ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
 
      {/* ══ OVERVIEW ═══════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <>
          {/* KPI grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
            {KPI.map((k, i) => (
              <div key={i} style={{ ...card, borderColor:`${k.color}20` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.06em', fontFamily:'monospace', textTransform:'uppercase' }}>{k.label}</div>
                  <span style={{ fontSize:20 }}>{k.icon}</span>
                </div>
                <div style={{ fontSize:26, fontWeight:800, color:k.color, letterSpacing:'-0.02em', marginBottom:3 }}>{k.value}</div>
                <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginBottom:9 }}>+{Math.floor(k.pct * 0.3)}% this week</div>
                <Bar pct={k.pct} color={`linear-gradient(90deg,${k.color}90,${k.color}30)`} />
              </div>
            ))}
          </div>
 
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            {/* Bar chart */}
            <div style={card}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2 }}>Views Over Time</div>
              <div style={{ fontSize:11, color:C.text3, fontFamily:'monospace', marginBottom:14 }}>Last 7 days</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110, paddingTop:8 }}>
                {WEEKLY.map((d, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5, height:'100%' }}>
                    <div style={{ flex:1, display:'flex', alignItems:'flex-end', width:'100%' }}>
                      <div className="an-bar" title={`${d.views.toLocaleString()} views`} style={{
                        width:'100%', borderRadius:'4px 4px 0 0', minHeight:4,
                        height:`${(d.views/maxViews)*100}%`,
                        background:'linear-gradient(to top,rgba(99,179,237,0.45),rgba(99,179,237,0.15))',
                        border:'1px solid rgba(99,179,237,0.25)', borderBottom:'none', transition:'all 0.3s',
                      }} />
                    </div>
                    <div style={{ fontSize:9, color:C.text3, fontFamily:'monospace' }}>{d.day.slice(0,3)}</div>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Platform breakdown */}
            <div style={card}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:18 }}>Platform Breakdown</div>
              {([{ name:'Instagram' as Platform, pct:48, views:'17.2K' }, { name:'YouTube' as Platform, pct:37, views:'22.8K' }, { name:'Twitter' as Platform, pct:15, views:'5.4K' }]).map((p, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:PLAT_STYLE[p.name].color }}>{p.name}</span>
                    <span style={{ fontSize:11, color:C.text3, fontFamily:'monospace' }}>{p.views} · {p.pct}%</span>
                  </div>
                  <Bar pct={p.pct} color={`linear-gradient(90deg,${PLAT_STYLE[p.name].color}80,${PLAT_STYLE[p.name].color}30)`} />
                </div>
              ))}
            </div>
          </div>
 
          {/* Recent posts table */}
          <div style={card}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Recent Posts</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead><tr>{['Platform','Title','Status','Views','Likes','Date'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {MOCK_POSTS.map(p => (
                  <tr key={p.id} className="an-row">
                    <td style={TD}><PlatBadge platform={p.platform} /></td>
                    <td style={{ ...TD, color:C.text, fontWeight:500 }}>{p.title}</td>
                    <td style={TD}><StatusBadge status={p.status} /></td>
                    <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{p.views > 0 ? p.views.toLocaleString() : '—'}</td>
                    <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{p.likes > 0 ? p.likes.toLocaleString() : '—'}</td>
                    <td style={{ ...TD, fontFamily:'monospace', fontSize:11, color:C.text3 }}>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
 
      {/* ══ POSTS ══════════════════════════════════════════════════════════════ */}
      {tab === 'posts' && (
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
            <div style={{ flex:1, fontSize:14, fontWeight:700, color:C.text }}>Post Performance</div>
            <select style={{ padding:'6px 10px', borderRadius:8, background:C.bg2, border:`1px solid ${C.border}`, color:C.text2, fontSize:12, outline:'none', cursor:'pointer', fontFamily:'inherit' }}
              value={platform} onChange={e => setPlatform(e.target.value as Platform|'All')}>
              {(['All','Instagram','YouTube','Twitter'] as const).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr>{['Platform','Title','Views','Likes','Comments','Eng. Rate','Status'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {filteredPosts.map(p => {
                const eng = p.views > 0 ? (((p.likes+p.comments)/p.views)*100).toFixed(1) : '—'
                return (
                  <tr key={p.id} className="an-row">
                    <td style={TD}><PlatBadge platform={p.platform} /></td>
                    <td style={{ ...TD, color:C.text, fontWeight:500, maxWidth:200 }}>{p.title}</td>
                    <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{p.views > 0 ? p.views.toLocaleString() : '—'}</td>
                    <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{p.likes > 0 ? p.likes.toLocaleString() : '—'}</td>
                    <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{p.comments > 0 ? p.comments.toLocaleString() : '—'}</td>
                    <td style={TD}><span style={{ fontFamily:'monospace', fontSize:12, color: parseFloat(eng) > 5 ? C.accent2 : C.text2 }}>{eng}{eng !== '—' ? '%' : ''}</span></td>
                    <td style={TD}><StatusBadge status={p.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredPosts.length === 0 && <div style={{ textAlign:'center', color:C.text3, padding:'40px 0', fontSize:13 }}>No posts found for this platform</div>}
        </div>
      )}
 
      {/* ══ BEST TIMES ═════════════════════════════════════════════════════════ */}
      {tab === 'best times' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
 
          {/* Optimal windows with progress bars */}
          <div style={card}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>Optimal Posting Windows</div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:20 }}>AI-analyzed from your top performing content</div>
            {BEST_TIMES.map((d, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < BEST_TIMES.length-1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width:64, fontSize:12, fontWeight:600, color:C.text2, flexShrink:0 }}>{d.day}</div>
                <div style={{ flex:1 }}>
                  {d.slots.map((s, j) => (
                    <div key={j} style={{ display:'flex', alignItems:'center', gap:8, marginBottom: j < d.slots.length-1 ? 5 : 0 }}>
                      <span style={{ fontSize:11, fontFamily:'monospace', color:C.accent, width:88, flexShrink:0 }}>{s.time}</span>
                      <div style={{ flex:1 }}><Bar pct={s.score} color={`linear-gradient(90deg,${C.accent},${C.accent4})`} /></div>
                      <span style={{ fontSize:10, fontFamily:'monospace', color:C.accent2, width:30, textAlign:'right' }}>{s.score}%</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:10, color:C.text3, width:88, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{d.platform}</div>
              </div>
            ))}
          </div>
 
          {/* Heatmap */}
          <div style={card}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>Audience Activity Heatmap</div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:16 }}>Hourly engagement by day of week</div>
            <div style={{ display:'flex', gap:4, marginBottom:6, paddingLeft:34 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} style={{ flex:1, fontSize:9, color:C.text3, textAlign:'center', fontFamily:'monospace' }}>{d}</div>
              ))}
            </div>
            {HEATMAP.map((row, hour) => (
              <div key={hour} style={{ display:'flex', gap:4, marginBottom:4, alignItems:'center' }}>
                <div style={{ fontSize:9, color:C.text3, fontFamily:'monospace', width:30, flexShrink:0, textAlign:'right', paddingRight:4 }}>
                  {[6,8,10,12,14,16,18,20][hour]}h
                </div>
                {row.map((v, day) => (
                  <div key={day} className="an-cell" title={`${Math.round(v*100)}% activity`} style={{
                    flex:1, aspectRatio:'1', borderRadius:3, cursor:'pointer',
                    background:`rgba(99,179,237,${v.toFixed(2)})`, transition:'opacity 0.15s',
                  }} />
                ))}
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14, justifyContent:'center' }}>
              <span style={{ fontSize:9, color:C.text3 }}>Low</span>
              {[0.1,0.3,0.5,0.7,0.9].map((v, i) => <div key={i} style={{ width:14, height:14, borderRadius:3, background:`rgba(99,179,237,${v})` }} />)}
              <span style={{ fontSize:9, color:C.text3 }}>High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


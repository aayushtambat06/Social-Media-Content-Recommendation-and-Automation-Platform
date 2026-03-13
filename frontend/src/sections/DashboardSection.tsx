// export function DashboardSection() {
//   return (
//     <>
//       <h2 className="main-card-title">Welcome to your social media control center</h2>
//       <p className="main-card-text">
//         Soon you&apos;ll be able to upload videos, generate smart captions and hashtags,
//         schedule posts for Instagram and YouTube, and track how they perform — all
//         in one place.
//       </p>
//     </>
//   )
// }



import { useNavigate } from 'react-router-dom'
 
// ─── MOCK DATA ────────────────────────────────────────────────────────────────
type Platform = 'Instagram' | 'YouTube' | 'Twitter'
type Status   = 'published' | 'scheduled' | 'draft'
 
interface Post {
  id: number; platform: Platform; title: string; status: Status
  views: number; likes: number; date: string
}
 
const MOCK_POSTS: Post[] = [
  { id:1, platform:'Instagram', title:'Behind the scenes: studio day',            status:'published', views:14200, likes:980,  date:'Feb 28' },
  { id:2, platform:'YouTube',   title:'3 editing tricks that changed everything',  status:'published', views:22800, likes:1640, date:'Feb 25' },
  { id:3, platform:'Instagram', title:'Morning routine for creators',              status:'scheduled', views:0,     likes:0,    date:'Mar 10' },
  { id:4, platform:'Twitter',   title:'Thread: 5 tips for viral content',         status:'draft',     views:0,     likes:0,    date:'—'      },
]
 
const WEEKLY = [
  { day:'Mon', views:3200 }, { day:'Tue', views:4800 }, { day:'Wed', views:2900 },
  { day:'Thu', views:6100 }, { day:'Fri', views:7400 }, { day:'Sat', views:5600 }, { day:'Sun', views:4200 },
]
 
const ACTIVITY = [
  { color:'#4ade80', text:'YouTube video hit 22K views — top performing content this week', time:'2h ago'     },
  { color:'#63b3ed', text:'AI generated captions for "Morning routine" post',               time:'5h ago'     },
  { color:'#f59e0b', text:'Scheduled post for March 10 at 6:00 PM',                        time:'Yesterday'  },
  { color:'#a78bfa', text:'Instagram account connected successfully',                       time:'2 days ago' },
  { color:'#f87171', text:'Twitter API rate limit reached — retry scheduled',               time:'3 days ago' },
]
 
const PLATFORMS_STATUS = [
  { name:'Instagram' as Platform, connected:true,  followers:'12.4K', growth:'+3.2%' },
  { name:'YouTube'   as Platform, connected:true,  followers:'8.1K',  growth:'+5.8%' },
  { name:'Twitter'   as Platform, connected:false, followers:'—',     growth:'—'     },
]
 
// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg2:'#0d1225', bg3:'#111827',
  border:'rgba(255,255,255,0.06)',
  text:'#e8edf5', text2:'#8892a4', text3:'#4f5a6e',
  accent:'#63b3ed', accent2:'#4ade80', accent3:'#f59e0b', accent4:'#a78bfa', danger:'#f87171',
}
 
const PLAT_STYLE: Record<Platform, { color:string; bg:string; border:string; icon:string }> = {
  Instagram: { color:C.accent4, bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)', icon:'📸' },
  YouTube:   { color:C.danger,  bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)', icon:'▶️' },
  Twitter:   { color:'#38bdf8', bg:'rgba(56,189,248,0.1)',  border:'rgba(56,189,248,0.3)',  icon:'𝕏'  },
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
  padding:'11px 12px', borderBottom:'1px solid rgba(255,255,255,0.03)',
  color:C.text2, verticalAlign:'middle',
}
 
function PlatBadge({ platform }: { platform: Platform }) {
  const s = PLAT_STYLE[platform]
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{platform}</span>
}
function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{status}</span>
}
function ProgressBar({ pct, color }: { pct:number; color:string }) {
  return (
    <div style={{ height:3, background:C.bg3, borderRadius:2, overflow:'hidden', marginTop:9 }}>
      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, borderRadius:2, background:color, transition:'width 0.5s ease' }} />
    </div>
  )
}
 
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function DashboardSection() {
  const navigate = useNavigate()
 
  const totals   = MOCK_POSTS.reduce((a, p) => ({ views:a.views+p.views, likes:a.likes+p.likes }), { views:0, likes:0 })
  const maxViews = Math.max(...WEEKLY.map(d => d.views))
  const engRate  = totals.views > 0 ? ((totals.likes / totals.views) * 100).toFixed(1) : '0'
 
  const KPI = [
    { label:'Total Views',     value:totals.views.toLocaleString(), sub:'All platforms',      trend:'+18% vs last week', up:true,  color:C.accent,  pct:72 },
    { label:'Total Likes',     value:totals.likes.toLocaleString(), sub:'All platforms',      trend:'+24% vs last week', up:true,  color:C.accent4, pct:81 },
    { label:'Scheduled Posts', value:'3',                           sub:'Next 30 days',       trend:'+2 this week',      up:true,  color:C.accent2, pct:45 },
    { label:'Avg. Engagement', value:`${engRate}%`,                 sub:'Like + comment rate',trend:'-0.3% vs last week',up:false, color:C.accent3, pct:62 },
  ]
 
  const QUICK_ACTIONS = [
    { icon:'📤', label:'Upload Video',    desc:'Add new content',     path:'/upload'    },
    { icon:'📅', label:'Schedule Post',   desc:'Plan your calendar',  path:'/schedule'  },
    { icon:'📊', label:'View Analytics',  desc:'Track performance',   path:'/analytics' },
    { icon:'⚙️', label:'Settings',        desc:'Manage integrations', path:'/settings'  },
  ]
 
  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .qa-card:hover    { transform:translateY(-2px); border-color:rgba(99,179,237,0.3) !important; box-shadow:0 0 20px rgba(99,179,237,0.08) !important; }
        .an-bar:hover     { background:linear-gradient(to top,rgba(99,179,237,0.75),rgba(99,179,237,0.35)) !important; }
        .an-row:hover td  { background:rgba(255,255,255,0.02); }
        .plat-row:hover   { border-color:rgba(99,179,237,0.25) !important; }
        .ghost-btn:hover  { color:#e8edf5 !important; border-color:rgba(255,255,255,0.14) !important; }
        .connect-btn:hover{ color:#63b3ed !important; border-color:rgba(99,179,237,0.45) !important; }
      `}</style>
 
      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {QUICK_ACTIONS.map((a, i) => (
          <div key={i} className="qa-card" onClick={() => navigate(a.path)} style={{
            ...card, cursor:'pointer', transition:'all 0.2s',
            display:'flex', flexDirection:'column', alignItems:'center',
            gap:8, padding:'18px 12px', textAlign:'center',
          }}>
            <div style={{ fontSize:24 }}>{a.icon}</div>
            <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{a.label}</div>
            <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace' }}>{a.desc}</div>
          </div>
        ))}
      </div>
 
      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {KPI.map((k, i) => (
          <div key={i} style={{ ...card, borderColor:`${k.color}20` }}>
            <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.06em', fontFamily:'monospace', textTransform:'uppercase', marginBottom:8 }}>{k.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:k.color, letterSpacing:'-0.02em', marginBottom:2 }}>{k.value}</div>
            <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginBottom:3 }}>{k.sub}</div>
            <div style={{ fontSize:10, color: k.up ? C.accent2 : C.danger }}>{k.trend}</div>
            <ProgressBar pct={k.pct} color={`linear-gradient(90deg,${k.color}90,${k.color}30)`} />
          </div>
        ))}
      </div>
 
      {/* ── Chart + Activity ─────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
 
        <div style={card}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2 }}>Weekly Views</div>
              <div style={{ fontSize:11, color:C.text3, fontFamily:'monospace' }}>Last 7 days · all platforms</div>
            </div>
            <span style={{ fontSize:11, color:C.accent2, fontFamily:'monospace', fontWeight:600 }}>
              {totals.views.toLocaleString()} total
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
            {WEEKLY.map((d, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5, height:'100%' }}>
                <div style={{ flex:1, display:'flex', alignItems:'flex-end', width:'100%' }}>
                  <div className="an-bar" title={`${d.views.toLocaleString()} views`} style={{
                    width:'100%', borderRadius:'4px 4px 0 0', minHeight:4, transition:'all 0.3s',
                    height:`${(d.views/maxViews)*100}%`,
                    background:'linear-gradient(to top,rgba(99,179,237,0.45),rgba(99,179,237,0.15))',
                    border:'1px solid rgba(99,179,237,0.25)', borderBottom:'none',
                  }} />
                </div>
                <div style={{ fontSize:9, color:C.text3, fontFamily:'monospace' }}>{d.day.slice(0,3)}</div>
              </div>
            ))}
          </div>
        </div>
 
        <div style={card}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Recent Activity</div>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom: i < ACTIVITY.length-1 ? `1px solid rgba(255,255,255,0.03)` : 'none' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, flexShrink:0, marginTop:4 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:C.text2, lineHeight:1.5 }}>{a.text}</div>
                <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginTop:2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
 
      {/* ── Recent posts + Platform status ───────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
 
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Recent Posts</div>
            <button className="ghost-btn" onClick={() => navigate('/analytics')} style={{
              padding:'4px 10px', borderRadius:7, border:`1px solid ${C.border}`,
              background:'transparent', color:C.text2, fontSize:11, fontWeight:600,
              cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
            }}>
              View all →
            </button>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>{['Platform','Title','Status','Views'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {MOCK_POSTS.map(p => (
                <tr key={p.id} className="an-row">
                  <td style={TD}><PlatBadge platform={p.platform} /></td>
                  <td style={{ ...TD, color:C.text, fontWeight:500, maxWidth:160, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.title}</td>
                  <td style={TD}><StatusBadge status={p.status} /></td>
                  <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{p.views > 0 ? p.views.toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Connected Platforms</div>
            <span style={{ fontSize:10, color:C.accent2, fontFamily:'monospace', padding:'2px 8px', borderRadius:20, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)' }}>
              2 / 3 live
            </span>
          </div>
 
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
            {PLATFORMS_STATUS.map((p, i) => {
              const s = PLAT_STYLE[p.name]
              return (
                <div key={i} className="plat-row" style={{
                  display:'flex', alignItems:'center', gap:12, padding:'11px 13px',
                  borderRadius:10, transition:'all 0.15s',
                  border:`1px solid ${p.connected ? `${s.color}30` : C.border}`,
                  background: p.connected ? `${s.color}05` : 'transparent',
                }}>
                  <div style={{ width:36, height:36, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, background:`${s.color}12`, border:`1px solid ${s.color}20` }}>
                    {s.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color: p.connected ? s.color : C.text2 }}>{p.name}</div>
                    <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginTop:2 }}>
                      {p.connected ? `${p.followers} followers · ${p.growth}` : 'Not connected'}
                    </div>
                  </div>
                  {p.connected ? (
                    <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, fontFamily:'monospace', color:C.accent2, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', flexShrink:0 }}>
                      Live
                    </span>
                  ) : (
                    <button className="connect-btn" onClick={() => navigate('/settings')} style={{
                      padding:'5px 11px', borderRadius:7, border:`1px solid ${C.border}`,
                      background:'transparent', color:C.text2, fontSize:11, fontWeight:600,
                      cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', flexShrink:0,
                    }}>
                      Connect
                    </button>
                  )}
                </div>
              )
            })}
          </div>
 
          {/* Plan nudge */}
          <div style={{ padding:'12px 14px', borderRadius:10, background:'linear-gradient(135deg,rgba(99,179,237,0.06),rgba(167,139,250,0.04))', border:'1px solid rgba(99,179,237,0.15)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:2 }}>Free Plan</div>
                <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace' }}>50 AI generations · 3 platforms</div>
              </div>
              <button onClick={() => navigate('/settings')} style={{
                padding:'6px 14px', borderRadius:8,
                background:'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(167,139,250,0.15))',
                border:'1px solid rgba(99,179,237,0.3)', color:C.accent,
                fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
              }}>
                Upgrade ⚡
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

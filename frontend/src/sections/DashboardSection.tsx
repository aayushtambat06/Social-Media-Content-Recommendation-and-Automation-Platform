// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { supabase } from '../lib/supabase'
// import { apiFetch } from '../lib/api' //  NEW: Importing our backend helper

// // ─── TYPES ────────────────────────────────────────────────────────────────────
// type Platform = 'instagram' | 'youtube' | 'twitter'
// type Status   = 'published' | 'scheduled' | 'draft'

// interface ContentRow {
//   id: string
//   title: string
//   platform: Platform
//   status: Status
//   created_at: string
//   scheduled_at: string | null
//   published_at: string | null
//   caption: string | null
//   hashtags: string[] | null
// }

// interface AnalyticsSummary {
//   total: number
//   published: number
//   scheduled: number
//   drafts: number
//   byPlatform: Record<string, number>
//   weeklyActivity: { day:string; count:number }[]
// }

// interface MetricsSummary {
//   totals:         { views:number; likes:number; comments:number; shares:number }
//   byPlatform:     Record<string, { views:number; likes:number; comments:number; shares:number; posts:number }>
//   engagementRate: string
//   totalPosts:     number
// }

// // ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// const C = {
//   bg2:'#0d1225', bg3:'#111827',
//   border:'rgba(255,255,255,0.06)',
//   text:'#e8edf5', text2:'#8892a4', text3:'#4f5a6e',
//   accent:'#63b3ed', accent2:'#4ade80', accent3:'#f59e0b', accent4:'#a78bfa', danger:'#f87171',
// }

// type PlatKey = 'instagram' | 'youtube' | 'twitter'
// const PLAT_STYLE: Record<PlatKey, { color:string; bg:string; border:string; icon:string; label:string }> = {
//   instagram: { color:C.accent4, bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)', icon:'📸', label:'Instagram' },
//   youtube:   { color:C.danger,  bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)', icon:'▶️', label:'YouTube'   },
//   twitter:   { color:'#38bdf8', bg:'rgba(56,189,248,0.1)',  border:'rgba(56,189,248,0.3)',  icon:'𝕏',  label:'Twitter'   },
// }
// const STATUS_STYLE: Record<Status, { color:string; bg:string; border:string }> = {
//   published: { color:C.accent2, bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)'  },
//   scheduled: { color:C.accent3, bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)'  },
//   draft:     { color:C.accent,  bg:'rgba(99,179,237,0.1)',  border:'rgba(99,179,237,0.3)'  },
// }

// const card: React.CSSProperties = {
//   background:'linear-gradient(135deg, rgba(13,18,37,0.95), rgba(8,12,24,0.98))',
//   border:`1px solid ${C.border}`, borderRadius:12, padding:20,
// }
// const TH: React.CSSProperties = {
//   fontSize:10, letterSpacing:'0.1em', color:C.text3, fontFamily:'monospace',
//   fontWeight:600, padding:'10px 12px', textAlign:'left', borderBottom:`1px solid ${C.border}`,
// }
// const TD: React.CSSProperties = {
//   padding:'11px 12px', borderBottom:'1px solid rgba(255,255,255,0.03)',
//   color:C.text2, verticalAlign:'middle',
// }

// // ─── HELPERS ──────────────────────────────────────────────────────────────────
// function PlatBadge({ platform }: { platform: Platform }) {
//   const s = PLAT_STYLE[platform] ?? PLAT_STYLE.instagram
//   return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{s.label}</span>
// }
// function StatusBadge({ status }: { status: Status }) {
//   const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft
//   return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{status}</span>
// }
// function ProgressBar({ pct, color }: { pct:number; color:string }) {
//   return (
//     <div style={{ height:3, background:C.bg3, borderRadius:2, overflow:'hidden', marginTop:9 }}>
//       <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, borderRadius:2, background:color, transition:'width 0.6s ease' }} />
//     </div>
//   )
// }
// function Skeleton({ w = '100%', h = 16, r = 6 }: { w?: string|number; h?: number; r?: number }) {
//   return <div style={{ width:w, height:h, borderRadius:r, background:`linear-gradient(90deg, ${C.bg2}, ${C.bg3}, ${C.bg2})`, backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
// }
// function formatDate(iso: string) {
//   return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric' })
// }

// // ─── DASHBOARD ────────────────────────────────────────────────────────────────
// export function DashboardSection() {
//   const navigate = useNavigate()

//   const [posts,        setPosts]        = useState<ContentRow[]>([])
//   const [summary,      setSummary]      = useState<AnalyticsSummary | null>(null)
//   const [metrics,      setMetrics]      = useState<MetricsSummary | null>(null)
//   const [integrations, setIntegrations] = useState<string[]>([]) // 👈 Store connected platforms
//   const [loading,      setLoading]      = useState(true)
//   const [error,        setError]        = useState<string | null>(null)

//   useEffect(() => {
//     async function fetchData() {
//       setLoading(true); setError(null)
//       try {
//         const { data: { user } } = await supabase.auth.getUser()
//         if (!user) return

//         // 1. Fetch raw content for Recent Posts table & Activity Feed
//         const contentPromise = supabase
//           .from('content')
//           .select('id, title, platform, status, created_at, scheduled_at, published_at, caption, hashtags')
//           .eq('user_id', user.id)
//           .order('created_at', { ascending: false })
//           .limit(20)

//         // 2. Fetch connected platforms from your database
//         const integrationsPromise = supabase
//           .from('user_integrations')
//           .select('platform')
//           .eq('user_id', user.id)

//         // 3. Fire all API calls simultaneously for maximum speed
//         const [contentRes, integrationsRes, summaryRes, metricsRes] = await Promise.all([
//           contentPromise,
//           integrationsPromise,
//           apiFetch('/api/analytics/summary'),
//           apiFetch('/api/metrics/summary')
//         ])

//         if (contentRes.error) throw contentRes.error
//         if (integrationsRes.error) throw integrationsRes.error

//         setPosts((contentRes.data as ContentRow[]) ?? [])
//         setIntegrations(integrationsRes.data?.map(i => i.platform) ?? [])
//         setSummary(summaryRes)
//         setMetrics(metricsRes)

//       } catch (e) {
//         setError(e instanceof Error ? e.message : 'Failed to load data')
//       }
//       setLoading(false)
//     }
//     fetchData()
//   }, [])

//   // ── Derived stats (Backend Summary fallback to Frontend Math)
//   const totalPosts = summary?.total ?? posts.length
//   const published  = summary?.published ?? posts.filter(p => p.status === 'published').length
//   const scheduled  = summary?.scheduled ?? posts.filter(p => p.status === 'scheduled').length
//   const drafts     = summary?.drafts ?? posts.filter(p => p.status === 'draft').length

//   const weeklyBuckets = summary?.weeklyActivity ?? (() => {
//     const days: Record<string, number> = {}
//     const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
//     labels.forEach(d => { days[d] = 0 })
//     const now = Date.now()
//     posts.forEach(p => {
//       const age = (now - new Date(p.created_at).getTime()) / 86400000
//       if (age <= 7) {
//         const label = labels[new Date(p.created_at).getDay()]
//         days[label] = (days[label] ?? 0) + 1
//       }
//     })
//     return labels.map(d => ({ day: d, count: days[d] }))
//   })()
  
//   const maxBucket = Math.max(...weeklyBuckets.map(b => b.count), 1)

//   // Dynamically map Platform Status based on real integrations!
//   const platformStatus = (['instagram', 'youtube', 'twitter'] as PlatKey[]).map(plat => {
//     const isConnected = integrations.includes(plat);
//     const m = metrics?.byPlatform?.[plat];
//     return {
//       name: plat,
//       connected: isConnected,
//       followers: isConnected && m ? `${(m.views / 2.5).toFixed(1)}K` : (isConnected ? 'Active' : '—'), // Faking follower count based on seeded views for the demo!
//       growth: isConnected && m ? `+${(m.likes / 100).toFixed(1)}%` : '—'
//     }
//   });

//   const activityFeed = posts.slice(0, 5).map(p => {
//     const plat = PLAT_STYLE[p.platform] ?? PLAT_STYLE.instagram
//     const action =
//       p.status === 'published' ? `Published "${p.title}" on ${plat.label}` :
//       p.status === 'scheduled' ? `Scheduled "${p.title}" for ${p.scheduled_at ? formatDate(p.scheduled_at) : 'later'}` :
//       `Draft saved: "${p.title}"`
//     return { color: plat.color, text: action, time: formatDate(p.created_at) }
//   })

//   const KPI = [
//     { label:'Total Posts',     value: loading ? '—' : totalPosts.toString(),   sub:'In your library',    color:C.accent,  pct: Math.min((totalPosts / 10) * 100, 100) },
//     { label:'Published',       value: loading ? '—' : published.toString(),    sub:'Live content',       color:C.accent2, pct: totalPosts > 0 ? (published / totalPosts) * 100 : 0 },
//     { label:'Scheduled',       value: loading ? '—' : scheduled.toString(),    sub:'Queued to publish',  color:C.accent3, pct: totalPosts > 0 ? (scheduled / totalPosts) * 100 : 0 },
//     { label:'Drafts',          value: loading ? '—' : drafts.toString(),       sub:'Work in progress',   color:C.accent4, pct: totalPosts > 0 ? (drafts / totalPosts) * 100 : 0 },
//   ]

//   const QUICK_ACTIONS = [
//     { icon:'📤', label:'Upload Video',  desc:'Add new content',    path:'/upload'    },
//     { icon:'📅', label:'Schedule Post', desc:'Plan your calendar',  path:'/schedule'  },
//     { icon:'📊', label:'View Analytics',desc:'Track performance',   path:'/analytics' },
//     { icon:'⚙️', label:'Settings',      desc:'Manage integrations', path:'/settings'  },
//   ]

//   return (
//     <div style={{ animation:'fadeIn 0.3s ease' }}>
//       <style>{`
//         @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
//         .qa-card:hover     { transform:translateY(-2px); border-color:rgba(99,179,237,0.3) !important; box-shadow:0 0 20px rgba(99,179,237,0.08) !important; }
//         .an-bar:hover      { background:linear-gradient(to top,rgba(99,179,237,0.75),rgba(99,179,237,0.35)) !important; }
//         .an-row:hover td   { background:rgba(255,255,255,0.02); }
//         .plat-row:hover    { border-color:rgba(99,179,237,0.25) !important; }
//         .ghost-btn:hover   { color:#e8edf5 !important; border-color:rgba(255,255,255,0.14) !important; }
//         .connect-btn:hover { color:#63b3ed !important; border-color:rgba(99,179,237,0.45) !important; }
//       `}</style>

//       {error && (
//         <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:9, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', color:C.danger, fontSize:12, fontFamily:'monospace' }}>
//           ⚠ {error}
//         </div>
//       )}

//       {/* ── Quick actions ────────────────────────────────────────────────── */}
//       <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
//         {QUICK_ACTIONS.map((a, i) => (
//           <div key={i} className="qa-card" onClick={() => navigate(a.path)} style={{
//             ...card, cursor:'pointer', transition:'all 0.2s',
//             display:'flex', flexDirection:'column', alignItems:'center',
//             gap:8, padding:'18px 12px', textAlign:'center',
//           }}>
//             <div style={{ fontSize:24 }}>{a.icon}</div>
//             <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{a.label}</div>
//             <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace' }}>{a.desc}</div>
//           </div>
//         ))}
//       </div>

//       {/* ── KPI cards ───────────────────────────────────────────────────── */}
//       <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
//         {KPI.map((k, i) => (
//           <div key={i} style={{ ...card, borderColor:`${k.color}20` }}>
//             <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.06em', fontFamily:'monospace', textTransform:'uppercase', marginBottom:8 }}>{k.label}</div>
//             {loading
//               ? <><Skeleton h={28} w="50%" /><div style={{marginTop:6}}/><Skeleton h={10} w="70%" /></>
//               : <>
//                   <div style={{ fontSize:26, fontWeight:800, color:k.color, letterSpacing:'-0.02em', marginBottom:2 }}>{k.value}</div>
//                   <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginBottom:3 }}>{k.sub}</div>
//                 </>
//             }
//             <ProgressBar pct={k.pct} color={`linear-gradient(90deg,${k.color}90,${k.color}30)`} />
//           </div>
//         ))}
//       </div>

//       {/* ── Chart + Activity ─────────────────────────────────────────────── */}
//       <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

//         <div style={card}>
//           <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
//             <div>
//               <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2 }}>Posts This Week</div>
//               <div style={{ fontSize:11, color:C.text3, fontFamily:'monospace' }}>Content created in the last 7 days</div>
//             </div>
//             <span style={{ fontSize:11, color:C.accent2, fontFamily:'monospace', fontWeight:600 }}>
//               {posts.filter(p => (Date.now() - new Date(p.created_at).getTime()) / 86400000 <= 7).length} posts
//             </span>
//           </div>
//           {loading ? (
//             <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
//               {Array.from({length:7}).map((_,i) => (
//                 <div key={i} style={{ flex:1, height:`${30 + Math.random()*60}%`, borderRadius:'4px 4px 0 0', background:C.bg3 }} />
//               ))}
//             </div>
//           ) : (
//             <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
//               {weeklyBuckets.map((d, i) => (
//                 <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5, height:'100%' }}>
//                   <div style={{ flex:1, display:'flex', alignItems:'flex-end', width:'100%' }}>
//                     <div className="an-bar" title={`${d.count} post${d.count!==1?'s':''}`} style={{
//                       width:'100%', borderRadius:'4px 4px 0 0', minHeight:4, transition:'all 0.3s',
//                       height: d.count === 0 ? '4px' : `${(d.count/maxBucket)*100}%`,
//                       background: d.count === 0
//                         ? C.bg3
//                         : 'linear-gradient(to top,rgba(99,179,237,0.45),rgba(99,179,237,0.15))',
//                       border: d.count === 0 ? `1px solid ${C.border}` : '1px solid rgba(99,179,237,0.25)',
//                       borderBottom:'none',
//                     }} />
//                   </div>
//                   <div style={{ fontSize:9, color:C.text3, fontFamily:'monospace' }}>{d.day.slice(0,3)}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div style={card}>
//           <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Recent Activity</div>
//           {loading ? (
//             Array.from({length:4}).map((_,i) => (
//               <div key={i} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
//                 <div style={{ width:8, height:8, borderRadius:'50%', background:C.bg3, flexShrink:0, marginTop:4 }} />
//                 <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
//                   <Skeleton h={12} w="90%" />
//                   <Skeleton h={9} w="40%" />
//                 </div>
//               </div>
//             ))
//           ) : activityFeed.length === 0 ? (
//             <div style={{ textAlign:'center', padding:'30px 0', color:C.text3, fontSize:13 }}>
//               No activity yet — upload your first video!
//             </div>
//           ) : (
//             activityFeed.map((a, i) => (
//               <div key={i} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom: i < activityFeed.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
//                 <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, flexShrink:0, marginTop:4 }} />
//                 <div style={{ flex:1 }}>
//                   <div style={{ fontSize:12, color:C.text2, lineHeight:1.5 }}>{a.text}</div>
//                   <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginTop:2 }}>{a.time}</div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* ── Recent posts + Platform status ───────────────────────────────── */}
//       <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

//         <div style={card}>
//           <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
//             <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Recent Posts</div>
//             <button className="ghost-btn" onClick={() => navigate('/analytics')} style={{
//               padding:'4px 10px', borderRadius:7, border:`1px solid ${C.border}`,
//               background:'transparent', color:C.text2, fontSize:11, fontWeight:600,
//               cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
//             }}>
//               View all →
//             </button>
//           </div>

//           {loading ? (
//             <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
//               {Array.from({length:4}).map((_,i) => <Skeleton key={i} h={36} r={8} />)}
//             </div>
//           ) : posts.length === 0 ? (
//             <div style={{ textAlign:'center', padding:'30px 0', color:C.text3, fontSize:13 }}>
//               No posts yet —{' '}
//               <span style={{ color:C.accent, cursor:'pointer' }} onClick={() => navigate('/upload')}>
//                 upload your first video
//               </span>
//             </div>
//           ) : (
//             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
//               <thead>
//                 <tr>{['Platform','Title','Status','Date'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
//               </thead>
//               <tbody>
//                 {posts.slice(0,5).map(p => (
//                   <tr key={p.id} className="an-row">
//                     <td style={TD}><PlatBadge platform={p.platform} /></td>
//                     <td style={{ ...TD, color:C.text, fontWeight:500, maxWidth:160, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.title}</td>
//                     <td style={TD}><StatusBadge status={p.status} /></td>
//                     <td style={{ ...TD, fontFamily:'monospace', fontSize:11, color:C.text3 }}>{formatDate(p.created_at)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Platform status */}
//         <div style={card}>
//           <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
//             <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Connected Platforms</div>
//             <span style={{ fontSize:10, color:C.accent2, fontFamily:'monospace', padding:'2px 8px', borderRadius:20, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)' }}>
//               {integrations.length} / 3 live
//             </span>
//           </div>

//           <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
//             {platformStatus.map((p, i) => {
//               const s = PLAT_STYLE[p.name]
//               const platPosts = posts.filter(post => post.platform === p.name)
//               return (
//                 <div key={i} className="plat-row" style={{
//                   display:'flex', alignItems:'center', gap:12, padding:'11px 13px',
//                   borderRadius:10, transition:'all 0.15s',
//                   border:`1px solid ${p.connected ? `${s.color}30` : C.border}`,
//                   background: p.connected ? `${s.color}05` : 'transparent',
//                 }}>
//                   <div style={{ width:36, height:36, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, background:`${s.color}12`, border:`1px solid ${s.color}20` }}>
//                     {s.icon}
//                   </div>
//                   <div style={{ flex:1, minWidth:0 }}>
//                     <div style={{ fontSize:13, fontWeight:600, color: p.connected ? s.color : C.text2 }}>{s.label}</div>
//                     <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginTop:2 }}>
//                       {p.connected
//                         ? `${platPosts.length} post${platPosts.length!==1?'s':''} · ${p.growth}`
//                         : 'Not connected'}
//                     </div>
//                   </div>
//                   {p.connected ? (
//                     <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, fontFamily:'monospace', color:C.accent2, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', flexShrink:0 }}>
//                       Live
//                     </span>
//                   ) : (
//                     <button className="connect-btn" onClick={() => navigate('/settings')} style={{
//                       padding:'5px 11px', borderRadius:7, border:`1px solid ${C.border}`,
//                       background:'transparent', color:C.text2, fontSize:11, fontWeight:600,
//                       cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', flexShrink:0,
//                     }}>
//                       Connect
//                     </button>
//                   )}
//                 </div>
//               )
//             })}
//           </div>

//           {/* Plan nudge */}
//           <div style={{ padding:'12px 14px', borderRadius:10, background:'linear-gradient(135deg,rgba(99,179,237,0.06),rgba(167,139,250,0.04))', border:'1px solid rgba(99,179,237,0.15)' }}>
//             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//               <div>
//                 <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:2 }}>Free Plan</div>
//                 <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace' }}>50 AI generations · 3 platforms</div>
//               </div>
//               <button onClick={() => navigate('/settings')} style={{
//                 padding:'6px 14px', borderRadius:8,
//                 background:'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(167,139,250,0.15))',
//                 border:'1px solid rgba(99,179,237,0.3)', color:C.accent,
//                 fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
//               }}>
//                 Upgrade ⚡
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/api'

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Platform = 'instagram' | 'youtube' | 'twitter'
type Status   = 'published' | 'scheduled' | 'draft'

interface ContentRow {
  id: string
  title: string
  platform: Platform
  status: Status
  created_at: string
  scheduled_at: string | null
  published_at: string | null
  caption: string | null
  hashtags: string[] | null
}

interface AnalyticsSummary {
  total: number
  published: number
  scheduled: number
  drafts: number
  byPlatform: Record<string, number>
  weeklyActivity: { day:string; count:number }[]
}

interface MetricsSummary {
  totals:         { views:number; likes:number; comments:number; shares:number }
  byPlatform:     Record<string, { views:number; likes:number; comments:number; shares:number; posts:number }>
  engagementRate: string
  totalPosts:     number
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg2:'#0d1225', bg3:'#111827',
  border:'rgba(255,255,255,0.06)',
  text:'#e8edf5', text2:'#8892a4', text3:'#4f5a6e',
  accent:'#63b3ed', accent2:'#4ade80', accent3:'#f59e0b', accent4:'#a78bfa', danger:'#f87171',
}

type PlatKey = 'instagram' | 'youtube' | 'twitter'
const PLAT_STYLE: Record<PlatKey, { color:string; bg:string; border:string; icon:string; label:string }> = {
  instagram: { color:C.accent4, bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)', icon:'📸', label:'Instagram' },
  youtube:   { color:C.danger,  bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)', icon:'▶️', label:'YouTube'   },
  twitter:   { color:'#38bdf8', bg:'rgba(56,189,248,0.1)',  border:'rgba(56,189,248,0.3)',  icon:'𝕏',  label:'Twitter'   },
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function PlatBadge({ platform }: { platform: Platform }) {
  const s = PLAT_STYLE[platform] ?? PLAT_STYLE.instagram
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{s.label}</span>
}
function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{status}</span>
}
function ProgressBar({ pct, color }: { pct:number; color:string }) {
  return (
    <div style={{ height:3, background:C.bg3, borderRadius:2, overflow:'hidden', marginTop:9 }}>
      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, borderRadius:2, background:color, transition:'width 0.6s ease' }} />
    </div>
  )
}
function Skeleton({ w = '100%', h = 16, r = 6 }: { w?: string|number; h?: number; r?: number }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:`linear-gradient(90deg, ${C.bg2}, ${C.bg3}, ${C.bg2})`, backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function DashboardSection() {
  const navigate = useNavigate()

  const [posts,        setPosts]        = useState<ContentRow[]>([])
  const [summary,      setSummary]      = useState<AnalyticsSummary | null>(null)
  const [metrics,      setMetrics]      = useState<MetricsSummary | null>(null)
  const [integrations, setIntegrations] = useState<string[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  // ── Toast System for Reminders
  const [inlineToasts, setInlineToasts] = useState<{ id: number; msg: string; type: string }[]>([])
  const toast = (msg: string, type = 'info') => {
    const id = Date.now()
    setInlineToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setInlineToasts(t => t.filter(x => x.id !== id)), 6000) // 6 second display
  }

  const notifiedPosts = useRef<Set<string>>(new Set()) // Tracks which posts we've already alerted about

  useEffect(() => {
    async function fetchData() {
      setLoading(true); setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const contentPromise = supabase
          .from('content')
          .select('id, title, platform, status, created_at, scheduled_at, published_at, caption, hashtags')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        const integrationsPromise = supabase
          .from('user_integrations')
          .select('platform')
          .eq('user_id', user.id)

        const [contentRes, integrationsRes, summaryRes, metricsRes] = await Promise.all([
          contentPromise,
          integrationsPromise,
          apiFetch('/api/analytics/summary'),
          apiFetch('/api/metrics/summary')
        ])

        if (contentRes.error) throw contentRes.error
        if (integrationsRes.error) throw integrationsRes.error

        setPosts((contentRes.data as ContentRow[]) ?? [])
        setIntegrations(integrationsRes.data?.map(i => i.platform) ?? [])
        setSummary(summaryRes)
        setMetrics(metricsRes)

      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // ─── THE SMART REMINDER SYSTEM ──────────────────────────────────────────────
  useEffect(() => {
    if (posts.length === 0) return;

    const intervalId = setInterval(() => {
      const now = new Date();

      posts.forEach(post => {
        if (post.status === 'scheduled' && post.scheduled_at) {
          const scheduledTime = new Date(post.scheduled_at);
          
          // If time passed AND we haven't alerted for this post yet
          if (now >= scheduledTime && !notifiedPosts.current.has(post.id)) {
            notifiedPosts.current.add(post.id); // Mark as notified
            
            toast(`⏰ REMINDER: Time to publish "${post.title}" to ${post.platform}!`, 'info');
            
            // Optional: Play a tiny browser beep
            // const audio = new Audio('/notification-sound.mp3'); 
            // audio.play().catch(e => console.log('Audio blocked'));
          }
        }
      });
    }, 15000); // Checks every 15 seconds to be snappy for your presentation!

    return () => clearInterval(intervalId);
  }, [posts]);

  // ── Derived stats 
  const totalPosts = summary?.total ?? posts.length
  const published  = summary?.published ?? posts.filter(p => p.status === 'published').length
  const scheduled  = summary?.scheduled ?? posts.filter(p => p.status === 'scheduled').length
  const drafts     = summary?.drafts ?? posts.filter(p => p.status === 'draft').length

  const weeklyBuckets = summary?.weeklyActivity ?? (() => {
    const days: Record<string, number> = {}
    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    labels.forEach(d => { days[d] = 0 })
    const now = Date.now()
    posts.forEach(p => {
      const age = (now - new Date(p.created_at).getTime()) / 86400000
      if (age <= 7) {
        const label = labels[new Date(p.created_at).getDay()]
        days[label] = (days[label] ?? 0) + 1
      }
    })
    return labels.map(d => ({ day: d, count: days[d] }))
  })()
  
  const maxBucket = Math.max(...weeklyBuckets.map(b => b.count), 1)

  const platformStatus = (['instagram', 'youtube', 'twitter'] as PlatKey[]).map(plat => {
    const isConnected = integrations.includes(plat);
    const m = metrics?.byPlatform?.[plat];
    return {
      name: plat,
      connected: isConnected,
      followers: isConnected && m ? `${(m.views / 2.5).toFixed(1)}K` : (isConnected ? 'Active' : '—'), 
      growth: isConnected && m ? `+${(m.likes / 100).toFixed(1)}%` : '—'
    }
  });

  const activityFeed = posts.slice(0, 5).map(p => {
    const plat = PLAT_STYLE[p.platform] ?? PLAT_STYLE.instagram
    const action =
      p.status === 'published' ? `Published "${p.title}" on ${plat.label}` :
      p.status === 'scheduled' ? `Scheduled "${p.title}" for ${p.scheduled_at ? formatDate(p.scheduled_at) : 'later'}` :
      `Draft saved: "${p.title}"`
    return { color: plat.color, text: action, time: formatDate(p.created_at) }
  })

  const KPI = [
    { label:'Total Posts',     value: loading ? '—' : totalPosts.toString(),   sub:'In your library',    color:C.accent,  pct: Math.min((totalPosts / 10) * 100, 100) },
    { label:'Published',       value: loading ? '—' : published.toString(),    sub:'Live content',       color:C.accent2, pct: totalPosts > 0 ? (published / totalPosts) * 100 : 0 },
    { label:'Scheduled',       value: loading ? '—' : scheduled.toString(),    sub:'Queued to publish',  color:C.accent3, pct: totalPosts > 0 ? (scheduled / totalPosts) * 100 : 0 },
    { label:'Drafts',          value: loading ? '—' : drafts.toString(),       sub:'Work in progress',   color:C.accent4, pct: totalPosts > 0 ? (drafts / totalPosts) * 100 : 0 },
  ]

  const QUICK_ACTIONS = [
    { icon:'📤', label:'Upload Video',  desc:'Add new content',    path:'/upload'    },
    { icon:'📅', label:'Schedule Post', desc:'Plan your calendar',  path:'/schedule'  },
    { icon:'📊', label:'View Analytics',desc:'Track performance',   path:'/analytics' },
    { icon:'⚙️', label:'Settings',      desc:'Manage integrations', path:'/settings'  },
  ]

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes slideIn { from { transform:translateX(16px); opacity:0 } to { transform:translateX(0); opacity:1 } }
        .qa-card:hover     { transform:translateY(-2px); border-color:rgba(99,179,237,0.3) !important; box-shadow:0 0 20px rgba(99,179,237,0.08) !important; }
        .an-bar:hover      { background:linear-gradient(to top,rgba(99,179,237,0.75),rgba(99,179,237,0.35)) !important; }
        .an-row:hover td   { background:rgba(255,255,255,0.02); }
        .plat-row:hover    { border-color:rgba(99,179,237,0.25) !important; }
        .ghost-btn:hover   { color:#e8edf5 !important; border-color:rgba(255,255,255,0.14) !important; }
        .connect-btn:hover { color:#63b3ed !important; border-color:rgba(99,179,237,0.45) !important; }
        
        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 768px) {
          .mobile-col-1 { grid-template-columns: 1fr !important; }
          .mobile-col-2 { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .mobile-stack { flex-direction: column !important; }
        }
      `}</style>

      {/* ── Toasts for Reminders ─────────────────────────────────────────── */}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, display:'flex', flexDirection:'column', gap:8 }}>
        {inlineToasts.map(t => (
          <div key={t.id} style={{
            padding:'14px 20px', borderRadius:10, fontSize:13, fontWeight:600,
            border:'1px solid', animation:'slideIn 0.3s ease', maxWidth:320,
            background: 'rgba(99,179,237,0.15)',
            borderColor: 'rgba(99,179,237,0.4)',
            color: '#63b3ed',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)'
          }}>
            {t.msg}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:9, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', color:C.danger, fontSize:12, fontFamily:'monospace' }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <div className="mobile-col-2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
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
      <div className="mobile-col-2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {KPI.map((k, i) => (
          <div key={i} style={{ ...card, borderColor:`${k.color}20` }}>
            <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.06em', fontFamily:'monospace', textTransform:'uppercase', marginBottom:8 }}>{k.label}</div>
            {loading
              ? <><Skeleton h={28} w="50%" /><div style={{marginTop:6}}/><Skeleton h={10} w="70%" /></>
              : <>
                  <div style={{ fontSize:26, fontWeight:800, color:k.color, letterSpacing:'-0.02em', marginBottom:2 }}>{k.value}</div>
                  <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginBottom:3 }}>{k.sub}</div>
                </>
            }
            <ProgressBar pct={k.pct} color={`linear-gradient(90deg,${k.color}90,${k.color}30)`} />
          </div>
        ))}
      </div>

      {/* ── Chart + Activity ─────────────────────────────────────────────── */}
      <div className="mobile-col-1" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        <div style={card}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2 }}>Posts This Week</div>
              <div style={{ fontSize:11, color:C.text3, fontFamily:'monospace' }}>Content created in the last 7 days</div>
            </div>
            <span style={{ fontSize:11, color:C.accent2, fontFamily:'monospace', fontWeight:600 }}>
              {posts.filter(p => (Date.now() - new Date(p.created_at).getTime()) / 86400000 <= 7).length} posts
            </span>
          </div>
          {loading ? (
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
              {Array.from({length:7}).map((_,i) => (
                <div key={i} style={{ flex:1, height:`${30 + Math.random()*60}%`, borderRadius:'4px 4px 0 0', background:C.bg3 }} />
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
              {weeklyBuckets.map((d, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5, height:'100%' }}>
                  <div style={{ flex:1, display:'flex', alignItems:'flex-end', width:'100%' }}>
                    <div className="an-bar" title={`${d.count} post${d.count!==1?'s':''}`} style={{
                      width:'100%', borderRadius:'4px 4px 0 0', minHeight:4, transition:'all 0.3s',
                      height: d.count === 0 ? '4px' : `${(d.count/maxBucket)*100}%`,
                      background: d.count === 0
                        ? C.bg3
                        : 'linear-gradient(to top,rgba(99,179,237,0.45),rgba(99,179,237,0.15))',
                      border: d.count === 0 ? `1px solid ${C.border}` : '1px solid rgba(99,179,237,0.25)',
                      borderBottom:'none',
                    }} />
                  </div>
                  <div style={{ fontSize:9, color:C.text3, fontFamily:'monospace' }}>{d.day.slice(0,3)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Recent Activity</div>
          {loading ? (
            Array.from({length:4}).map((_,i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:C.bg3, flexShrink:0, marginTop:4 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
                  <Skeleton h={12} w="90%" />
                  <Skeleton h={9} w="40%" />
                </div>
              </div>
            ))
          ) : activityFeed.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:C.text3, fontSize:13 }}>
              No activity yet — upload your first video!
            </div>
          ) : (
            activityFeed.map((a, i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom: i < activityFeed.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, flexShrink:0, marginTop:4 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:C.text2, lineHeight:1.5 }}>{a.text}</div>
                  <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginTop:2 }}>{a.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Recent posts + Platform status ───────────────────────────────── */}
      <div className="mobile-col-1" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

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

          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {Array.from({length:4}).map((_,i) => <Skeleton key={i} h={36} r={8} />)}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:C.text3, fontSize:13 }}>
              No posts yet —{' '}
              <span style={{ color:C.accent, cursor:'pointer' }} onClick={() => navigate('/upload')}>
                upload your first video
              </span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>{['Platform','Title','Status','Date'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {posts.slice(0,5).map(p => (
                    <tr key={p.id} className="an-row">
                      <td style={TD}><PlatBadge platform={p.platform} /></td>
                      <td style={{ ...TD, color:C.text, fontWeight:500, maxWidth:160, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.title}</td>
                      <td style={TD}><StatusBadge status={p.status} /></td>
                      <td style={{ ...TD, fontFamily:'monospace', fontSize:11, color:C.text3 }}>{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Platform status */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Connected Platforms</div>
            <span style={{ fontSize:10, color:C.accent2, fontFamily:'monospace', padding:'2px 8px', borderRadius:20, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)' }}>
              {integrations.length} / 3 live
            </span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
            {platformStatus.map((p, i) => {
              const s = PLAT_STYLE[p.name]
              const platPosts = posts.filter(post => post.platform === p.name)
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
                    <div style={{ fontSize:13, fontWeight:600, color: p.connected ? s.color : C.text2 }}>{s.label}</div>
                    <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginTop:2 }}>
                      {p.connected
                        ? `${platPosts.length} post${platPosts.length!==1?'s':''} · ${p.growth}`
                        : 'Not connected'}
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
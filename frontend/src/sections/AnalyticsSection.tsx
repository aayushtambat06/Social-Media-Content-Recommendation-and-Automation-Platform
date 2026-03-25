import { useEffect, useState } from 'react'
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
  hashtags: string[] | null
}

interface MetricsSummary {
  totals:         { views:number; likes:number; comments:number; shares:number }
  byPlatform:     Record<string, { views:number; likes:number; comments:number; shares:number; posts:number }>
  engagementRate: string
  totalPosts:     number
}

interface MetricsRow {
  id: string
  platform: string
  views: number
  likes: number
  comments: number
  shares: number
  fetched_at: string
  content: { id:string; title:string; platform:string; status:string; created_at:string } | null
}

interface AnalyticsSummary {
  total: number
  published: number
  scheduled: number
  drafts: number
  byPlatform: Record<string, number>
  weeklyActivity: { day:string; count:number }[]
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg2:'#0d1225', bg3:'#111827',
  border:'rgba(255,255,255,0.06)',
  text:'#e8edf5', text2:'#8892a4', text3:'#4f5a6e',
  accent:'#63b3ed', accent2:'#4ade80', accent3:'#f59e0b', accent4:'#a78bfa', danger:'#f87171',
}

const PLAT_STYLE: Record<Platform, { color:string; bg:string; border:string; label:string }> = {
  instagram: { color:C.accent4, bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)', label:'Instagram' },
  youtube:   { color:C.danger,  bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)', label:'YouTube'   },
  twitter:   { color:'#38bdf8', bg:'rgba(56,189,248,0.1)',  border:'rgba(56,189,248,0.3)',  label:'Twitter'   },
}
const STATUS_STYLE: Record<Status, { color:string; bg:string; border:string }> = {
  published: { color:C.accent2, bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)'  },
  scheduled: { color:C.accent3, bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)'  },
  draft:     { color:C.accent,  bg:'rgba(99,179,237,0.1)',  border:'rgba(99,179,237,0.3)'  },
}

const BEST_TIMES = [
  { day:'Monday',   slots:[{ time:'7–9 PM',      score:92 }],                               platform:'Twitter'           },
  { day:'Tuesday',  slots:[{ time:'6–8 PM',      score:96 }],                               platform:'Instagram'         },
  { day:'Thursday', slots:[{ time:'2–4 PM',      score:88 }],                               platform:'YouTube'           },
  { day:'Friday',   slots:[{ time:'12–2 PM',     score:91 }, { time:'9–11 PM', score:85 }], platform:'Instagram / Twitter' },
  { day:'Saturday', slots:[{ time:'10 AM–12 PM', score:87 }],                               platform:'YouTube'           },
  { day:'Sunday',   slots:[{ time:'8–10 AM',     score:82 }],                               platform:'Instagram'         },
]

const HEATMAP = Array.from({length:8}, (_,h) =>
  Array.from({length:7}, (_,d) => 0.1 + ((h*7+d+h*d) % 17) / 17 * 0.9)
)

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

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function PlatBadge({ platform }: { platform: string }) {
  const s = PLAT_STYLE[platform as Platform] ?? PLAT_STYLE.instagram
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{s.label}</span>
}
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status as Status] ?? STATUS_STYLE.draft
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, letterSpacing:'0.05em', fontFamily:'monospace', color:s.color, background:s.bg, border:`1px solid ${s.border}` }}>{status}</span>
}
function Bar({ pct, color }: { pct:number; color:string }) {
  return (
    <div style={{ height:4, background:C.bg3, borderRadius:2, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, borderRadius:2, background:color, transition:'width 0.5s ease' }} />
    </div>
  )
}
function Skeleton({ w='100%', h=16, r=6 }: { w?:string|number; h?:number; r?:number }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:`linear-gradient(90deg,${C.bg2},${C.bg3},${C.bg2})`, backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export function AnalyticsSection() {
  
  const [tab,      setTab]      = useState<'overview'|'posts'|'best times'>('overview')
  const [platform, setPlatform] = useState<Platform|'all'>('all')

  // Content data (from Supabase directly)
  const [posts,    setPosts]    = useState<ContentRow[]>([])
  const [summary,  setSummary]  = useState<AnalyticsSummary | null>(null)

  // Metrics data (from backend)
  const [metrics,        setMetrics]        = useState<MetricsSummary | null>(null)
  const [metricsRows,    setMetricsRows]     = useState<MetricsRow[]>([])
  const [loading,        setLoading]         = useState(true)
  const [seeding,        setSeeding]         = useState(false)
  const [error,          setError]           = useState<string | null>(null)

  console.log('API URL:', import.meta.env.VITE_API_URL)
  useEffect(() => { fetchAll() }, [])
  

  // async function getToken() {
  //   const { data: { session } } = await supabase.auth.getSession()
  //   if (!session?.access_token) throw new Error('Not authenticated')
  //   return session.access_token
  // }

  async function fetchAll() {
    setLoading(true); setError(null)
    try {
      // Content — still fetched directly from Supabase
      const contentRes = await supabase
        .from('content')
        .select('id,title,platform,status,created_at,scheduled_at,hashtags')
        .order('created_at', { ascending: false })
  
      if (contentRes.error) throw contentRes.error
      setPosts((contentRes.data as ContentRow[]) ?? [])
  
      // Metrics + analytics — fetched from backend via apiFetch
      const [summaryRes, metricsRes, metricsRowsRes] = await Promise.all([
        apiFetch('/api/analytics/summary'),
        apiFetch('/api/metrics/summary'),
        apiFetch('/api/metrics'),
      ])
  
      setSummary(summaryRes)
      setMetrics(metricsRes)
      setMetricsRows(metricsRowsRes.data ?? [])
  
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics')
    }
    setLoading(false)
  }

  async function seedMetrics() {
    setSeeding(true)
    try {
      await apiFetch('/api/metrics/seed', { method: 'POST' })
      await fetchAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Seeding failed')
    }
    setSeeding(false)
  }

  // ── Derived values
  const totalContent  = summary?.total ?? posts.length
  const published     = summary?.published ?? posts.filter(p => p.status==='published').length
  const scheduled     = summary?.scheduled ?? posts.filter(p => p.status==='scheduled').length
  const drafts        = summary?.drafts    ?? posts.filter(p => p.status==='draft').length
  const weeklyBuckets = summary?.weeklyActivity ?? []
  const maxBucket     = Math.max(...(weeklyBuckets.map(b => b.count) ?? [1]), 1)

  const hasMetrics    = metricsRows.length > 0

  // Platform breakdown from metrics or content
  const platformBreakdown = (['instagram','youtube','twitter'] as Platform[]).map(p => {
    const fromMetrics  = metrics?.byPlatform?.[p]
    const contentCount = posts.filter(x => x.platform === p).length
    return {
      name:     p,
      views:    fromMetrics?.views ?? 0,
      likes:    fromMetrics?.likes ?? 0,
      count:    fromMetrics?.posts ?? contentCount,
      pct:      totalContent > 0 ? Math.round((contentCount / totalContent) * 100) : 0,
    }
  })

  const KPI = [
    { label:'Total Views',    value: hasMetrics ? (metrics?.totals.views ?? 0).toLocaleString()    : totalContent.toString(), icon:'👁',  color:C.accent,  pct: hasMetrics ? 72 : Math.min((totalContent/10)*100,100),  sub: hasMetrics ? 'Across all platforms' : 'Total posts' },
    { label:'Total Likes',    value: hasMetrics ? (metrics?.totals.likes ?? 0).toLocaleString()    : published.toString(),    icon:'❤️', color:C.accent4, pct: hasMetrics ? 81 : totalContent>0?(published/totalContent)*100:0, sub: hasMetrics ? 'Across all platforms' : 'Published' },
    { label:'Comments',       value: hasMetrics ? (metrics?.totals.comments ?? 0).toLocaleString() : scheduled.toString(),    icon:'💬',  color:C.accent2, pct: hasMetrics ? 55 : totalContent>0?(scheduled/totalContent)*100:0, sub: hasMetrics ? 'Across all platforms' : 'Scheduled' },
    { label:'Engagement Rate',value: hasMetrics ? `${metrics?.engagementRate ?? 0}%`               : `${drafts}`,             icon:'📈',  color:C.accent3, pct: hasMetrics ? 62 : totalContent>0?(drafts/totalContent)*100:0,    sub: hasMetrics ? 'Likes + comments / views' : 'Drafts' },
  ]

  const filteredPosts = platform === 'all' ? posts : posts.filter(p => p.platform === platform)

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .an-tab:hover  { color:#e8edf5 !important; }
        .an-bar:hover  { background:linear-gradient(to top,rgba(99,179,237,0.75),rgba(99,179,237,0.35)) !important; }
        .an-row:hover td { background:rgba(255,255,255,0.025); }
        .an-cell:hover { opacity:0.75; }
        .seed-btn:hover { box-shadow:0 0 20px rgba(99,179,237,0.15); border-color:rgba(99,179,237,0.55) !important; }
        select option  { background:#0d1225; color:#e8edf5; }
      `}</style>

      {/* Error banner */}
      {error && (
        <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:9, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', color:C.danger, fontSize:12, fontFamily:'monospace' }}>
          ⚠ {error}
        </div>
      )}

      {/* Seed metrics banner — shown when no metrics yet */}
      {!loading && !hasMetrics && posts.some(p => p.status==='published') && (
        <div style={{ marginBottom:16, padding:'14px 16px', borderRadius:10, background:'linear-gradient(135deg,rgba(99,179,237,0.07),rgba(167,139,250,0.04))', border:'1px solid rgba(99,179,237,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:2 }}>No metrics yet</div>
            <div style={{ fontSize:11, color:C.text3, fontFamily:'monospace' }}>Seed test data to see analytics in action — swap for real platform APIs later</div>
          </div>
          <button className="seed-btn" onClick={seedMetrics} disabled={seeding} style={{
            padding:'8px 16px', borderRadius:8, flexShrink:0,
            background:'linear-gradient(135deg,rgba(99,179,237,0.18),rgba(99,179,237,0.08))',
            border:'1px solid rgba(99,179,237,0.35)', color:C.accent,
            fontSize:12, fontWeight:600, cursor: seeding ? 'not-allowed' : 'pointer',
            fontFamily:'inherit', transition:'all 0.15s', opacity: seeding ? 0.6 : 1,
          }}>
            {seeding ? 'Seeding…' : '⚡ Seed Test Metrics'}
          </button>
        </div>
      )}

      {/* Refresh metrics button — shown when metrics exist */}
      {!loading && hasMetrics && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
          <button className="seed-btn" onClick={seedMetrics} disabled={seeding} style={{
            padding:'6px 14px', borderRadius:8,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`,
            color:C.text2, fontSize:11, fontWeight:600,
            cursor: seeding ? 'not-allowed' : 'pointer',
            fontFamily:'inherit', transition:'all 0.15s',
          }}>
            {seeding ? 'Refreshing…' : '↻ Refresh Metrics'}
          </button>
        </div>
      )}

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

      {/* ══ OVERVIEW ═══════════════════════════════════════════════════════ */}
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
                {loading
                  ? <><Skeleton h={26} w="40%" /><div style={{marginTop:6}}/><Skeleton h={4} /></>
                  : <>
                      <div style={{ fontSize:26, fontWeight:800, color:k.color, letterSpacing:'-0.02em', marginBottom:3 }}>{k.value}</div>
                      <div style={{ fontSize:10, color:C.text3, fontFamily:'monospace', marginBottom:8 }}>{k.sub}</div>
                      <Bar pct={k.pct} color={`linear-gradient(90deg,${k.color}90,${k.color}30)`} />
                    </>
                }
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            {/* Weekly chart */}
            <div style={card}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:2 }}>Posts This Week</div>
              <div style={{ fontSize:11, color:C.text3, fontFamily:'monospace', marginBottom:14 }}>Content created in the last 7 days</div>
              {loading ? (
                <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
                  {Array.from({length:7}).map((_,i) => <div key={i} style={{ flex:1, height:'40%', borderRadius:'4px 4px 0 0', background:C.bg3 }} />)}
                </div>
              ) : (
                <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
                  {weeklyBuckets.map((d, i) => (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5, height:'100%' }}>
                      <div style={{ flex:1, display:'flex', alignItems:'flex-end', width:'100%' }}>
                        <div className="an-bar" title={`${d.count} post${d.count!==1?'s':''}`} style={{
                          width:'100%', borderRadius:'4px 4px 0 0', minHeight:4,
                          height: d.count===0 ? '4px' : `${(d.count/maxBucket)*100}%`,
                          background: d.count===0 ? C.bg3 : 'linear-gradient(to top,rgba(99,179,237,0.45),rgba(99,179,237,0.15))',
                          border: d.count===0 ? `1px solid ${C.border}` : '1px solid rgba(99,179,237,0.25)',
                          borderBottom:'none', transition:'all 0.3s',
                        }} />
                      </div>
                      <div style={{ fontSize:9, color:C.text3, fontFamily:'monospace' }}>{d.day.slice(0,3)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Platform breakdown */}
            <div style={card}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:18 }}>Platform Breakdown</div>
              {loading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[1,2,3].map(i => <Skeleton key={i} h={32} r={8} />)}
                </div>
              ) : totalContent === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0', color:C.text3, fontSize:13 }}>No posts yet</div>
              ) : (
                platformBreakdown.map((p, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:PLAT_STYLE[p.name].color }}>{PLAT_STYLE[p.name].label}</span>
                      <span style={{ fontSize:11, color:C.text3, fontFamily:'monospace' }}>
                        {hasMetrics ? `${p.views.toLocaleString()} views · ` : ''}{p.count} post{p.count!==1?'s':''}
                      </span>
                    </div>
                    <Bar pct={p.pct} color={`linear-gradient(90deg,${PLAT_STYLE[p.name].color}80,${PLAT_STYLE[p.name].color}30)`} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Content by status */}
          <div style={card}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Content Overview</div>
            {loading ? <Skeleton h={60} /> : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                {[
                  { label:'Total',     count:totalContent, color:C.accent,  bg:'rgba(99,179,237,0.08)',  border:'rgba(99,179,237,0.2)'  },
                  { label:'Published', count:published,    color:C.accent2, bg:'rgba(74,222,128,0.08)',  border:'rgba(74,222,128,0.2)'  },
                  { label:'Scheduled', count:scheduled,    color:C.accent3, bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.2)'  },
                  { label:'Draft',     count:drafts,       color:C.accent4, bg:'rgba(167,139,250,0.08)', border:'rgba(167,139,250,0.2)' },
                ].map((s, i) => (
                  <div key={i} style={{ padding:'14px 16px', borderRadius:10, background:s.bg, border:`1px solid ${s.border}`, textAlign:'center' }}>
                    <div style={{ fontSize:28, fontWeight:800, color:s.color, letterSpacing:'-0.02em' }}>{s.count}</div>
                    <div style={{ fontSize:11, color:C.text3, fontFamily:'monospace', marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ POSTS ══════════════════════════════════════════════════════════ */}
      {tab === 'posts' && (
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
            <div style={{ flex:1, fontSize:14, fontWeight:700, color:C.text }}>
              {hasMetrics ? 'Post Performance' : 'All Posts'}
            </div>
            <select
              style={{ padding:'6px 10px', borderRadius:8, background:C.bg2, border:`1px solid ${C.border}`, color:C.text2, fontSize:12, outline:'none', cursor:'pointer', fontFamily:'inherit' }}
              value={platform}
              onChange={e => setPlatform(e.target.value as Platform|'all')}
            >
              {(['all','instagram','youtube','twitter'] as const).map(p => (
                <option key={p} value={p}>{p==='all' ? 'All Platforms' : PLAT_STYLE[p].label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {Array.from({length:5}).map((_,i) => <Skeleton key={i} h={44} r={8} />)}
            </div>
          ) : hasMetrics ? (
            // Show metrics table when metrics exist
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>{['Platform','Title','Views','Likes','Comments','Shares','Eng. Rate'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {metricsRows
                  .filter(m => platform==='all' || m.platform===platform)
                  .map(m => {
                    const eng = m.views > 0 ? (((m.likes+m.comments)/m.views)*100).toFixed(1) : '—'
                    return (
                      <tr key={m.id} className="an-row">
                        <td style={TD}><PlatBadge platform={m.platform} /></td>
                        <td style={{ ...TD, color:C.text, fontWeight:500, maxWidth:200 }}>{m.content?.title ?? '—'}</td>
                        <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{m.views.toLocaleString()}</td>
                        <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{m.likes.toLocaleString()}</td>
                        <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{m.comments.toLocaleString()}</td>
                        <td style={{ ...TD, fontFamily:'monospace', fontSize:12 }}>{m.shares.toLocaleString()}</td>
                        <td style={TD}><span style={{ fontFamily:'monospace', fontSize:12, color: parseFloat(eng)>5 ? C.accent2 : C.text2 }}>{eng}{eng!=='—'?'%':''}</span></td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          ) : (
            // Show content table when no metrics
            <>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>{['Platform','Title','Status','Hashtags','Date'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredPosts.map(p => (
                    <tr key={p.id} className="an-row">
                      <td style={TD}><PlatBadge platform={p.platform} /></td>
                      <td style={{ ...TD, color:C.text, fontWeight:500, maxWidth:200 }}>{p.title}</td>
                      <td style={TD}><StatusBadge status={p.status} /></td>
                      <td style={{ ...TD, fontFamily:'monospace', fontSize:11, color:C.text3 }}>{p.hashtags?.length ? `${p.hashtags.length} tags` : '—'}</td>
                      <td style={{ ...TD, fontFamily:'monospace', fontSize:11, color:C.text3 }}>{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPosts.length === 0 && <div style={{ textAlign:'center', color:C.text3, padding:'40px 0', fontSize:13 }}>No posts found</div>}
            </>
          )}
        </div>
      )}

      {/* ══ BEST TIMES ═════════════════════════════════════════════════════ */}
      {tab === 'best times' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={card}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>Optimal Posting Windows</div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:20 }}>AI-analyzed from top performing content</div>
            {BEST_TIMES.map((d, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i<BEST_TIMES.length-1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width:64, fontSize:12, fontWeight:600, color:C.text2, flexShrink:0 }}>{d.day}</div>
                <div style={{ flex:1 }}>
                  {d.slots.map((s, j) => (
                    <div key={j} style={{ display:'flex', alignItems:'center', gap:8, marginBottom: j<d.slots.length-1 ? 5 : 0 }}>
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

          <div style={card}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>Audience Activity Heatmap</div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:16 }}>Hourly engagement by day of week</div>
            <div style={{ display:'flex', gap:4, marginBottom:6, paddingLeft:34 }}>
              {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} style={{ flex:1, fontSize:9, color:C.text3, textAlign:'center', fontFamily:'monospace' }}>{d}</div>)}
            </div>
            {HEATMAP.map((row, hour) => (
              <div key={hour} style={{ display:'flex', gap:4, marginBottom:4, alignItems:'center' }}>
                <div style={{ fontSize:9, color:C.text3, fontFamily:'monospace', width:30, flexShrink:0, textAlign:'right', paddingRight:4 }}>{[6,8,10,12,14,16,18,20][hour]}h</div>
                {row.map((v, day) => (
                  <div key={day} className="an-cell" title={`${Math.round(v*100)}% activity`} style={{ flex:1, aspectRatio:'1', borderRadius:3, cursor:'pointer', background:`rgba(99,179,237,${v.toFixed(2)})`, transition:'opacity 0.15s' }} />
                ))}
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14, justifyContent:'center' }}>
              <span style={{ fontSize:9, color:C.text3 }}>Low</span>
              {[0.1,0.3,0.5,0.7,0.9].map((v,i) => <div key={i} style={{ width:14, height:14, borderRadius:3, background:`rgba(99,179,237,${v})` }} />)}
              <span style={{ fontSize:9, color:C.text3 }}>High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

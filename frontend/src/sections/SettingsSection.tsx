// import { useState, useCallback } from 'react'
 
// // ─── TYPES ────────────────────────────────────────────────────────────────────
// type Platform = 'Instagram' | 'YouTube' | 'Twitter'
 
// export interface Profile {
//   name: string
//   handle: string
//   bio: string
// }
 
// interface Toggles {
//   autoHashtags: boolean
//   bestTimeHints: boolean
//   weeklyDigest: boolean
//   autoPublish: boolean
// }
 
// interface Connections {
//   Instagram: boolean
//   YouTube: boolean
//   Twitter: boolean
// }
 
// // ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// const C = {
//   bg2: '#0d1225', bg3: '#111827',
//   border: 'rgba(255,255,255,0.06)',
//   text: '#e8edf5', text2: '#8892a4', text3: '#4f5a6e',
//   accent: '#63b3ed', accent2: '#4ade80', accent3: '#f59e0b', accent4: '#a78bfa', danger: '#f87171',
// }
 
// const PLAT_META: Record<Platform, { color: string; bg: string; border: string; icon: string; desc: string }> = {
//   Instagram: { color: C.accent4, bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', icon: '📸', desc: 'Reels, Stories, Posts' },
//   YouTube:   { color: C.danger,  bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', icon: '▶️', desc: 'Shorts, Videos'       },
//   Twitter:   { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)',  icon: '𝕏',  desc: 'Tweets, Threads'      },
// }
 
// const card: React.CSSProperties = {
//   background: 'linear-gradient(135deg, rgba(13,18,37,0.95), rgba(8,12,24,0.98))',
//   border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
// }
// const baseInput: React.CSSProperties = {
//   width: '100%', padding: '9px 13px', borderRadius: 9,
//   background: 'rgba(8,12,24,0.85)', border: '1px solid rgba(255,255,255,0.07)',
//   color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
//   boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
// }
// const lbl: React.CSSProperties = {
//   display: 'block', fontSize: 10, fontWeight: 600, color: C.text2,
//   letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'monospace', textTransform: 'uppercase',
// }
 
// // ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
// function ToggleSwitch({ on, label, desc, onToggle, last = false }: {
//   on: boolean; label: string; desc: string; onToggle: () => void; last?: boolean
// }) {
//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//       padding: '13px 0',
//       borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
//     }}>
//       <div style={{ flex: 1 }}>
//         <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
//         <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{desc}</div>
//       </div>
//       <div onClick={onToggle} style={{
//         width: 38, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
//         position: 'relative', transition: 'background 0.2s', marginLeft: 16,
//         background: on ? 'rgba(99,179,237,0.35)' : C.bg3,
//       }}>
//         <div style={{
//           width: 14, height: 14, borderRadius: '50%', position: 'absolute',
//           top: 3, transition: 'left 0.2s, background 0.2s',
//           left: on ? 21 : 3, background: on ? C.accent : C.text3,
//         }} />
//       </div>
//     </div>
//   )
// }
 
// // ─── SETTINGS SECTION ─────────────────────────────────────────────────────────
// export function SettingsSection({
//   savedProfile,
//   onSaveProfile,
//   toast: externalToast,
// }: {
//   savedProfile: Profile
//   onSaveProfile: (p: Profile) => void
//   toast?: (msg: string, type?: 'success' | 'error' | 'info') => void
// }) {
//   const [inlineToasts, setInlineToasts] = useState<{ id: number; msg: string; type: string }[]>([])
//   const inlineToast = useCallback((msg: string, type = 'info') => {
//     const id = Date.now()
//     setInlineToasts(t => [...t, { id, msg, type }])
//     setTimeout(() => setInlineToasts(t => t.filter(x => x.id !== id)), 3200)
//   }, [])
//   const toast = externalToast ?? inlineToast
 
//   const [profile,     setProfile]     = useState<Profile>({ ...savedProfile })
//   const [saved,       setSaved]       = useState(false)
//   const [connections, setConnections] = useState<Connections>({ Instagram: true, YouTube: false, Twitter: false })
//   const [toggles,     setToggles]     = useState<Toggles>({ autoHashtags: true, bestTimeHints: true, weeklyDigest: false, autoPublish: false })
//   const [groqKey,     setGroqKey]     = useState('')
//   const [keyVisible,  setKeyVisible]  = useState(false)
 
//   const handleSaveProfile = () => {
//     if (!profile.name.trim()) { toast('Display name cannot be empty', 'error'); return }
//     onSaveProfile({ ...profile })
//     setSaved(true)
//     setTimeout(() => setSaved(false), 2200)
//     toast('Profile updated!', 'success')
//   }
 
//   const toggleConn = (p: Platform) => {
//     const next = !connections[p]
//     setConnections(c => ({ ...c, [p]: next }))
//     toast(next ? `${p} connected!` : `${p} disconnected`, next ? 'success' : 'info')
//   }
 
//   const connectedCount = Object.values(connections).filter(Boolean).length
 
//   return (
//     <div style={{ animation: 'fadeIn 0.3s ease' }}>
//       <style>{`
//         @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes slideIn { from{transform:translateX(16px);opacity:0} to{transform:translateX(0);opacity:1} }
//         .st-input:focus    { border-color:rgba(99,179,237,0.4) !important; box-shadow:0 0 0 3px rgba(99,179,237,0.07) !important; }
//         .conn-card:hover   { border-color:rgba(99,179,237,0.3) !important; }
//         .conn-live:hover   { border-color:rgba(74,222,128,0.45) !important; }
//         .save-btn:hover    { box-shadow:0 0 22px rgba(99,179,237,0.18); }
//         .ghost-btn:hover   { color:#e8edf5 !important; border-color:rgba(255,255,255,0.14) !important; }
//         .del-btn:hover     { background:rgba(248,113,113,0.12) !important; }
//         select option      { background:#0d1225; color:#e8edf5; }
//       `}</style>
 
//       {/* Inline toasts */}
//       {!externalToast && (
//         <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, display:'flex', flexDirection:'column', gap:8 }}>
//           {inlineToasts.map(t => (
//             <div key={t.id} style={{
//               padding:'10px 16px', borderRadius:10, fontSize:12, fontWeight:500, border:'1px solid',
//               animation:'slideIn 0.25s ease', maxWidth:300,
//               background:  t.type==='success'?'rgba(74,222,128,0.1)' :t.type==='error'?'rgba(248,113,113,0.1)' :'rgba(99,179,237,0.1)',
//               borderColor: t.type==='success'?'rgba(74,222,128,0.3)' :t.type==='error'?'rgba(248,113,113,0.3)' :'rgba(99,179,237,0.3)',
//               color:       t.type==='success'?'#4ade80'               :t.type==='error'?'#f87171'               :'#63b3ed',
//             }}>
//               {t.type==='success'?'✓ ':t.type==='error'?'⚠ ':'ℹ '}{t.msg}
//             </div>
//           ))}
//         </div>
//       )}
 
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
 
//         {/* ══ LEFT ════════════════════════════════════════════════════════════ */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
 
//           {/* Profile */}
//           <div style={card}>
//             <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>Profile</div>
 
//             {/* Avatar preview */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
//               <div style={{
//                 width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
//                 background: 'linear-gradient(135deg, #63b3ed, #a78bfa)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: 22, fontWeight: 700, color: '#05070f',
//               }}>
//                 {(profile.name || 'U')[0].toUpperCase()}
//               </div>
//               <div>
//                 <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{profile.name || 'Your Name'}</div>
//                 <div style={{ fontSize: 12, color: C.accent, fontFamily: 'monospace', marginTop: 2 }}>{profile.handle || '@handle'}</div>
//                 {profile.bio && <div style={{ fontSize: 11, color: C.text3, marginTop: 4, lineHeight: 1.4 }}>{profile.bio}</div>}
//               </div>
//             </div>
 
//             <div style={{ marginBottom: 14 }}>
//               <label style={lbl}>Display Name</label>
//               <input className="st-input" style={baseInput} value={profile.name} placeholder="Your name" onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
//             </div>
 
//             <div style={{ marginBottom: 14 }}>
//               <label style={lbl}>Handle</label>
//               <input className="st-input" style={baseInput} value={profile.handle} placeholder="@yourhandle" onChange={e => setProfile(p => ({ ...p, handle: e.target.value }))} />
//             </div>
 
//             <div style={{ marginBottom: 18 }}>
//               <label style={lbl}>Bio</label>
//               <textarea
//                 className="st-input"
//                 style={{ ...baseInput, resize: 'vertical', minHeight: 68, lineHeight: 1.6 } as React.CSSProperties}
//                 value={profile.bio} rows={3} placeholder="Tell the world what you create…"
//                 onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
//               />
//             </div>
 
//             <button className="save-btn" onClick={handleSaveProfile} style={{
//               width: '100%', padding: '10px 0', borderRadius: 9,
//               fontSize: 13, fontWeight: 600, cursor: 'pointer',
//               fontFamily: 'inherit', display: 'flex', alignItems: 'center',
//               justifyContent: 'center', gap: 7, transition: 'all 0.2s',
//               background: saved ? 'linear-gradient(135deg,rgba(74,222,128,0.2),rgba(74,222,128,0.1))' : 'linear-gradient(135deg,rgba(99,179,237,0.18),rgba(99,179,237,0.08))',
//               border: saved ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(99,179,237,0.35)',
//               color: saved ? C.accent2 : C.accent,
//             }}>
//               {saved ? '✓  Saved!' : 'Save Profile'}
//             </button>
//           </div>
 
//           {/* AI Config */}
//           <div style={card}>
//             <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>AI Configuration</div>
//             <div style={{ fontSize: 11, color: C.text3, marginBottom: 18 }}>Configure your content generation preferences</div>
 
//             <div style={{ marginBottom: 14 }}>
//               <label style={lbl}>Default Tone</label>
//               <select className="st-input" style={{ ...baseInput, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}>
//                 {['Engaging & casual','Professional & informative','Funny & relatable','Inspirational & motivating'].map(t => <option key={t}>{t}</option>)}
//               </select>
//             </div>
 
//             <div style={{ marginBottom: 14 }}>
//               <label style={lbl}>Default Hashtag Count</label>
//               <select className="st-input" style={{ ...baseInput, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}>
//                 {['5–8 (focused)','10–15 (balanced)','20–30 (maximum reach)'].map(t => <option key={t}>{t}</option>)}
//               </select>
//             </div>
 
//             <div style={{ marginBottom: 0 }}>
//               <label style={lbl}>Groq API Key</label>
//               <div style={{ position: 'relative' }}>
//                 <input
//                   className="st-input"
//                   style={{ ...baseInput, paddingRight: 44, fontFamily: keyVisible ? 'inherit' : 'monospace' }}
//                   type={keyVisible ? 'text' : 'password'}
//                   value={groqKey} placeholder="gsk_••••••••••••••••••••"
//                   onChange={e => setGroqKey(e.target.value)}
//                 />
//                 <button onClick={() => setKeyVisible(v => !v)} style={{
//                   position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
//                   background: 'none', border: 'none', cursor: 'pointer', color: C.text3, fontSize: 13, padding: 4,
//                 }}>
//                   {keyVisible ? '🙈' : '👁'}
//                 </button>
//               </div>
//               <div style={{ fontSize: 10, color: C.text3, marginTop: 5, fontFamily: 'monospace' }}>
//                 Or set VITE_GROQ_API_KEY in your .env file
//               </div>
//             </div>
 
//             <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
 
//             <ToggleSwitch on={toggles.autoHashtags} label="Auto-generate hashtags"  desc="Automatically suggest hashtags for every upload"  onToggle={() => setToggles(t => ({ ...t, autoHashtags: !t.autoHashtags }))} />
//             <ToggleSwitch on={toggles.bestTimeHints} label="Best time suggestions"   desc="Show optimal posting time recommendations"          onToggle={() => setToggles(t => ({ ...t, bestTimeHints: !t.bestTimeHints }))} last />
//           </div>
//         </div>
 
//         {/* ══ RIGHT ═══════════════════════════════════════════════════════════ */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
 
//           {/* Connected platforms */}
//           <div style={card}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
//               <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Connected Platforms</div>
//               <span style={{ fontSize: 10, color: C.accent2, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
//                 {connectedCount} / 3 live
//               </span>
//             </div>
//             <div style={{ fontSize: 11, color: C.text3, marginBottom: 16 }}>Click to connect or disconnect your accounts</div>
 
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//               {(['Instagram','YouTube','Twitter'] as Platform[]).map(p => {
//                 const m = PLAT_META[p]
//                 const connected = connections[p]
//                 return (
//                   <div key={p} className={connected ? 'conn-live' : 'conn-card'} onClick={() => toggleConn(p)} style={{
//                     display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px',
//                     borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
//                     border: `1px solid ${connected ? 'rgba(74,222,128,0.3)' : C.border}`,
//                     background: connected ? 'rgba(74,222,128,0.03)' : 'rgba(8,12,24,0.4)',
//                   }}>
//                     <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
//                       {m.icon}
//                     </div>
//                     <div style={{ flex: 1 }}>
//                       <div style={{ fontSize: 14, fontWeight: 600, color: connected ? m.color : C.text }}>{p}</div>
//                       <div style={{ fontSize: 11, color: C.text3, marginTop: 2, fontFamily: 'monospace' }}>
//                         {connected ? '✓ Connected' : m.desc}
//                       </div>
//                     </div>
//                     <span style={{
//                       padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
//                       fontFamily: 'monospace', flexShrink: 0,
//                       color:       connected ? C.accent2 : C.accent,
//                       background:  connected ? 'rgba(74,222,128,0.1)'  : 'rgba(99,179,237,0.1)',
//                       border:      connected ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(99,179,237,0.3)',
//                     }}>
//                       {connected ? 'Connected' : 'Connect'}
//                     </span>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
 
//           {/* Notifications */}
//           <div style={card}>
//             <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Notifications</div>
//             <ToggleSwitch on={toggles.weeklyDigest} label="Weekly performance digest"    desc="Get a summary of your content performance every Monday"  onToggle={() => setToggles(t => ({ ...t, weeklyDigest: !t.weeklyDigest }))} />
//             <ToggleSwitch on={toggles.autoPublish}  label="Auto-publish scheduled posts" desc="Automatically publish posts at their scheduled time"       onToggle={() => setToggles(t => ({ ...t, autoPublish: !t.autoPublish }))} last />
//           </div>
 
//           {/* Plan card */}
//           <div style={{ ...card, background: 'linear-gradient(135deg,rgba(99,179,237,0.07),rgba(167,139,250,0.05))', borderColor: 'rgba(99,179,237,0.2)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
//               <div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Free Plan</div>
//                 <div style={{ fontSize: 11, color: C.text3, marginTop: 4, fontFamily: 'monospace' }}>50 AI generations / month · 3 platforms</div>
//               </div>
//               <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: C.accent3, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
//                 FREE
//               </span>
//             </div>
 
//             <div style={{ height: 1, background: C.border, marginBottom: 14 }} />
 
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
//               {[
//                 { text: 'AI caption generation',    pro: false },
//                 { text: 'Hashtag suggestions',      pro: false },
//                 { text: 'Content scheduling',       pro: false },
//                 { text: 'Basic analytics',          pro: false },
//                 { text: 'Unlimited AI generations', pro: true  },
//                 { text: 'YouTube auto-publish',     pro: true  },
//                 { text: 'Priority support',         pro: true  },
//               ].map((f, i) => (
//                 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
//                   <span style={{ color: !f.pro ? C.accent2 : C.text3, fontSize: 13, flexShrink: 0 }}>{!f.pro ? '✓' : '⚡'}</span>
//                   <span style={{ color: !f.pro ? C.text2 : C.text3, flex: 1 }}>{f.text}</span>
//                   {f.pro && <span style={{ fontSize: 9, color: C.accent3, fontFamily: 'monospace' }}>PRO</span>}
//                 </div>
//               ))}
//             </div>
 
//             <button onClick={() => toast('Pro plan coming soon! 🚀', 'info')} style={{
//               width: '100%', padding: '10px 0', borderRadius: 9,
//               background: 'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(167,139,250,0.15))',
//               border: '1px solid rgba(99,179,237,0.3)', color: C.accent,
//               fontSize: 13, fontWeight: 600, cursor: 'pointer',
//               fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
//             }}>
//               ⚡ Upgrade to Pro
//             </button>
//           </div>
 
//           {/* Danger zone */}
//           <div style={{ ...card, borderColor: 'rgba(248,113,113,0.15)' }}>
//             <div style={{ fontSize: 14, fontWeight: 700, color: C.danger, marginBottom: 4 }}>Danger Zone</div>
//             <div style={{ fontSize: 11, color: C.text3, marginBottom: 16 }}>These actions are permanent and cannot be undone.</div>
//             <div style={{ display: 'flex', gap: 10 }}>
//               <button className="ghost-btn" onClick={() => toast('Export coming soon', 'info')} style={{
//                 flex: 1, padding: '8px 0', borderRadius: 8,
//                 border: `1px solid ${C.border}`, background: 'transparent',
//                 color: C.text2, fontSize: 12, fontWeight: 600,
//                 cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
//               }}>
//                 Export Data
//               </button>
//               <button className="del-btn" onClick={() => toast('Account deletion coming soon', 'error')} style={{
//                 flex: 1, padding: '8px 0', borderRadius: 8,
//                 border: '1px solid rgba(248,113,113,0.3)',
//                 background: 'rgba(248,113,113,0.06)',
//                 color: C.danger, fontSize: 12, fontWeight: 600,
//                 cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
//               }}>
//                 Delete Account
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase' // 👈 Make sure this path matches your project!

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Platform = 'Instagram' | 'YouTube' | 'Twitter'

export interface Profile {
  name: string
  handle: string
  bio: string
}

interface Toggles {
  autoHashtags: boolean
  bestTimeHints: boolean
  weeklyDigest: boolean
  autoPublish: boolean
}

interface Connections {
  Instagram: boolean
  YouTube: boolean
  Twitter: boolean
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg2: '#0d1225', bg3: '#111827',
  border: 'rgba(255,255,255,0.06)',
  text: '#e8edf5', text2: '#8892a4', text3: '#4f5a6e',
  accent: '#63b3ed', accent2: '#4ade80', accent3: '#f59e0b', accent4: '#a78bfa', danger: '#f87171',
}

const PLAT_META: Record<Platform, { color: string; bg: string; border: string; icon: string; desc: string }> = {
  Instagram: { color: C.accent4, bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', icon: '📸', desc: 'Reels, Stories, Posts' },
  YouTube:   { color: C.danger,  bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', icon: '▶️', desc: 'Shorts, Videos'      },
  Twitter:   { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)',  icon: '𝕏',  desc: 'Tweets, Threads'      },
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
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 600, color: C.text2,
  letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'monospace', textTransform: 'uppercase',
}

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
function ToggleSwitch({ on, label, desc, onToggle, last = false }: {
  on: boolean; label: string; desc: string; onToggle: () => void; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{desc}</div>
      </div>
      <div onClick={onToggle} style={{
        width: 38, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
        position: 'relative', transition: 'background 0.2s', marginLeft: 16,
        background: on ? 'rgba(99,179,237,0.35)' : C.bg3,
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%', position: 'absolute',
          top: 3, transition: 'left 0.2s, background 0.2s',
          left: on ? 21 : 3, background: on ? C.accent : C.text3,
        }} />
      </div>
    </div>
  )
}

// ─── SETTINGS SECTION ─────────────────────────────────────────────────────────
export function SettingsSection({
  savedProfile,
  onSaveProfile,
  toast: externalToast,
}: {
  savedProfile: Profile
  onSaveProfile: (p: Profile) => void
  toast?: (msg: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [inlineToasts, setInlineToasts] = useState<{ id: number; msg: string; type: string }[]>([])
  const inlineToast = useCallback((msg: string, type = 'info') => {
    const id = Date.now()
    setInlineToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setInlineToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  const toast = externalToast ?? inlineToast

  const [profile,     setProfile]     = useState<Profile>({ ...savedProfile })
  const [saved,       setSaved]       = useState(false)
  const [connections, setConnections] = useState<Connections>({ Instagram: true, YouTube: false, Twitter: false })
  const [toggles,     setToggles]     = useState<Toggles>({ autoHashtags: true, bestTimeHints: true, weeklyDigest: false, autoPublish: false })
  const [groqKey,     setGroqKey]     = useState('')
  const [keyVisible,  setKeyVisible]  = useState(false)

  // ─── CHECK URL FOR OAUTH SUCCESS CALLBACK ──────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'youtube') {
      setConnections(c => ({ ...c, YouTube: true }));
      toast('YouTube connected successfully!', 'success');
      // Clean up the URL so it looks nice
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      toast('Failed to connect platform.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleSaveProfile = () => {
    if (!profile.name.trim()) { toast('Display name cannot be empty', 'error'); return }
    onSaveProfile({ ...profile })
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
    toast('Profile updated!', 'success')
  }

  // ─── HANDLE PLATFORM CONNECTIONS ───────────────────────────────────────────
  const toggleConn = async (p: Platform) => {
    const isConnecting = !connections[p]

    // If connecting YouTube, trigger the real real OAuth flow!
    if (p === 'YouTube' && isConnecting) {
      try {
        toast('Redirecting to Google...', 'info');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          toast("You need to be logged in to connect YouTube.", "error");
          return;
        }

        const response = await fetch('http://localhost:3001/api/auth/youtube/url', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url; // GO TO GOOGLE!
        } else {
          toast("Failed to generate YouTube login link.", "error");
        }
      } catch (err) {
        console.error("Error connecting YouTube:", err);
        toast("Network error while connecting to YouTube.", "error");
      }
      return; // Stop here, browser is redirecting
    }

    // Default fallback for Twitter, Instagram, or disconnecting YouTube
    setConnections(c => ({ ...c, [p]: isConnecting }))
    toast(isConnecting ? `${p} connected!` : `${p} disconnected`, isConnecting ? 'success' : 'info')
  }

  const connectedCount = Object.values(connections).filter(Boolean).length

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(16px);opacity:0} to{transform:translateX(0);opacity:1} }
        .st-input:focus    { border-color:rgba(99,179,237,0.4) !important; box-shadow:0 0 0 3px rgba(99,179,237,0.07) !important; }
        .conn-card:hover   { border-color:rgba(99,179,237,0.3) !important; }
        .conn-live:hover   { border-color:rgba(74,222,128,0.45) !important; }
        .save-btn:hover    { box-shadow:0 0 22px rgba(99,179,237,0.18); }
        .ghost-btn:hover   { color:#e8edf5 !important; border-color:rgba(255,255,255,0.14) !important; }
        .del-btn:hover     { background:rgba(248,113,113,0.12) !important; }
        select option      { background:#0d1225; color:#e8edf5; }
      `}</style>

      {/* Inline toasts */}
      {!externalToast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, display:'flex', flexDirection:'column', gap:8 }}>
          {inlineToasts.map(t => (
            <div key={t.id} style={{
              padding:'10px 16px', borderRadius:10, fontSize:12, fontWeight:500, border:'1px solid',
              animation:'slideIn 0.25s ease', maxWidth:300,
              background:  t.type==='success'?'rgba(74,222,128,0.1)' :t.type==='error'?'rgba(248,113,113,0.1)' :'rgba(99,179,237,0.1)',
              borderColor: t.type==='success'?'rgba(74,222,128,0.3)' :t.type==='error'?'rgba(248,113,113,0.3)' :'rgba(99,179,237,0.3)',
              color:       t.type==='success'?'#4ade80'              :t.type==='error'?'#f87171'              :'#63b3ed',
            }}>
              {t.type==='success'?'✓ ':t.type==='error'?'⚠ ':'ℹ '}{t.msg}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ══ LEFT ════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>Profile</div>

            {/* Avatar preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #63b3ed, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: '#05070f',
              }}>
                {(profile.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{profile.name || 'Your Name'}</div>
                <div style={{ fontSize: 12, color: C.accent, fontFamily: 'monospace', marginTop: 2 }}>{profile.handle || '@handle'}</div>
                {profile.bio && <div style={{ fontSize: 11, color: C.text3, marginTop: 4, lineHeight: 1.4 }}>{profile.bio}</div>}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Display Name</label>
              <input className="st-input" style={baseInput} value={profile.name} placeholder="Your name" onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Handle</label>
              <input className="st-input" style={baseInput} value={profile.handle} placeholder="@yourhandle" onChange={e => setProfile(p => ({ ...p, handle: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Bio</label>
              <textarea
                className="st-input"
                style={{ ...baseInput, resize: 'vertical', minHeight: 68, lineHeight: 1.6 } as React.CSSProperties}
                value={profile.bio} rows={3} placeholder="Tell the world what you create…"
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              />
            </div>

            <button className="save-btn" onClick={handleSaveProfile} style={{
              width: '100%', padding: '10px 0', borderRadius: 9,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 7, transition: 'all 0.2s',
              background: saved ? 'linear-gradient(135deg,rgba(74,222,128,0.2),rgba(74,222,128,0.1))' : 'linear-gradient(135deg,rgba(99,179,237,0.18),rgba(99,179,237,0.08))',
              border: saved ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(99,179,237,0.35)',
              color: saved ? C.accent2 : C.accent,
            }}>
              {saved ? '✓  Saved!' : 'Save Profile'}
            </button>
          </div>

          {/* AI Config */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>AI Configuration</div>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 18 }}>Configure your content generation preferences</div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Default Tone</label>
              <select className="st-input" style={{ ...baseInput, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}>
                {['Engaging & casual','Professional & informative','Funny & relatable','Inspirational & motivating'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Default Hashtag Count</label>
              <select className="st-input" style={{ ...baseInput, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}>
                {['5–8 (focused)','10–15 (balanced)','20–30 (maximum reach)'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 0 }}>
              <label style={lbl}>Groq API Key</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="st-input"
                  style={{ ...baseInput, paddingRight: 44, fontFamily: keyVisible ? 'inherit' : 'monospace' }}
                  type={keyVisible ? 'text' : 'password'}
                  value={groqKey} placeholder="gsk_••••••••••••••••••••"
                  onChange={e => setGroqKey(e.target.value)}
                />
                <button onClick={() => setKeyVisible(v => !v)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: C.text3, fontSize: 13, padding: 4,
                }}>
                  {keyVisible ? '🙈' : '👁'}
                </button>
              </div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 5, fontFamily: 'monospace' }}>
                Or set VITE_GROQ_API_KEY in your .env file
              </div>
            </div>

            <div style={{ height: 1, background: C.border, margin: '16px 0' }} />

            <ToggleSwitch on={toggles.autoHashtags} label="Auto-generate hashtags"  desc="Automatically suggest hashtags for every upload"  onToggle={() => setToggles(t => ({ ...t, autoHashtags: !t.autoHashtags }))} />
            <ToggleSwitch on={toggles.bestTimeHints} label="Best time suggestions"   desc="Show optimal posting time recommendations"          onToggle={() => setToggles(t => ({ ...t, bestTimeHints: !t.bestTimeHints }))} last />
          </div>
        </div>

        {/* ══ RIGHT ═══════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Connected platforms */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Connected Platforms</div>
              <span style={{ fontSize: 10, color: C.accent2, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
                {connectedCount} / 3 live
              </span>
            </div>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 16 }}>Click to connect or disconnect your accounts</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['Instagram','YouTube','Twitter'] as Platform[]).map(p => {
                const m = PLAT_META[p]
                const connected = connections[p]
                return (
                  <div key={p} className={connected ? 'conn-live' : 'conn-card'} onClick={() => toggleConn(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px',
                    borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                    border: `1px solid ${connected ? 'rgba(74,222,128,0.3)' : C.border}`,
                    background: connected ? 'rgba(74,222,128,0.03)' : 'rgba(8,12,24,0.4)',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                      {m.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: connected ? m.color : C.text }}>{p}</div>
                      <div style={{ fontSize: 11, color: C.text3, marginTop: 2, fontFamily: 'monospace' }}>
                        {connected ? '✓ Connected' : m.desc}
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                      fontFamily: 'monospace', flexShrink: 0,
                      color:       connected ? C.accent2 : C.accent,
                      background:  connected ? 'rgba(74,222,128,0.1)'  : 'rgba(99,179,237,0.1)',
                      border:      connected ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(99,179,237,0.3)',
                    }}>
                      {connected ? 'Connected' : 'Connect'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notifications */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Notifications</div>
            <ToggleSwitch on={toggles.weeklyDigest} label="Weekly performance digest"    desc="Get a summary of your content performance every Monday"  onToggle={() => setToggles(t => ({ ...t, weeklyDigest: !t.weeklyDigest }))} />
            <ToggleSwitch on={toggles.autoPublish}  label="Auto-publish scheduled posts" desc="Automatically publish posts at their scheduled time"       onToggle={() => setToggles(t => ({ ...t, autoPublish: !t.autoPublish }))} last />
          </div>

          {/* Plan card */}
          <div style={{ ...card, background: 'linear-gradient(135deg,rgba(99,179,237,0.07),rgba(167,139,250,0.05))', borderColor: 'rgba(99,179,237,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Free Plan</div>
                <div style={{ fontSize: 11, color: C.text3, marginTop: 4, fontFamily: 'monospace' }}>50 AI generations / month · 3 platforms</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: C.accent3, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                FREE
              </span>
            </div>

            <div style={{ height: 1, background: C.border, marginBottom: 14 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
              {[
                { text: 'AI caption generation',    pro: false },
                { text: 'Hashtag suggestions',      pro: false },
                { text: 'Content scheduling',       pro: false },
                { text: 'Basic analytics',          pro: false },
                { text: 'Unlimited AI generations', pro: true  },
                { text: 'YouTube auto-publish',     pro: true  },
                { text: 'Priority support',         pro: true  },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ color: !f.pro ? C.accent2 : C.text3, fontSize: 13, flexShrink: 0 }}>{!f.pro ? '✓' : '⚡'}</span>
                  <span style={{ color: !f.pro ? C.text2 : C.text3, flex: 1 }}>{f.text}</span>
                  {f.pro && <span style={{ fontSize: 9, color: C.accent3, fontFamily: 'monospace' }}>PRO</span>}
                </div>
              ))}
            </div>

            <button onClick={() => toast('Pro plan coming soon! 🚀', 'info')} style={{
              width: '100%', padding: '10px 0', borderRadius: 9,
              background: 'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(167,139,250,0.15))',
              border: '1px solid rgba(99,179,237,0.3)', color: C.accent,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              ⚡ Upgrade to Pro
            </button>
          </div>

          {/* Danger zone */}
          <div style={{ ...card, borderColor: 'rgba(248,113,113,0.15)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.danger, marginBottom: 4 }}>Danger Zone</div>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 16 }}>These actions are permanent and cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ghost-btn" onClick={() => toast('Export coming soon', 'info')} style={{
                flex: 1, padding: '8px 0', borderRadius: 8,
                border: `1px solid ${C.border}`, background: 'transparent',
                color: C.text2, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                Export Data
              </button>
              <button className="del-btn" onClick={() => toast('Account deletion coming soon', 'error')} style={{
                flex: 1, padding: '8px 0', borderRadius: 8,
                border: '1px solid rgba(248,113,113,0.3)',
                background: 'rgba(248,113,113,0.06)',
                color: C.danger, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
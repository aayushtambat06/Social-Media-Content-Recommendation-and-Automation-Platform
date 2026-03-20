import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
 
// ─── TYPES ────────────────────────────────────────────────────────────────────
type Platform = 'Instagram' | 'YouTube' | 'Twitter'
type Tone =
  | 'Engaging & casual'
  | 'Professional & informative'
  | 'Funny & relatable'
  | 'Inspirational & motivating'
  | 'Trendy & Gen-Z'
  | 'Educational & clear'
 
// ─── AI HELPER ────────────────────────────────────────────────────────────────
// async function callAI(prompt: string, systemPrompt = '') {
//   const apiKey = import.meta.env.VITE_GROQ_API_KEY
//   if (!apiKey) throw new Error('VITE_GROQ_API_KEY is missing. Add it to your .env file.')
//   const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
//     body: JSON.stringify({
//       model: 'llama-3.1-8b-instant',
//       max_tokens: 1024,
//       temperature: 0.8,
//       messages: [{ role: 'user', content: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }],
//     }),
//   })
//   const data = await res.json()
//   if (!res.ok) throw new Error(data?.error?.message || `Groq API error: ${res.status}`)
//   return data.choices?.[0]?.message?.content || ''
// }


async function callAI(description: string, platform: string, tone: string) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is missing from .env')

  const prompt = `Generate social media content for a ${platform} post.\n\nVideo description: "${description}"\nTone: ${tone}\nPlatform: ${platform}\n\nRespond in EXACTLY this format:\nCAPTION:\n[Write a compelling caption here with emojis, 2-4 sentences]\n\nHASHTAGS:\n[List 12-18 hashtags starting with #, space-separated]`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1024,
      temperature: 0.8,
      messages: [
        { role: 'system', content: `You are an expert ${platform} content strategist. Always respond strictly in the requested CAPTION/HASHTAGS format.` },
        { role: 'user', content: prompt },
      ],
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `Groq error: ${res.status}`)

  const result = data.choices?.[0]?.message?.content || ''
  const captionMatch = result.match(/CAPTION:\s*\n([\s\S]*?)(?=\n\s*HASHTAGS:)/i)
  const hashtagMatch = result.match(/HASHTAGS:\s*\n([\s\S]*?)$/i)

  return {
    caption:  captionMatch?.[1]?.trim() ?? result.trim(),
    hashtags: hashtagMatch
      ? hashtagMatch[1].trim().split(/[\s,\n]+/).filter((t: string) => t.startsWith('#'))
      : [],
  }
}
 
// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg2:        '#0d1225',
  bg3:        '#111827',
  border:     'rgba(255,255,255,0.06)',
  text:       '#e8edf5',
  text2:      '#8892a4',
  text3:      '#4f5a6e',
  accent:     '#63b3ed',
  accent2:    '#4ade80',
  accent4:    '#a78bfa',
  danger:     '#f87171',
}
 
const baseInput: React.CSSProperties = {
  width: '100%',
  padding: '9px 13px',
  borderRadius: 9,
  background: 'rgba(8,12,24,0.85)',
  border: '1px solid rgba(255,255,255,0.07)',
  color: C.text,
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}
 
const baseCard: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(13,18,37,0.95), rgba(8,12,24,0.98))',
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 20,
}
 
// ─── ICONS ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)
const SpinnerIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin 0.7s linear infinite', flexShrink:0 }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)
const CopyIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const ShareIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const CalIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const AiIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><circle cx="19" cy="5" r="3"/>
  </svg>
)
 
// ─── COMPONENT ────────────────────────────────────────────────────────────────
export function UploadSection({
  toast: externalToast,
}: {
  toast?: (msg: string, type?: 'success' | 'error' | 'info') => void
} = {}) {
  // fallback inline toast
  const [inlineToasts, setInlineToasts] = useState<{ id: number; msg: string; type: string }[]>([])
  const inlineToast = useCallback((msg: string, type = 'info') => {
    const id = Date.now()
    setInlineToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setInlineToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  const toast = externalToast ?? inlineToast
 
  const [file,        setFile]        = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [platform,    setPlatform]    = useState<Platform>('Instagram')
  const [tone,        setTone]        = useState<Tone>('Engaging & casual')
  const [caption,     setCaption]     = useState('')
  const [hashtags,    setHashtags]    = useState<string[]>([])
  const [step,        setStep]        = useState<1 | 2 | 3>(1)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [drag,        setDrag]        = useState(false)
  const [dragCount,   setDragCount]   = useState(0)
  const [copied,      setCopied]      = useState(false)
 
  const fileRef = useRef<HTMLInputElement>(null)
 
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragCount(0); setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('video/')) { setFile(f); setStep(2) }
    else toast('Please drop a video file (MP4, MOV, WebM)', 'error')
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setStep(2) }
  }
  const reset = () => {
    setFile(null); setCaption(''); setHashtags([])
    setDescription(''); setStep(1); setCopied(false)
  }
 
  // const generateAI = async () => {
  //   if (!description.trim()) { toast('Add a description first', 'error'); return }
  //   setAiLoading(true); setCaption(''); setHashtags([])
  //   try {
  //     const prompt = `Generate social media content for a ${platform} post.\n\nVideo description: "${description}"\nTone: ${tone}\nPlatform: ${platform}\n\nRespond in EXACTLY this format:\nCAPTION:\n[Write a compelling caption here with emojis, 2-4 sentences]\n\nHASHTAGS:\n[List 12-18 hashtags starting with #, space-separated]`
  //     const result = await callAI(
  //       prompt,
  //       `You are an expert ${platform} content strategist. Always respond strictly in the requested CAPTION/HASHTAGS format.`
  //     )
  //     const captionMatch = result.match(/CAPTION:\s*\n([\s\S]*?)(?=\n\s*HASHTAGS:)/i)
  //     const hashtagMatch = result.match(/HASHTAGS:\s*\n([\s\S]*?)$/i)
  //     const parsedCaption = captionMatch?.[1]?.trim() ?? ''
  //     const parsedTags    = hashtagMatch
  //       ? hashtagMatch[1].trim().split(/[\s,\n]+/).filter((t: string) => t.startsWith('#'))
  //       : []
  //     if (parsedCaption) {
  //       setCaption(parsedCaption); setHashtags(parsedTags); setStep(3)
  //       toast('AI content generated!', 'success')
  //     } else if (result.trim()) {
  //       setCaption(result.trim()); setStep(3)
  //       toast('Content generated!', 'success')
  //     } else {
  //       toast('AI returned empty content — try again', 'error')
  //     }
  //   } catch (err) {
  //     toast(`Error: ${err instanceof Error ? err.message : String(err)}`, 'error')
  //   }
  //   setAiLoading(false)
  // }

  const generateAI = async () => {
    if (!description.trim()) { toast('Add a description first', 'error'); return }
    setAiLoading(true); setCaption(''); setHashtags([])
    try {
      const result = await callAI(description, platform, tone)
      setCaption(result.caption)
      setHashtags(result.hashtags)
      setStep(3)
      toast('AI content generated!', 'success')
    } catch (err) {
      toast(`Error: ${err instanceof Error ? err.message : String(err)}`, 'error')
    }
    setAiLoading(false)
  }
  
  const handleUpload = async () => {
    if (!file) { toast('Select a video first', 'error'); return }
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage.from('videos').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath)
      const { error: dbError } = await supabase.from('content').insert({
        user_id: user.id,
        title: description.trim() || file.name,
        description,
        video_url: publicUrl,
        platform: platform.toLowerCase(),
        status: 'draft',
      })
      if (dbError) throw dbError
      toast('Video saved to drafts!', 'success')
      reset()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'error')
    }
    setUploading(false)
  }
 
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); toast('Copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    })
  }
 
  const PLATFORMS: Platform[] = ['Instagram', 'YouTube', 'Twitter']
  const TONES: Tone[]         = ['Engaging & casual','Professional & informative','Funny & relatable','Inspirational & motivating','Trendy & Gen-Z','Educational & clear']
  const PLAT_COLOR: Record<Platform, string> = { Instagram: C.accent4, YouTube: C.danger, Twitter: '#38bdf8' }
  const STEPS = ['Upload Video', 'Describe', 'AI Generate']
 
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes slideIn { from { transform:translateX(16px); opacity:0 } to { transform:translateX(0); opacity:1 } }
        .up-input:focus     { border-color: rgba(99,179,237,0.4) !important; box-shadow: 0 0 0 3px rgba(99,179,237,0.07) !important; }
        .up-zone:hover      { border-color: rgba(99,179,237,0.35) !important; background: rgba(99,179,237,0.03) !important; }
        .up-tag:hover       { background: rgba(99,179,237,0.18) !important; }
        .up-ghost:hover     { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.12) !important; color: #e8edf5 !important; }
        .up-primary:hover   { box-shadow: 0 0 22px rgba(99,179,237,0.2); border-color: rgba(99,179,237,0.6) !important; }
        .up-success:hover   { box-shadow: 0 0 20px rgba(74,222,128,0.15); }
        select option       { background: #0d1225; color: #e8edf5; }
      `}</style>
 
      {/* Inline toasts */}
      {!externalToast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, display:'flex', flexDirection:'column', gap:8 }}>
          {inlineToasts.map(t => (
            <div key={t.id} style={{
              padding:'10px 16px', borderRadius:10, fontSize:12, fontWeight:500,
              border:'1px solid', animation:'slideIn 0.25s ease', maxWidth:300,
              background:  t.type==='success'?'rgba(74,222,128,0.1)' :t.type==='error'?'rgba(248,113,113,0.1)' :'rgba(99,179,237,0.1)',
              borderColor: t.type==='success'?'rgba(74,222,128,0.3)' :t.type==='error'?'rgba(248,113,113,0.3)' :'rgba(99,179,237,0.3)',
              color:       t.type==='success'?'#4ade80'               :t.type==='error'?'#f87171'               :'#63b3ed',
            }}>
              {t.type==='success'?'✓ ':t.type==='error'?'⚠ ':'ℹ '}{t.msg}
            </div>
          ))}
        </div>
      )}
 
      {/* ── Step indicator ───────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:24, height:24, borderRadius:'50%', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:700, fontFamily:'monospace',
                background: step > i+1 ? C.accent2 : step === i+1 ? C.accent : C.bg3,
                color: step >= i+1 ? '#05070f' : C.text3,
                transition:'all 0.2s',
              }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span style={{
                fontSize:12, fontWeight: step===i+1 ? 600 : 400,
                color: step===i+1 ? C.text : C.text3,
                transition:'color 0.2s',
              }}>{s}</span>
            </div>
            {i < 2 && (
              <div style={{
                width:28, height:1, margin:'0 10px', flexShrink:0,
                background: step > i+1 ? C.accent2 : C.border,
                transition:'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>
 
      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
 
        {/* ══ LEFT ════════════════════════════════════════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
 
          {/* Upload zone or file preview */}
          {!file ? (
            <div
              className="up-zone"
              style={{
                border: `2px dashed ${drag ? 'rgba(99,179,237,0.5)' : C.border}`,
                borderRadius:12, padding:'36px 24px', textAlign:'center', cursor:'pointer',
                background: drag ? 'rgba(99,179,237,0.04)' : 'transparent',
                transition:'all 0.2s',
                boxShadow: drag ? '0 0 24px rgba(99,179,237,0.08)' : 'none',
              }}
              onDragEnter={e => { e.preventDefault(); setDragCount(c => c+1); setDrag(true) }}
              onDragOver={e => e.preventDefault()}
              onDragLeave={() => setDragCount(c => { const n = c-1; if(n <= 0) setDrag(false); return n })}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="video/*" style={{ display:'none' }} onChange={handleFileSelect} />
              <div style={{ fontSize:36, marginBottom:12, opacity: drag ? 1 : 0.5 }}>🎬</div>
              <div style={{ fontSize:14, fontWeight:600, color: drag ? C.accent : C.text2, marginBottom:4 }}>
                {drag ? 'Drop to upload' : 'Drag & drop your video'}
              </div>
              <div style={{ fontSize:11, color:C.text3, marginBottom:16, fontFamily:'monospace' }}>
                MP4 · MOV · WebM · Max 500MB
              </div>
              <button
                onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                style={{
                  padding:'8px 18px', borderRadius:8,
                  border:'1px solid rgba(99,179,237,0.35)',
                  background:'rgba(99,179,237,0.1)', color:C.accent,
                  fontSize:12, fontWeight:600, cursor:'pointer',
                  fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:7,
                }}
              >
                <UploadIcon /> Browse Files
              </button>
            </div>
          ) : (
            <div style={{ ...baseCard, borderColor:'rgba(74,222,128,0.25)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:48, height:48, borderRadius:10, flexShrink:0,
                  background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
                }}>🎬</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize:11, color:C.text3, fontFamily:'monospace', marginTop:3 }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
                <button
                  onClick={reset}
                  style={{
                    padding:'5px 12px', borderRadius:7,
                    border:'1px solid rgba(248,113,113,0.3)',
                    background:'rgba(248,113,113,0.07)', color:C.danger,
                    fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flexShrink:0,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
 
          {/* Config: platform, tone, description */}
          <div style={baseCard}>
            {/* Platform toggle */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.08em', marginBottom:8, fontFamily:'monospace', textTransform:'uppercase' }}>Platform</div>
              <div style={{ display:'flex', gap:8 }}>
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    style={{
                      flex:1, padding:'7px 10px', borderRadius:8, cursor:'pointer',
                      fontFamily:'inherit', fontSize:12, fontWeight:600, transition:'all 0.15s',
                      border: platform===p ? `1px solid ${PLAT_COLOR[p]}50` : `1px solid ${C.border}`,
                      background: platform===p ? `${PLAT_COLOR[p]}12` : C.bg2,
                      color: platform===p ? PLAT_COLOR[p] : C.text2,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Tone */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.08em', marginBottom:6, fontFamily:'monospace', textTransform:'uppercase' }}>Tone / Style</div>
              <select
                className="up-input"
                style={{ ...baseInput, appearance:'none', cursor:'pointer' } as React.CSSProperties}
                value={tone}
                onChange={e => setTone(e.target.value as Tone)}
              >
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
 
            {/* Description */}
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:C.text2, letterSpacing:'0.08em', marginBottom:6, fontFamily:'monospace', textTransform:'uppercase' }}>
                Video Description
                <span style={{ color:C.text3, fontWeight:400, marginLeft:6, fontSize:9, textTransform:'none', letterSpacing:0 }}>
                  AI uses this to write your caption
                </span>
              </div>
              <textarea
                className="up-input"
                style={{ ...baseInput, resize:'vertical', minHeight:88, lineHeight:1.65 } as React.CSSProperties}
                placeholder="Describe what your video is about, its message, and who it's for…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
 
          {/* Generate button */}
          <button
            className="up-primary"
            disabled={aiLoading || !description.trim()}
            onClick={generateAI}
            style={{
              width:'100%', padding:'11px 0', borderRadius:9,
              background:'linear-gradient(135deg, rgba(99,179,237,0.18), rgba(99,179,237,0.08))',
              border:'1px solid rgba(99,179,237,0.35)', color:C.accent,
              fontSize:13, fontWeight:600,
              cursor: aiLoading || !description.trim() ? 'not-allowed' : 'pointer',
              opacity: !description.trim() ? 0.45 : 1,
              fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'all 0.15s',
            }}
          >
            {aiLoading ? <><SpinnerIcon /> Generating…</> : <><AiIcon /> Generate AI Content</>}
          </button>
        </div>
 
        {/* ══ RIGHT: AI Results ═══════════════════════════════════════════════ */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
 
          {step < 3 && !caption ? (
            /* Empty state */
            <div style={{ ...baseCard, flex:1, minHeight:280, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, opacity:0.4 }}>
              <div style={{ fontSize:40 }}>✨</div>
              <div style={{ fontSize:14, color:C.text2, fontWeight:600 }}>AI results appear here</div>
              <div style={{ fontSize:12, color:C.text3, textAlign:'center', maxWidth:220, lineHeight:1.65 }}>
                Upload a file, add a description, then click Generate
              </div>
            </div>
          ) : (
            <>
              {/* Caption */}
              {caption && (
                <div style={{ ...baseCard, animation:'fadeIn 0.3s ease' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <span style={{
                      padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:700,
                      letterSpacing:'0.06em', fontFamily:'monospace',
                      background:'rgba(99,179,237,0.1)', border:'1px solid rgba(99,179,237,0.3)', color:C.accent,
                    }}>CAPTION</span>
                    <button className="up-ghost" onClick={() => copy(caption)} style={{
                      padding:'4px 10px', borderRadius:7, border:`1px solid ${C.border}`,
                      background:'transparent', color:C.text2, fontSize:11, fontWeight:600,
                      cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5, transition:'all 0.15s',
                    }}>
                      <CopyIcon /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  {/* AI glow box */}
                  <div style={{
                    background:'linear-gradient(135deg, rgba(99,179,237,0.06), rgba(167,139,250,0.04))',
                    border:'1px solid rgba(99,179,237,0.18)', borderRadius:10, padding:14,
                    position:'relative', marginBottom:12,
                  }}>
                    <div style={{ position:'absolute', top:10, right:12, fontSize:9, fontFamily:'monospace', fontWeight:700, letterSpacing:'0.1em', color:C.accent, opacity:0.4 }}>AI</div>
                    <div style={{ fontSize:13, color:C.text, lineHeight:1.75 }}>{caption}</div>
                  </div>
                  <textarea
                    className="up-input"
                    style={{ ...baseInput, resize:'vertical', lineHeight:1.6 } as React.CSSProperties}
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
 
              {/* Hashtags */}
              {hashtags.length > 0 && (
                <div style={{ ...baseCard, animation:'fadeIn 0.35s ease' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <span style={{
                      padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:700,
                      letterSpacing:'0.06em', fontFamily:'monospace',
                      background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.3)', color:C.accent4,
                    }}>HASHTAGS</span>
                    <button className="up-ghost" onClick={() => copy(hashtags.join(' '))} style={{
                      padding:'4px 10px', borderRadius:7, border:`1px solid ${C.border}`,
                      background:'transparent', color:C.text2, fontSize:11, fontWeight:600,
                      cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5, transition:'all 0.15s',
                    }}>
                      <CopyIcon /> Copy All
                    </button>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                    {hashtags.map((tag, i) => (
                      <div key={i} className="up-tag" onClick={() => setHashtags(h => h.filter((_,j) => j !== i))} title="Click to remove" style={{
                        padding:'3px 10px', borderRadius:20, fontSize:11, cursor:'pointer',
                        background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)',
                        color:C.accent, fontFamily:'monospace', transition:'all 0.12s', userSelect:'none',
                      }}>
                        {tag} <span style={{ opacity:0.45 }}>×</span>
                      </div>
                    ))}
                  </div>
                  <button className="up-ghost" onClick={generateAI} disabled={aiLoading} style={{
                    padding:'5px 12px', borderRadius:7, border:`1px solid ${C.border}`,
                    background:'transparent', color:C.text2, fontSize:11, fontWeight:600,
                    cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5, transition:'all 0.15s',
                  }}>
                    <RefreshIcon /> Regenerate
                  </button>
                </div>
              )}
 
              {/* Action buttons */}
              {caption && (
                <div style={{ display:'flex', gap:10 }}>
                  <button className="up-success" onClick={() => toast(`Published to ${platform}!`, 'success')} style={{
                    flex:1, padding:'10px 0', borderRadius:9,
                    background:'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.08))',
                    border:'1px solid rgba(74,222,128,0.35)', color:C.accent2,
                    fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.15s',
                  }}>
                    <ShareIcon /> Publish to {platform}
                  </button>
 
                  <button className="up-ghost" onClick={handleUpload} disabled={uploading || !file} style={{
                    flex:1, padding:'10px 0', borderRadius:9, border:`1px solid ${C.border}`,
                    background:C.bg2, color: uploading || !file ? C.text3 : C.text2,
                    fontSize:13, fontWeight:600, cursor: uploading || !file ? 'not-allowed' : 'pointer',
                    fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.15s',
                  }}>
                    {uploading ? <><SpinnerIcon /> Uploading…</> : <><CalIcon /> Save to Draft</>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
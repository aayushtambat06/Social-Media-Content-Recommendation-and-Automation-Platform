import { useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── FEATURE LIST ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Captions',
    desc: 'Generate platform-optimised captions and hashtags in seconds using Groq AI.',
  },
  {
    icon: '📅',
    title: 'Smart Scheduling',
    desc: 'Plan your content calendar and post at the exact times your audience is most active.',
  },
  {
    icon: '📊',
    title: 'Cross-Platform Analytics',
    desc: 'Track views, likes, engagement rate and growth across Instagram, YouTube and Twitter.',
  },
  {
    icon: '⚡',
    title: 'One Dashboard',
    desc: 'Upload, generate, schedule and analyse — everything in a single focused workspace.',
  },
]

const STATS = [
  { value: '3×', label: 'faster content creation' },
  { value: '40%', label: 'avg. engagement lift'   },
  { value: '10+', label: 'hours saved per week'   },
]

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Login() {
  const [isSignUp,  setIsSignUp]  = useState(false)
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [message,   setMessage]   = useState('')
  const [pwVisible, setPwVisible] = useState(false)

  async function handleEmailAuth() {
    setLoading(true); setError(''); setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else if (data.session) window.location.href = '/'
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleEmailAuth()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      background: '#030508',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
        @keyframes fadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .lg-input:focus     { border-color: rgba(99,179,237,0.55) !important; box-shadow: 0 0 0 3px rgba(99,179,237,0.1) !important; outline: none; }
        .lg-google:hover    { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.14) !important; }
        .lg-submit:hover    { box-shadow: 0 0 28px rgba(99,179,237,0.3) !important; border-color: rgba(99,179,237,0.7) !important; }
        .lg-feature:hover   { border-color: rgba(99,179,237,0.2) !important; background: rgba(99,179,237,0.04) !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ══ LEFT — App info panel ════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(160deg, #060d1a 0%, #030508 60%)',
        borderRight: '1px solid rgba(255,255,255,0.055)',
        padding: '52px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position:'absolute', top:-120, left:-80, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,179,237,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, right:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Top: logo + tagline */}
        <div style={{ animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(99,179,237,0.2), rgba(167,139,250,0.15))',
              border: '1px solid rgba(99,179,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>⚡</div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.18em', color: '#63b3ed', fontFamily: "'Fira Code', monospace" }}>
              TRENDPILOT
            </div>
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#eef2f8', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Grow your audience<br />
            <span style={{ background: 'linear-gradient(90deg, #63b3ed, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              on every platform
            </span>
          </h2>
          <p style={{ fontSize: 14, color: '#4f5a6e', lineHeight: 1.7, maxWidth: 380, fontFamily: "'Fira Code', monospace" }}>
            One AI-powered workspace to create, schedule and analyse your social content — faster than ever.
          </p>
        </div>

        {/* Middle: feature list */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, animation:'fadeUp 0.5s 0.1s ease both', opacity:0 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="lg-feature" style={{
              display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)',
              transition: 'all 0.15s',
              cursor: 'default',
            }}>
              <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#eef2f8', marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#4f5a6e', lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1,
          background: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          animation: 'fadeUp 0.5s 0.2s ease both', opacity: 0,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: '16px 14px', background: 'rgba(6,10,18,0.6)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#63b3ed', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#3f4f65', marginTop: 3, fontFamily: "'Fira Code', monospace", letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT — Auth form ════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 28px',
        background: '#030508',
      }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp 0.45s 0.05s ease both', opacity: 0 }}>

          {/* Form header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#eef2f8', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: 13, color: '#3f4f65', fontFamily: "'Fira Code', monospace" }}>
              {isSignUp ? 'Start growing your social media today' : 'Sign in to your dashboard'}
            </p>
          </div>

          {/* Google OAuth */}
          <button className="lg-google" onClick={handleGoogleLogin} style={{
            width: '100%', padding: '11px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 9, color: '#eef2f8', fontSize: 13.5, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, marginBottom: 20,
            fontFamily: "'Space Grotesk', sans-serif",
            transition: 'all 0.15s',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }} />
            <span style={{ color:'#3f4f65', fontSize:11, fontFamily:"'Fira Code',monospace", letterSpacing:'0.1em' }}>OR</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:600, color:'#7e8fa8', letterSpacing:'0.1em', marginBottom:7, fontFamily:"'Fira Code',monospace", textTransform:'uppercase' }}>
              Email
            </label>
            <input
              className="lg-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              style={{
                width:'100%', padding:'10px 13px', borderRadius:9,
                background:'rgba(11,17,32,0.9)',
                border:'1px solid rgba(255,255,255,0.07)',
                color:'#eef2f8', fontSize:13.5,
                fontFamily:"'Space Grotesk',sans-serif",
                transition:'border-color 0.15s, box-shadow 0.15s',
              }}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:600, color:'#7e8fa8', letterSpacing:'0.1em', marginBottom:7, fontFamily:"'Fira Code',monospace", textTransform:'uppercase' }}>
              Password
            </label>
            <div style={{ position:'relative' }}>
              <input
                className="lg-input"
                type={pwVisible ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                style={{
                  width:'100%', padding:'10px 40px 10px 13px', borderRadius:9,
                  background:'rgba(11,17,32,0.9)',
                  border:'1px solid rgba(255,255,255,0.07)',
                  color:'#eef2f8', fontSize:13.5,
                  fontFamily:"'Space Grotesk',sans-serif",
                  transition:'border-color 0.15s, box-shadow 0.15s',
                }}
              />
              <button onClick={() => setPwVisible(v => !v)} style={{
                position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer',
                color:'#3f4f65', fontSize:13, padding:4, lineHeight:1,
              }}>
                {pwVisible ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ fontSize:12, marginBottom:16, padding:'10px 13px', borderRadius:8, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', color:'#f87171', fontFamily:"'Fira Code',monospace" }}>
              ⚠ {error}
            </div>
          )}
          {message && (
            <div style={{ fontSize:12, marginBottom:16, padding:'10px 13px', borderRadius:8, background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.25)', color:'#4ade80', fontFamily:"'Fira Code',monospace" }}>
              ✓ {message}
            </div>
          )}

          {/* Submit */}
          <button className="lg-submit" onClick={handleEmailAuth} disabled={loading} style={{
            width:'100%', padding:'11px 0', borderRadius:9, marginBottom:18,
            background:'linear-gradient(135deg, rgba(99,179,237,0.22), rgba(167,139,250,0.15))',
            border:'1px solid rgba(99,179,237,0.38)',
            color:'#63b3ed', fontSize:14, fontWeight:600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily:"'Space Grotesk',sans-serif",
            letterSpacing:'0.01em',
            transition:'all 0.15s',
          }}>
            {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          {/* Toggle sign in / sign up */}
          <p style={{ textAlign:'center', color:'#3f4f65', fontSize:12.5, margin:0, fontFamily:"'Fira Code',monospace" }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
              style={{ color:'#63b3ed', cursor:'pointer', fontWeight:500, textDecoration:'underline', textUnderlineOffset:3 }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </p>

          {/* Footer note */}
          <p style={{ textAlign:'center', color:'#1e2a3a', fontSize:11, marginTop:28, fontFamily:"'Fira Code',monospace", lineHeight:1.6 }}>
            By signing in you agree to our Terms of Service<br />and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import './style.css'
import { DashboardSection } from './sections/DashboardSection'
import { UploadSection } from './sections/UploadSection'
import { ScheduleSection } from './sections/ScheduleSection'
import { AnalyticsSection } from './sections/AnalyticsSection'
import Login from './pages/Login'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
 
// ─── TYPES ────────────────────────────────────────────────────────────────────
type Section = 'dashboard' | 'upload' | 'schedule' | 'analytics' | 'settings'
type ToastType = 'success' | 'error' | 'info'
interface Toast { id: number; msg: string; type: ToastType }
interface Profile { name: string; handle: string; bio: string }
 
// ─── TOAST HOOK ───────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = useCallback((msg: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  return { toasts, toast }
}
 
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          border: '1px solid', maxWidth: 320, display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideIn 0.3s ease',
          background:   t.type === 'success' ? 'rgba(74,222,128,0.1)'  : t.type === 'error' ? 'rgba(248,113,113,0.1)'  : 'rgba(99,179,237,0.1)',
          borderColor:  t.type === 'success' ? 'rgba(74,222,128,0.3)'  : t.type === 'error' ? 'rgba(248,113,113,0.3)'  : 'rgba(99,179,237,0.3)',
          color:        t.type === 'success' ? '#4ade80'                : t.type === 'error' ? '#f87171'                : '#63b3ed',
        }}>
          {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ'} {t.msg}
        </div>
      ))}
    </div>
  )
}
 
// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV: { id: Section; label: string; path: string }[] = [
  { id: 'dashboard', label: 'Dashboard',   path: '/' },
  { id: 'upload',    label: 'Upload & AI', path: '/upload' },
  { id: 'schedule',  label: 'Schedule',    path: '/schedule' },
  { id: 'analytics', label: 'Analytics',   path: '/analytics' },
  { id: 'settings',  label: 'Settings',    path: '/settings' },
]
 
// FIX 5: lookup object replaces ternary chain
const PAGE_INFO: Record<Section, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard',   sub: 'Overview of your content, AI suggestions, and performance.' },
  upload:    { title: 'Upload & AI', sub: 'Upload videos that you want to optimize and publish.' },
  schedule:  { title: 'Schedule',    sub: 'Manage when your posts go live across platforms.' },
  analytics: { title: 'Analytics',   sub: 'See how your content performs over time.' },
  settings:  { title: 'Settings',    sub: 'Manage your account and integrations.' },
}
 
// ─── APP LAYOUT ───────────────────────────────────────────────────────────────
function AppLayout({ session, savedProfile, setSavedProfile }: {
  session: Session
  savedProfile: Profile
  setSavedProfile: (p: Profile) => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { toasts, toast } = useToast()
 
  // FIX 1: derive activeSection from URL — no useState, no useEffect needed
  const activeSection: Section = NAV.find(n => n.path === location.pathname)?.id ?? 'dashboard'
 
  const { title, sub } = PAGE_INFO[activeSection]
  const userEmail = session.user.email ?? ''
 
  return (
    <div className="app-container">
 
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-title">TRENDPILOT</div>
 
        {/* <div className="nav-section-label">Main</div> */}
 
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <div
              key={n.id}
              className={`nav-item ${activeSection === n.id ? 'active' : ''}`}
              onClick={() => navigate(n.path)}
            >
              {n.label}
            </div>
          ))}
        </nav>
 
        {/* FIX 4: user-badge with profile name + plan replaces plain logout button */}
        <div className="sidebar-footer">
          <div
            className="user-badge"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            title="Click to sign out"
          >
            <div className="user-avatar">
              {(savedProfile.name || userEmail || 'U')[0].toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{savedProfile.name || userEmail}</div>
              <div className="user-plan">FREE PLAN · Sign out</div>
            </div>
          </div>
        </div>
      </aside>
 
      {/* ── Main ── */}
      <main className="main">
        <header className="topbar">
          <div>
            <h1 className="main-header-title">{title}</h1>
            <p className="main-header-subtitle">{sub}</p>
          </div>
 
          {/* FIX 3: status dot + notification bell + New Post button */}
          <div className="topbar-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="status-dot" />
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                3 platforms live
              </span>
            </div>
 
            <div className="notif-btn">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div className="notif-count">3</div>
            </div>
 
            <button className="topbar-btn primary" onClick={() => navigate('/upload')}>
              + New Post
            </button>
          </div>
        </header>
 
        <section className="main-card">
          <Routes>
            <Route path="/"          element={<DashboardSection />} />
            <Route path="/upload"    element={<UploadSection />} />
            <Route path="/schedule"  element={<ScheduleSection />} />
            <Route path="/analytics" element={<AnalyticsSection />} />
            {/*
              FIX 2: when you add SettingsSection, pass savedProfile and onSaveProfile:
              <Route path="/settings" element={
                <SettingsSection
                  savedProfile={savedProfile}
                  onSaveProfile={setSavedProfile}
                />
              } />
            */}
            <Route path="/settings" element={
              <div style={{ padding: 20, color: 'var(--text2)', fontSize: 13 }}>
                Import SettingsSection and pass savedProfile + onSaveProfile props here.
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
 
      <ToastContainer toasts={toasts} />
    </div>
  )
}
 
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
 
  // FIX 2: profile state lives at root so sidebar name updates when settings are saved
  const [savedProfile, setSavedProfile] = useState<Profile>({
    name: 'Alex Rivera',
    handle: '@alexrivera',
    bio: 'Content creator & digital storyteller',
  })
 
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
 
    return () => subscription.unsubscribe()
  }, [])
 
  if (loading) return (
    <div style={{ color: '#e6edf3', background: '#0d1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading...
    </div>
  )
 
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          session
            ? <AppLayout session={session} savedProfile={savedProfile} setSavedProfile={setSavedProfile} />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}
 
export default App


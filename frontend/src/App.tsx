import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import './style.css'
import { DashboardSection } from './sections/DashboardSection'
import { UploadSection } from './sections/UploadSection'
import { ScheduleSection } from './sections/ScheduleSection'
import { AnalyticsSection } from './sections/AnalyticsSection'
import Login from './pages/Login'
import {supabase} from './lib/supabase'
import type {Session} from '@supabase/supabase-js'

// ── Protected layout (your existing sidebar + main) ──────────────────────────
function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  type Section = 'dashboard' | 'upload' | 'schedule' | 'analytics'
  const [activeSection, setActiveSection] = useState<Section>('dashboard')

  useEffect(() => {
    if (location.pathname === '/upload') setActiveSection('upload')
    else if (location.pathname === '/schedule') setActiveSection('schedule')
    else if (location.pathname === '/analytics') setActiveSection('analytics')
    else setActiveSection('dashboard')
  }, [location.pathname])

  const pageTitle =
    activeSection === 'dashboard' ? 'Dashboard'
    : activeSection === 'upload' ? 'Upload content'
    : activeSection === 'schedule' ? 'Schedule'
    : 'Analytics'

  const pageSubtitle =
    activeSection === 'dashboard' ? 'Overview of your content, AI suggestions, and performance.'
    : activeSection === 'upload' ? 'Upload videos that you want to optimize and publish.'
    : activeSection === 'schedule' ? 'Manage when your posts go live across platforms.'
    : 'See how your content performs over time.'

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <div className="sidebar-title">GROWTH PLATFORM</div>
        </div>
        <nav className="sidebar-nav">
          {(['dashboard', 'upload', 'schedule', 'analytics'] as const).map((section) => (
            <div
              key={section}
              className={`nav-item ${activeSection === section ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(section)
                navigate(section === 'dashboard' ? '/' : `/${section}`)
              }}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          AI-powered captions, hashtags, and posting strategy.
        </div>
      </aside>

      <main className="main">
        <header>
          <h1 className="main-header-title">{pageTitle}</h1>
          <p className="main-header-subtitle">{pageSubtitle}</p>
        </header>
        <section className="main-card">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'upload' && <UploadSection />}
          {activeSection === 'schedule' && <ScheduleSection />}
          {activeSection === 'analytics' && <AnalyticsSection />}
        </section>
      </main>
    </div>
  )
}

// ── Root App with routes ──────────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session on load:', session)
      setSession(session)
      setLoading(false)  
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session)
      setSession(session)
      setLoading(false)  
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ color: '#e6edf3', background: '#0d1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={session ? <AppLayout /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App


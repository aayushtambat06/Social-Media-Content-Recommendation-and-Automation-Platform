import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './style.css'
import { DashboardSection } from './sections/DashboardSection'
import { UploadSection } from './sections/UploadSection'
import { ScheduleSection } from './sections/ScheduleSection'
import { AnalyticsSection } from './sections/AnalyticsSection'

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Step 5.1: State = remember which section is selected
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'upload' | 'schedule' | 'analytics'
  >('dashboard')

  // Sync activeSection with URL (so refresh keeps you on the same tab)
  useEffect(() => {
    if (location.pathname === '/upload') {
      setActiveSection('upload')
    } else if (location.pathname === '/schedule') {
      setActiveSection('schedule')
    } else if (location.pathname === '/analytics') {
      setActiveSection('analytics')
    } else {
      // anything else, treat as dashboard
      setActiveSection('dashboard')
    }
  }, [location.pathname])

  // Step 5.3: Derived text = what to show in the main area (based on activeSection)
  const pageTitle =
    activeSection === 'dashboard'
      ? 'Dashboard'
      : activeSection === 'upload'
        ? 'Upload content'
        : activeSection === 'schedule'
          ? 'Schedule'
          : 'Analytics'

  const pageSubtitle =
    activeSection === 'dashboard'
      ? 'Overview of your content, AI suggestions, and performance.'
      : activeSection === 'upload'
        ? 'Upload videos that you want to optimize and publish.'
        : activeSection === 'schedule'
          ? 'Manage when your posts go live across platforms.'
          : 'See how your content performs over time.'

  return (
    <div className="app-container">
      {/* Sidebar on the left */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-title">GROWTH PLATFORM</div>
        </div>

        {/* Step 5.2: Click handlers update state; active item gets the 'active' class */}
        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('dashboard')
              navigate('/')
            }}
          >
            Dashboard
          </div>
          <div
            className={`nav-item ${activeSection === 'upload' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('upload')
              navigate('/upload')
            }}
          >
            Upload
          </div>
          <div
            className={`nav-item ${activeSection === 'schedule' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('schedule')
              navigate('/schedule')
            }}
          >
            Schedule
          </div>
          <div
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('analytics')
              navigate('/analytics')
            }}
          >
            Analytics
          </div>
        </nav>

        <div className="sidebar-footer">
          AI-powered captions, hashtags, and posting strategy.
        </div>
      </aside>

      {/* Main content on the right */}
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

export default App


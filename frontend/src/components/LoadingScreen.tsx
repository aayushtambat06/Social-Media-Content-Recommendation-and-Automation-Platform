// Shown while Supabase auth session is being checked on startup

export function LoadingScreen() {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#030508',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Fira+Code:wght@500&display=swap');
          @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
          @keyframes spin   { to{transform:rotate(360deg)} }
          @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
  
        {/* Logo */}
        <div style={{ animation: 'fadeIn 0.4s ease both', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(99,179,237,0.2), rgba(167,139,250,0.15))',
              border: '1px solid rgba(99,179,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>⚡</div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.18em', color: '#63b3ed', fontFamily: "'Fira Code', monospace" }}>
              TRENDPILOT
            </div>
          </div>
  
          {/* Spinner */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.06)',
            borderTopColor: '#63b3ed',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px',
          }} />
  
          <div style={{ fontSize: 13, color: '#4f5a6e', fontFamily: "'Fira Code', monospace", letterSpacing: '0.04em' }}>
            Loading your workspace…
          </div>
        </div>
      </div>
    )
  }
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

const C = {
  bg:     '#030508',
  bg2:    '#0d1225',
  border: 'rgba(255,255,255,0.06)',
  text:   '#e8edf5',
  text2:  '#8892a4',
  text3:  '#4f5a6e',
  accent: '#63b3ed',
  danger: '#f87171',
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: 320, padding: 40, textAlign: 'center',
        }}>
          {/* Error card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(13,18,37,0.95), rgba(8,12,24,0.98))',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 16, padding: '36px 40px', maxWidth: 480, width: '100%',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>

            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: '-0.01em' }}>
              Something went wrong
            </div>

            <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.65, marginBottom: 20 }}>
              This section crashed unexpectedly. Your data is safe — try refreshing or click the button below to recover.
            </div>

            {/* Error detail */}
            {this.state.error && (
              <div style={{
                background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 20, textAlign: 'left',
              }}>
                <div style={{ fontSize: 10, color: C.danger, fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: 4 }}>
                  ERROR
                </div>
                <div style={{ fontSize: 12, color: C.danger, fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {this.state.error.message}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '9px 20px', borderRadius: 9,
                  background: 'linear-gradient(135deg, rgba(99,179,237,0.18), rgba(99,179,237,0.08))',
                  border: '1px solid rgba(99,179,237,0.35)', color: C.accent,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '9px 20px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                  color: C.text2, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
import { useState } from 'react'

export function UploadSection() {
  // 1) State: remember chosen file name, description, and a fake "AI" result
  const [fileName, setFileName] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  // 2) Handlers: update state when user interacts
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setFileName(file ? file.name : null)
    setStatus(null)
  }

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(event.target.value)
    setStatus(null)
  }

  const handleGenerateClick = () => {
    if (!fileName || !description.trim()) {
      setStatus('Please choose a video and write a short description first.')
      return
    }

    // For now we just pretend we called AI and show a static preview
    setStatus(
      'AI caption preview: Turning your idea into a scroll-stopping post (real AI integration coming soon).',
    )
  }

  return (
    <>
      <h2 className="main-card-title">Upload</h2>
      <p className="main-card-text" style={{ marginBottom: '1rem' }}>
        Choose a video file and add a short description. Later we&apos;ll connect this
        form to the backend and AI.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ fontSize: '0.85rem' }}>
          Video file
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{
              display: 'block',
              marginTop: '0.25rem',
              padding: '0.35rem',
              borderRadius: 8,
              border: '1px solid #1f2937',
              backgroundColor: '#020617',
              color: '#e5e7eb',
            }}
          />
        </label>

        {fileName && (
          <p className="main-card-text" style={{ fontSize: '0.8rem' }}>
            Selected file: <strong>{fileName}</strong>
          </p>
        )}

        <label style={{ fontSize: '0.85rem' }}>
          Short description
          <textarea
            rows={3}
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe your video in one or two sentences..."
            style={{
              display: 'block',
              marginTop: '0.25rem',
              padding: '0.5rem 0.6rem',
              borderRadius: 8,
              border: '1px solid #0f172a',
              backgroundColor: '#020617',
              color: '#e5e7eb',
              resize: 'vertical',
            }}
          />
        </label>

        <button
          type="button"
          onClick={handleGenerateClick}
          style={{
            marginTop: '0.5rem',
            alignSelf: 'flex-start',
            padding: '0.45rem 0.9rem',
            borderRadius: 9999,
            border: '1px solid #0ea5e9',
            background:
              'linear-gradient(to right, rgba(56, 189, 248, 0.15), rgba(59, 130, 246, 0.2))',
            color: '#e5e7eb',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Generate AI caption (fake preview)
        </button>

        {status && (
          <p className="main-card-text" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            {status}
          </p>
        )}
      </div>
    </>
  )
}


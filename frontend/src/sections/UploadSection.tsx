import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function UploadSection() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [platform, setPlatform] = useState<'instagram' | 'youtube'>('instagram')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.startsWith('video/')) {
      setFile(dropped)
    } else {
      setError('Please upload a video file.')
    }
  }

  async function handleUpload() {
    if (!file || !title) {
      setError('Please provide a title and select a video.')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload video to Supabase Storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      // Save metadata to content table
      const { error: dbError } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title,
          description,
          video_url: publicUrl,
          platform,
          status: 'draft'
        })

      if (dbError) throw dbError

      setSuccess('Video uploaded successfully!')
      setFile(null)
      setTitle('')
      setDescription('')

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#4fa3e3' : '#30363d'}`,
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? '#1c2a3a' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        <input
          id="fileInput"
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) setFile(f)
          }}
        />
        {file ? (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</div>
            <div style={{ color: '#e6edf3', fontWeight: 600 }}>{file.name}</div>
            <div style={{ color: '#8b949e', fontSize: '13px', marginTop: '4px' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
            <div style={{ color: '#e6edf3', fontWeight: 600 }}>Drag & drop your video here</div>
            <div style={{ color: '#8b949e', fontSize: '13px', marginTop: '4px' }}>or click to browse</div>
            <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '8px' }}>Max 50MB • MP4, MOV, AVI</div>
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label style={{ display: 'block', color: '#8b949e', fontSize: '13px', marginBottom: '6px' }}>
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter a title for your content"
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '8px',
            color: '#e6edf3',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Description */}
      <div>
        <label style={{ display: 'block', color: '#8b949e', fontSize: '13px', marginBottom: '6px' }}>
          Description <span style={{ color: '#8b949e' }}>(used for AI caption generation)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your video content — the AI will use this to generate captions and hashtags"
          rows={4}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '8px',
            color: '#e6edf3',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Platform */}
      <div>
        <label style={{ display: 'block', color: '#8b949e', fontSize: '13px', marginBottom: '6px' }}>
          Platform
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(['instagram', 'youtube'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: `1px solid ${platform === p ? '#4fa3e3' : '#30363d'}`,
                background: platform === p ? '#1c2a3a' : 'transparent',
                color: platform === p ? '#4fa3e3' : '#8b949e',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div style={{ color: '#f85149', fontSize: '13px', padding: '10px', background: '#2d1515', borderRadius: '6px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: '#3fb950', fontSize: '13px', padding: '10px', background: '#122d1e', borderRadius: '6px' }}>
          {success}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          padding: '12px',
          background: '#4fa3e3',
          border: 'none',
          borderRadius: '8px',
          color: '#0d1117',
          fontSize: '14px',
          fontWeight: 600,
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  )
}

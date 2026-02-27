import { useState } from 'react'

type ScheduledItem = {
  id: number
  title: string
  date: string
  time: string
}

export function ScheduleSection() {
  // Simple local state: form values and scheduled items list
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [items, setItems] = useState<ScheduledItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    if (!date || !time) {
      setError('Please choose a date and time.')
      return
    }

    const safeTitle = title.trim() || 'Untitled post'

    const newItem: ScheduledItem = {
      id: Date.now(),
      title: safeTitle,
      date,
      time,
    }

    setItems((prev) => [...prev, newItem])
    setTitle('')
    setDate('')
    setTime('')
    setError(null)
  }

  return (
    <>
      <h2 className="main-card-title">Schedule</h2>
      <p className="main-card-text" style={{ marginBottom: '1rem' }}>
        Choose a date and time for your post. Right now this only lives in your
        browser, but later we&apos;ll save it to the backend and connect real
        publishing.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ fontSize: '0.85rem' }}>
          Post title (optional)
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setError(null)
            }}
            placeholder="Example: New YouTube short about editing tips"
            style={{
              display: 'block',
              marginTop: '0.25rem',
              padding: '0.4rem 0.6rem',
              borderRadius: 8,
              border: '1px solid #1f2937',
              backgroundColor: '#020617',
              color: '#e5e7eb',
            }}
          />
        </label>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem' }}>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setError(null)
              }}
              style={{
                display: 'block',
                marginTop: '0.25rem',
                padding: '0.35rem 0.6rem',
                borderRadius: 8,
                border: '1px solid #1f2937',
                backgroundColor: '#020617',
                color: '#e5e7eb',
              }}
            />
          </label>

          <label style={{ fontSize: '0.85rem' }}>
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value)
                setError(null)
              }}
              style={{
                display: 'block',
                marginTop: '0.25rem',
                padding: '0.35rem 0.6rem',
                borderRadius: 8,
                border: '1px solid #1f2937',
                backgroundColor: '#020617',
                color: '#e5e7eb',
              }}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          style={{
            marginTop: '0.5rem',
            alignSelf: 'flex-start',
            padding: '0.45rem 0.9rem',
            borderRadius: 9999,
            border: '1px solid #22c55e',
            background:
              'linear-gradient(to right, rgba(34, 197, 94, 0.15), rgba(52, 211, 153, 0.2))',
            color: '#e5e7eb',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Add to schedule
        </button>

        {error && (
          <p
            className="main-card-text"
            style={{ color: '#f97373', fontSize: '0.85rem', marginTop: '0.25rem' }}
          >
            {error}
          </p>
        )}
      </div>

      {items.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 className="main-card-title" style={{ marginBottom: '0.5rem' }}>
            Scheduled posts (local preview)
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: '0.5rem 0.6rem',
                  borderRadius: 8,
                  border: '1px solid #1f2937',
                  backgroundColor: '#020617',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 500 }}>{item.title}</div>
                <div style={{ color: '#9ca3af' }}>
                  {item.date || 'No date'} at {item.time || 'No time'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}


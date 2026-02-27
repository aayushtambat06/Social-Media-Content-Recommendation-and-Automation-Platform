export function AnalyticsSection() {
  // Mock data for Week 1: later we will replace this with real platform metrics
  const posts = [
    {
      id: 1,
      platform: 'Instagram',
      title: '3 editing tricks for Reels',
      views: 12450,
      likes: 860,
      comments: 74,
    },
    {
      id: 2,
      platform: 'YouTube',
      title: 'How to hook viewers in 3 seconds',
      views: 18200,
      likes: 1210,
      comments: 98,
    },
    {
      id: 3,
      platform: 'Instagram',
      title: 'Caption formula that boosts saves',
      views: 9050,
      likes: 640,
      comments: 41,
    },
    {
      id: 4,
      platform: 'YouTube',
      title: 'Hashtag strategy (simple version)',
      views: 7600,
      likes: 520,
      comments: 29,
    },
  ] as const

  const totals = posts.reduce(
    (acc, p) => {
      acc.views += p.views
      acc.likes += p.likes
      acc.comments += p.comments
      return acc
    },
    { views: 0, likes: 0, comments: 0 },
  )

  const avgViews = Math.round(totals.views / posts.length)
  const likeRate = totals.views > 0 ? (totals.likes / totals.views) * 100 : 0
  const commentRate = totals.views > 0 ? (totals.comments / totals.views) * 100 : 0

  // Simple “last 7 days” bar heights (mock)
  const week = [
    { day: 'M', views: 2200 },
    { day: 'T', views: 3100 },
    { day: 'W', views: 1800 },
    { day: 'T', views: 3900 },
    { day: 'F', views: 4200 },
    { day: 'S', views: 3600 },
    { day: 'S', views: 2800 },
  ] as const

  const maxWeekViews = Math.max(...week.map((d) => d.views))

  return (
    <>
      <h2 className="main-card-title">Analytics</h2>
      <p className="main-card-text" style={{ marginBottom: '1rem' }}>
        Week 1 analytics uses mock data. Next we&apos;ll connect Instagram/YouTube APIs
        and replace these numbers with real metrics.
      </p>

      {/* KPI cards */}
      <div className="kpi-grid" style={{ marginBottom: '1rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Total views</div>
          <div className="kpi-value">{totals.views.toLocaleString()}</div>
          <div className="kpi-sub">Across {posts.length} posts</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Average views</div>
          <div className="kpi-value">{avgViews.toLocaleString()}</div>
          <div className="kpi-sub">Per post</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Like rate</div>
          <div className="kpi-value">{likeRate.toFixed(1)}%</div>
          <div className="kpi-sub">Likes / Views</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Comment rate</div>
          <div className="kpi-value">{commentRate.toFixed(2)}%</div>
          <div className="kpi-sub">Comments / Views</div>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="kpi-card" style={{ marginBottom: '1rem' }}>
        <div className="kpi-label">Last 7 days views (mock)</div>
        <div className="bars" aria-label="Bar chart of views last 7 days">
          {week.map((d, idx) => {
            const heightPct = maxWeekViews > 0 ? (d.views / maxWeekViews) * 100 : 0
            return (
              <div
                key={`${d.day}-${idx}`}
                className="bar"
                title={`${d.day}: ${d.views.toLocaleString()} views`}
                style={{ height: `${Math.max(8, heightPct)}%` }}
              />
            )
          })}
        </div>
        <div className="bar-labels" aria-hidden="true">
          {week.map((d, idx) => (
            <div key={`${d.day}-label-${idx}`} className="bar-label">
              {d.day}
            </div>
          ))}
        </div>
      </div>

      {/* Posts table */}
      <div className="kpi-card">
        <div className="kpi-label" style={{ marginBottom: '0.5rem' }}>
          Post performance (mock)
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Post</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className="badge">{p.platform}</span>
                </td>
                <td>{p.title}</td>
                <td>{p.views.toLocaleString()}</td>
                <td>{p.likes.toLocaleString()}</td>
                <td>{p.comments.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}


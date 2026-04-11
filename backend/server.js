// require('dotenv').config()
// console.log('ENV CHECK:', {
//   url: process.env.SUPABASE_URL,
//   key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
//   groq: process.env.GROQ_API_KEY ? 'present' : 'missing',
//   youtube_client: process.env.YOUTUBE_CLIENT_ID ? 'present' : 'missing',
// })

// const express    = require('express')
// const cors       = require('cors')
// const dotenv     = require('dotenv')
// const { createClient } = require('@supabase/supabase-js')
// const { google } = require('googleapis')
// const axios      = require('axios') // <-- Added for downloading video streams

// dotenv.config()

// const app  = express()
// const PORT = process.env.PORT || 3001

// // ─── SUPABASE ─────────────────────────────────────────────────────────────────
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// )

// // ─── YOUTUBE OAUTH SETUP ──────────────────────────────────────────────────────
// const ytOauth2Client = new google.auth.OAuth2(
//   process.env.YOUTUBE_CLIENT_ID,
//   process.env.YOUTUBE_CLIENT_SECRET,
//   process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/auth/youtube/callback'
// )

// // ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
// app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
// app.use(express.json({ limit: '10mb' }))

// // ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
// async function requireAuth(req, res, next) {
//   const authHeader = req.headers.authorization
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Missing Authorization header' })
//   }
//   const token = authHeader.split(' ')[1]
//   const { data: { user }, error } = await supabase.auth.getUser(token)
//   if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' })
//   req.userId    = user.id
//   req.userEmail = user.email
//   next()
// }

// // ─── HEALTH ───────────────────────────────────────────────────────────────────
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() })
// })

// // ─── YOUTUBE OAUTH ROUTES ─────────────────────────────────────────────────────

// app.get('/api/auth/youtube/url', requireAuth, (req, res) => {
//   const url = ytOauth2Client.generateAuthUrl({
//     access_type: 'offline', 
//     prompt: 'consent',
//     state: req.userId,      
//     scope: [
//       'https://www.googleapis.com/auth/youtube.upload',
//       'https://www.googleapis.com/auth/yt-analytics.readonly'
//     ]
//   })
//   res.json({ url })
// })

// app.get('/api/auth/youtube/callback', async (req, res) => {
//   const code = req.query.code
//   const userId = req.query.state 

//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

//   if (!code || !userId) {
//     return res.redirect(`${frontendUrl}/settings?error=missing_params`)
//   }

//   try {
//     const { tokens } = await ytOauth2Client.getToken(code)
    
//     const { error } = await supabase.from('user_integrations').upsert({
//       user_id: userId,
//       platform: 'youtube',
//       access_token: tokens.access_token,
//       refresh_token: tokens.refresh_token,
//       updated_at: new Date().toISOString()
//     }, { onConflict: 'user_id, platform' })

//     if (error) throw error
//     res.redirect(`${frontendUrl}/settings?success=youtube`)
//   } catch (err) {
//     console.error('YouTube OAuth Error:', err)
//     res.redirect(`${frontendUrl}/settings?error=youtube_auth_failed`)
//   }
// })

// // ─── AI: Generate caption + hashtags ─────────────────────────────────────────
// app.post('/api/ai/generate', requireAuth, async (req, res) => {
//   try {
//     const { description, platform = 'Instagram', tone = 'Engaging & casual' } = req.body
//     if (!description?.trim()) return res.status(400).json({ error: 'Description is required' })

//     const apiKey = process.env.GROQ_API_KEY
//     if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY missing in .env' })

//     const prompt = `Generate social media content for a ${platform} post.\n\nVideo description: "${description.trim()}"\nTone: ${tone}\nPlatform: ${platform}\n\nRespond in EXACTLY this format:\nCAPTION:\n[Write a compelling caption here with emojis, 2-4 sentences]\n\nHASHTAGS:\n[List 12-18 hashtags starting with #, space-separated]`

//     const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
//       body: JSON.stringify({
//         model: 'llama-3.1-8b-instant',
//         max_tokens: 1024,
//         temperature: 0.8,
//         messages: [
//           { role: 'system', content: `You are an expert ${platform} content strategist. Always respond strictly in the requested CAPTION/HASHTAGS format.` },
//           { role: 'user',   content: prompt },
//         ],
//       }),
//     })

//     const groqData = await groqRes.json()
//     if (!groqRes.ok) throw new Error(groqData?.error?.message || `Groq error: ${groqRes.status}`)

//     const result       = groqData.choices?.[0]?.message?.content || ''
//     const captionMatch = result.match(/CAPTION:\s*\n([\s\S]*?)(?=\n\s*HASHTAGS:)/i)
//     const hashtagMatch = result.match(/HASHTAGS:\s*\n([\s\S]*?)$/i)
//     const caption      = captionMatch?.[1]?.trim() ?? result.trim()
//     const hashtags     = hashtagMatch
//       ? hashtagMatch[1].trim().split(/[\s,\n]+/).filter(t => t.startsWith('#'))
//       : []

//     return res.json({ caption, hashtags })
//   } catch (err) {
//     return res.status(500).json({ error: err.message || 'AI generation failed' })
//   }
// })

// // ─── PUBLISH: Upload to YouTube (Manual) ─────────────────────────────────────
// app.post('/api/publish/youtube', requireAuth, async (req, res) => {
//   try {
//     const { title, description, tags, privacyStatus = 'private', video_url } = req.body;

//     if (!video_url) {
//       return res.status(400).json({ error: 'Missing video_url.' });
//     }

//     const { data: integration, error } = await supabase
//       .from('user_integrations')
//       .select('refresh_token')
//       .eq('user_id', req.userId)
//       .eq('platform', 'youtube')
//       .single();

//     if (error || !integration) {
//       return res.status(400).json({ error: 'YouTube account not connected.' });
//     }

//     ytOauth2Client.setCredentials({ refresh_token: integration.refresh_token });
//     const youtube = google.youtube({ version: 'v3', auth: ytOauth2Client });

//     const videoMetadata = {
//       snippet: {
//         title: title || 'Automated Upload',
//         description: description,
//         tags: tags || [], 
//         categoryId: '22',
//       },
//       status: { privacyStatus: privacyStatus },
//     };

//     console.log('[YouTube API] Fetching video from Supabase...');
//     const videoResponse = await axios({
//       method: 'GET',
//       url: video_url,
//       responseType: 'stream'
//     });

//     console.log('[YouTube API] Uploading stream to YouTube...');
//     const response = await youtube.videos.insert({
//       part: 'snippet,status',
//       requestBody: videoMetadata,
//       media: { body: videoResponse.data },
//     });

//     return res.json({ 
//       message: 'Video uploaded successfully!', 
//       videoId: response.data.id,
//       youtubeUrl: `https://youtu.be/${response.data.id}`
//     });

//   } catch (err) {
//     console.error('Publishing Error:', err);
//     return res.status(500).json({ error: err.message || 'Failed to upload to YouTube' });
//   }
// });

// // ─── CONTENT: Get all content for user ───────────────────────────────────────
// app.get('/api/content', requireAuth, async (req, res) => {
//   try {
//     const { status, platform } = req.query
//     let query = supabase.from('content').select('*').eq('user_id', req.userId).order('created_at', { ascending: false })
//     if (status)   query = query.eq('status', status)
//     if (platform) query = query.eq('platform', platform)
//     const { data, error } = await query
//     if (error) throw error
//     return res.json({ data })
//   } catch (err) {
//     return res.status(500).json({ error: err.message })
//   }
// })

// // ─── ANALYTICS: Summary ──────────────────────────────────────────────────────
// app.get('/api/analytics/summary', requireAuth, async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('content')
//       .select('id, platform, status, created_at')
//       .eq('user_id', req.userId)

//     if (error) throw error
//     const posts     = data || []
//     const total     = posts.length
//     const published = posts.filter(p => p.status === 'published').length
//     const scheduled = posts.filter(p => p.status === 'scheduled').length
//     const drafts    = posts.filter(p => p.status === 'draft').length

//     const byPlatform = {}
//     posts.forEach(p => { byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1 })

//     const now    = Date.now()
//     const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
//     const days   = {}
//     labels.forEach(d => { days[d] = 0 })
//     posts.forEach(p => {
//       const age = (now - new Date(p.created_at).getTime()) / 86400000
//       if (age <= 7) {
//         const label = labels[new Date(p.created_at).getDay()]
//         days[label] = (days[label] || 0) + 1
//       }
//     })

//     return res.json({
//       total, published, scheduled, drafts, byPlatform,
//       weeklyActivity: labels.map(d => ({ day: d, count: days[d] })),
//     })
//   } catch (err) {
//     return res.status(500).json({ error: err.message })
//   }
// })

// // ─── METRICS: Summary ────────────────────────────────────────────────────────
// app.get('/api/metrics/summary', requireAuth, async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('metrics')
//       .select('platform, views, likes, comments, shares')
//       .eq('user_id', req.userId)

//     if (error) throw error
//     const rows = data || []
//     const totals = rows.reduce((a, r) => ({
//       views:    a.views    + (r.views    || 0),
//       likes:    a.likes    + (r.likes    || 0),
//       comments: a.comments + (r.comments || 0),
//       shares:   a.shares   + (r.shares   || 0),
//     }), { views:0, likes:0, comments:0, shares:0 })

//     const byPlatform = {}
//     rows.forEach(r => {
//       if (!byPlatform[r.platform]) byPlatform[r.platform] = { views:0, likes:0, comments:0, shares:0, posts:0 }
//       byPlatform[r.platform].views    += r.views    || 0
//       byPlatform[r.platform].likes    += r.likes    || 0
//       byPlatform[r.platform].comments += r.comments || 0
//       byPlatform[r.platform].shares   += r.shares   || 0
//       byPlatform[r.platform].posts    += 1
//     })

//     const engagementRate = totals.views > 0
//       ? (((totals.likes + totals.comments) / totals.views) * 100).toFixed(1)
//       : '0'

//     return res.json({ totals, byPlatform, engagementRate, totalPosts: rows.length })
//   } catch (err) {
//     return res.status(500).json({ error: err.message })
//   }
// })

// // ─── METRICS: Get all ────────────────────────────────────────────────────────
// app.get('/api/metrics', requireAuth, async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('metrics')
//       .select('id, platform, views, likes, comments, shares, fetched_at, content:content_id(id, title, platform, status, created_at)')
//       .eq('user_id', req.userId)
//       .order('fetched_at', { ascending: false })

//     if (error) throw error
//     return res.json({ data: data || [] })
//   } catch (err) {
//     return res.status(500).json({ error: err.message })
//   }
// })

// // ─── METRICS: Seed test data ─────────────────────────────────────────────────
// app.post('/api/metrics/seed', requireAuth, async (req, res) => {
//   try {
//     const { data: posts, error } = await supabase
//       .from('content')
//       .select('id, platform')
//       .eq('user_id', req.userId)
//       .eq('status', 'published')

//     if (error) throw error
//     if (!posts || posts.length === 0) {
//       return res.status(400).json({ error: 'No published posts found. Mark some content as published first.' })
//     }

//     const ranges = {
//       instagram: { views:[3000,25000], likes:[200,2000], comments:[20,300], shares:[10,200] },
//       youtube:   { views:[5000,50000], likes:[300,4000], comments:[30,500], shares:[20,400] },
//       twitter:   { views:[500,10000],  likes:[50,800],   comments:[5,150],  shares:[20,500] },
//     }
//     const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

//     const toInsert = posts.map(p => {
//       const r = ranges[p.platform] || ranges.instagram
//       return {
//         content_id: p.id,
//         user_id:    req.userId,
//         platform:   p.platform,
//         views:      rand(...r.views),
//         likes:      rand(...r.likes),
//         comments:   rand(...r.comments),
//         shares:     rand(...r.shares),
//         fetched_at: new Date().toISOString(),
//       }
//     })

//     const { data, error: upsertError } = await supabase
//       .from('metrics')
//       .upsert(toInsert, { onConflict: 'content_id' })
//       .select()

//     if (upsertError) throw upsertError
//     return res.json({ message: `Seeded metrics for ${data?.length || 0} posts`, data })
//   } catch (err) {
//     return res.status(500).json({ error: err.message })
//   }
// })

// const cron = require('node-cron');

// // ─── AUTONOMOUS PUBLISHING WORKER ─────────────────────────────────────────────
// cron.schedule('* * * * *', async () => {
//   console.log(`[Worker] Checking for scheduled posts at ${new Date().toISOString()}...`);
  
//   try {
//     const now = new Date();
//     const oneMinuteAgo = new Date(now.getTime() - 60000); 

//     const { data: duePosts, error } = await supabase
//       .from('content')
//       .select('*')
//       .eq('status', 'scheduled')
//       .lte('scheduled_at', now.toISOString()) 
//       .gte('scheduled_at', oneMinuteAgo.toISOString()); 

//     if (error) throw error;

//     if (!duePosts || duePosts.length === 0) {
//       return; 
//     }

//     console.log(`[Worker] Found ${duePosts.length} posts to publish!`);

//     for (const post of duePosts) {
//       console.log(`[Worker] Publishing post ID: ${post.id} to ${post.platform}...`);

//       if (post.platform === 'youtube') {
        
//         const { data: integration } = await supabase
//           .from('user_integrations')
//           .select('refresh_token')
//           .eq('user_id', post.user_id)
//           .eq('platform', 'youtube')
//           .single();

//         if (integration && integration.refresh_token && post.video_url) {
//           try {
//             ytOauth2Client.setCredentials({ refresh_token: integration.refresh_token });
//             const youtube = google.youtube({ version: 'v3', auth: ytOauth2Client });

//             const videoMetadata = {
//               snippet: {
//                 title: post.title,
//                 description: post.description || 'Automated via Trendpilot',
//                 categoryId: '22',
//               },
//               status: { privacyStatus: 'private' }, 
//             };

//             console.log(`[Worker] Fetching video stream for ${post.id}...`);
//             const videoResponse = await axios({
//               method: 'GET',
//               url: post.video_url,
//               responseType: 'stream'
//             });

//             console.log(`[Worker] Uploading ${post.id} to YouTube...`);
//             const response = await youtube.videos.insert({
//               part: 'snippet,status',
//               requestBody: videoMetadata,
//               media: { body: videoResponse.data }
//             });
            
//             await supabase
//               .from('content')
//               .update({ status: 'published' })
//               .eq('id', post.id);

//             console.log(`[Worker] Successfully published post: ${post.id}. Video ID: ${response.data.id}`);

//           } catch (ytError) {
//             console.error(`[Worker] YouTube API error for post ${post.id}:`, ytError.message || ytError);
//           }
//         } else {
//           console.error(`[Worker] Missing tokens or video_url for post ${post.id}`);
//         }
//       }
//     }
//   } catch (err) {
//     console.error('[Worker] Error during cron execution:', err);
//   }
// });

// // ─── START ────────────────────────────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`✅ TrendPilot backend running on http://localhost:${PORT}`)
//   console.log(`   Health: http://localhost:${PORT}/health`)
// })


require('dotenv').config()
console.log('ENV CHECK:', {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
  groq: process.env.GROQ_API_KEY ? 'present' : 'missing',
  youtube_client: process.env.YOUTUBE_CLIENT_ID ? 'present' : 'missing',
})

const express    = require('express')
const cors       = require('cors')
const dotenv     = require('dotenv')
const { createClient } = require('@supabase/supabase-js')
const { google } = require('googleapis')
const axios      = require('axios') // <-- Added for downloading video streams

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── YOUTUBE OAUTH SETUP ──────────────────────────────────────────────────────
const ytOauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/auth/youtube/callback'
)

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }))

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' })
  req.userId    = user.id
  req.userEmail = user.email
  next()
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── YOUTUBE OAUTH ROUTES ─────────────────────────────────────────────────────

app.get('/api/auth/youtube/url', requireAuth, (req, res) => {
  const url = ytOauth2Client.generateAuthUrl({
    access_type: 'offline', 
    prompt: 'consent',
    state: req.userId,      
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ]
  })
  res.json({ url })
})

app.get('/api/auth/youtube/callback', async (req, res) => {
  const code = req.query.code
  const userId = req.query.state 

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  if (!code || !userId) {
    return res.redirect(`${frontendUrl}/settings?error=missing_params`)
  }

  try {
    const { tokens } = await ytOauth2Client.getToken(code)
    
    const { error } = await supabase.from('user_integrations').upsert({
      user_id: userId,
      platform: 'youtube',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, platform' })

    if (error) throw error
    res.redirect(`${frontendUrl}/settings?success=youtube`)
  } catch (err) {
    console.error('YouTube OAuth Error:', err)
    res.redirect(`${frontendUrl}/settings?error=youtube_auth_failed`)
  }
})

// ─── AI: Generate caption + hashtags ─────────────────────────────────────────
app.post('/api/ai/generate', requireAuth, async (req, res) => {
  try {
    const { description, platform = 'Instagram', tone = 'Engaging & casual' } = req.body
    if (!description?.trim()) return res.status(400).json({ error: 'Description is required' })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY missing in .env' })

    const prompt = `Generate social media content for a ${platform} post.\n\nVideo description: "${description.trim()}"\nTone: ${tone}\nPlatform: ${platform}\n\nRespond in EXACTLY this format:\nCAPTION:\n[Write a compelling caption here with emojis, 2-4 sentences]\n\nHASHTAGS:\n[List 12-18 hashtags starting with #, space-separated]`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1024,
        temperature: 0.8,
        messages: [
          { role: 'system', content: `You are an expert ${platform} content strategist. Always respond strictly in the requested CAPTION/HASHTAGS format.` },
          { role: 'user',   content: prompt },
        ],
      }),
    })

    const groqData = await groqRes.json()
    if (!groqRes.ok) throw new Error(groqData?.error?.message || `Groq error: ${groqRes.status}`)

    const result       = groqData.choices?.[0]?.message?.content || ''
    const captionMatch = result.match(/CAPTION:\s*\n([\s\S]*?)(?=\n\s*HASHTAGS:)/i)
    const hashtagMatch = result.match(/HASHTAGS:\s*\n([\s\S]*?)$/i)
    const caption      = captionMatch?.[1]?.trim() ?? result.trim()
    const hashtags     = hashtagMatch
      ? hashtagMatch[1].trim().split(/[\s,\n]+/).filter(t => t.startsWith('#'))
      : []

    return res.json({ caption, hashtags })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'AI generation failed' })
  }
})

// ─── PUBLISH: Upload to YouTube (Manual) ─────────────────────────────────────
app.post('/api/publish/youtube', requireAuth, async (req, res) => {
  try {
    const { title, description, tags, privacyStatus = 'private', video_url } = req.body;

    if (!video_url) {
      return res.status(400).json({ error: 'Missing video_url.' });
    }

    const { data: integration, error } = await supabase
      .from('user_integrations')
      .select('refresh_token')
      .eq('user_id', req.userId)
      .eq('platform', 'youtube')
      .single();

    if (error || !integration) {
      return res.status(400).json({ error: 'YouTube account not connected.' });
    }

    ytOauth2Client.setCredentials({ refresh_token: integration.refresh_token });
    const youtube = google.youtube({ version: 'v3', auth: ytOauth2Client });

    const videoMetadata = {
      snippet: {
        title: title || 'Automated Upload',
        description: description,
        tags: tags || [], 
        categoryId: '22',
      },
      status: { privacyStatus: privacyStatus },
    };

    console.log('[YouTube API] Fetching video from Supabase...');
    const videoResponse = await axios({
      method: 'GET',
      url: video_url,
      responseType: 'stream'
    });

    console.log('[YouTube API] Uploading stream to YouTube...');
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: videoMetadata,
      media: { body: videoResponse.data },
    });

    return res.json({ 
      message: 'Video uploaded successfully!', 
      videoId: response.data.id,
      youtubeUrl: `https://youtu.be/${response.data.id}`
    });

  } catch (err) {
    console.error('Publishing Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload to YouTube' });
  }
});

// ─── CONTENT: Get all content for user ───────────────────────────────────────
app.get('/api/content', requireAuth, async (req, res) => {
  try {
    const { status, platform } = req.query
    let query = supabase.from('content').select('*').eq('user_id', req.userId).order('created_at', { ascending: false })
    if (status)   query = query.eq('status', status)
    if (platform) query = query.eq('platform', platform)
    const { data, error } = await query
    if (error) throw error
    return res.json({ data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ─── ANALYTICS: Summary ──────────────────────────────────────────────────────
app.get('/api/analytics/summary', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('id, platform, status, created_at')
      .eq('user_id', req.userId)

    if (error) throw error
    const posts     = data || []
    const total     = posts.length
    const published = posts.filter(p => p.status === 'published').length
    const scheduled = posts.filter(p => p.status === 'scheduled').length
    const drafts    = posts.filter(p => p.status === 'draft').length

    const byPlatform = {}
    posts.forEach(p => { byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1 })

    const now    = Date.now()
    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const days   = {}
    labels.forEach(d => { days[d] = 0 })
    posts.forEach(p => {
      const age = (now - new Date(p.created_at).getTime()) / 86400000
      if (age <= 7) {
        const label = labels[new Date(p.created_at).getDay()]
        days[label] = (days[label] || 0) + 1
      }
    })

    return res.json({
      total, published, scheduled, drafts, byPlatform,
      weeklyActivity: labels.map(d => ({ day: d, count: days[d] })),
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ─── METRICS: Summary ────────────────────────────────────────────────────────
app.get('/api/metrics/summary', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('metrics')
      .select('platform, views, likes, comments, shares')
      .eq('user_id', req.userId)

    if (error) throw error
    const rows = data || []
    const totals = rows.reduce((a, r) => ({
      views:    a.views    + (r.views    || 0),
      likes:    a.likes    + (r.likes    || 0),
      comments: a.comments + (r.comments || 0),
      shares:   a.shares   + (r.shares   || 0),
    }), { views:0, likes:0, comments:0, shares:0 })

    const byPlatform = {}
    rows.forEach(r => {
      if (!byPlatform[r.platform]) byPlatform[r.platform] = { views:0, likes:0, comments:0, shares:0, posts:0 }
      byPlatform[r.platform].views    += r.views    || 0
      byPlatform[r.platform].likes    += r.likes    || 0
      byPlatform[r.platform].comments += r.comments || 0
      byPlatform[r.platform].shares   += r.shares   || 0
      byPlatform[r.platform].posts    += 1
    })

    const engagementRate = totals.views > 0
      ? (((totals.likes + totals.comments) / totals.views) * 100).toFixed(1)
      : '0'

    return res.json({ totals, byPlatform, engagementRate, totalPosts: rows.length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ─── METRICS: Get all ────────────────────────────────────────────────────────
app.get('/api/metrics', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('metrics')
      .select('id, platform, views, likes, comments, shares, fetched_at, content:content_id(id, title, platform, status, created_at)')
      .eq('user_id', req.userId)
      .order('fetched_at', { ascending: false })

    if (error) throw error
    return res.json({ data: data || [] })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ─── METRICS: Seed test data ─────────────────────────────────────────────────
app.post('/api/metrics/seed', requireAuth, async (req, res) => {
  try {
    const { data: posts, error } = await supabase
      .from('content')
      .select('id, platform')
      .eq('user_id', req.userId)
      .eq('status', 'published')

    if (error) throw error
    if (!posts || posts.length === 0) {
      return res.status(400).json({ error: 'No published posts found. Mark some content as published first.' })
    }

    const ranges = {
      instagram: { views:[3000,25000], likes:[200,2000], comments:[20,300], shares:[10,200] },
      youtube:   { views:[5000,50000], likes:[300,4000], comments:[30,500], shares:[20,400] },
      twitter:   { views:[500,10000],  likes:[50,800],   comments:[5,150],  shares:[20,500] },
    }
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    const toInsert = posts.map(p => {
      const r = ranges[p.platform] || ranges.instagram
      return {
        content_id: p.id,
        user_id:    req.userId,
        platform:   p.platform,
        views:      rand(...r.views),
        likes:      rand(...r.likes),
        comments:   rand(...r.comments),
        shares:     rand(...r.shares),
        fetched_at: new Date().toISOString(),
      }
    })

    const { data, error: upsertError } = await supabase
      .from('metrics')
      .upsert(toInsert, { onConflict: 'content_id' })
      .select()

    if (upsertError) throw upsertError
    return res.json({ message: `Seeded metrics for ${data?.length || 0} posts`, data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ TrendPilot backend running on http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
})
# AI-Powered Social Media Growth Platform
## Detailed Development Roadmap

---

## 1. Project Overview

### Problem Statement
Current multi-platform automation tools focus on posting without optimizing content quality or engagement. Creators lack data-driven guidance to improve reach.

### Solution
An AI-powered growth platform that:
- Analyzes videos and creator performance
- Generates intelligent captions, hashtags, and optimal posting times
- Automates publishing to Instagram and YouTube
- Provides data-driven recommendations for reach and engagement

### Target Users
Students and small creators seeking an intelligent, cost-effective growth tool.

---

## 2. Tech Stack (Free-First Approach)

| Layer | Primary Choice | Free Alternative | Notes |
|-------|----------------|------------------|-------|
| **Frontend** | React + Vite | Create React App | Simple SPA, fast dev setup |
| **Language** | TypeScript | JavaScript | Type safety, better DX |
| **Backend** | Node.js + Express (simple REST API) | Supabase Edge Functions | Lightweight API layer |
| **Database** | Supabase (PostgreSQL) | Neon, Turso, SQLite | 500MB free, auth included |
| **Auth** | Supabase Auth | Firebase Auth | OAuth, email, magic link |
| **File Storage** | Supabase Storage | Cloudflare R2, local | 1GB free |
| **AI** | Google AI Studio (Gemini) | Groq, Hugging Face, Ollama | Free tier, 60 req/min |
| **Styling** | Tailwind CSS + simple component libs | Chakra UI, MUI | Free, easier than custom design |
| **Charts** | Recharts | Chart.js, Tremor | Free, React-native |
| **Hosting (frontend)** | Vercel (static React build) | Netlify, Cloudflare Pages | 100GB bandwidth free |
| **Hosting (backend)** | Render / Railway (Node) | Fly.io, Supabase functions | Free tiers available |
| **Version Control** | GitHub | — | Free for students |

### 100% Free Stack Summary
- **Frontend:** React + Vite (SPA) hosted on Vercel/Netlify
- **Backend:** Simple Node.js + Express API (or Supabase Edge Functions)
- **Database & Auth:** Supabase
- **AI:** Google AI Studio (Gemini) or Groq
- **Storage:** Supabase Storage or local uploads
- **APIs:** Meta Graph API, YouTube Data API (both free tiers)

---

## 3. Feature Scope (MVP)

### Must Have (Weeks 1–4)
| # | Feature | Description |
|---|---------|-------------|
| 1 | User auth | Sign up, sign in (email + OAuth) |
| 2 | Video upload | Accept video files, store metadata |
| 3 | AI caption generation | Generate captions via Gemini/Groq |
| 4 | Hashtag suggestions | Platform-specific hashtag recommendations |
| 5 | Content scheduling | Pick date/time, view calendar |
| 6 | Publishing | Instagram (or copy-to-clipboard fallback) |
| 7 | Basic analytics | Views, likes, comments dashboard |
| 8 | Best-time hint | Simple "best time to post" suggestion |

### Nice to Have (Week 5+)
- YouTube publishing
- Posting-time optimization (ML or rules)
- A/B caption experiments
- Multi-creator / team support

---

## 4. Development Pathway (5 Weeks)

---

### Week 1: Foundation & Auth

**Goal:** Project setup, database, authentication, basic dashboard

| Day | Task | Deliverable | Free Tools Used |
|-----|------|-------------|-----------------|
| 1 | Initialize React project | `npm create vite@latest` (React + TS) | React, Vite |
| 1 | Set up Tailwind | Basic styling ready | Tailwind |
| 2 | Create Supabase project | DB + Auth ready | Supabase |
| 2 | Configure environment variables | `.env` in React + backend | — |
| 3 | Implement Supabase Auth | Sign up, sign in, OAuth | Supabase Auth |
| 3 | Add simple route protection in React | Redirect to login if not authenticated | React Router / custom routing |
| 4 | Build basic dashboard layout | Sidebar, header | Tailwind + simple components |
| 4 | Create user profile fetch | Display user info | Supabase JS client |
| 5 | Connect Meta & YouTube OAuth (apps) | App IDs, redirects | Meta Dev, Google Cloud |

**Deliverables:**
- [ ] Users can sign up and sign in
- [ ] Protected dashboard accessible after login
- [ ] Supabase project configured
- [ ] Meta and Google OAuth apps created (or documented)

**Free Options Checklist:**
- [ ] Supabase (500MB DB, auth)
- [ ] Vercel for preview deploys
- [ ] GitHub for version control

---

### Week 2: Video Upload & AI Content

**Goal:** Upload videos, generate captions and hashtags with AI

| Day | Task | Deliverable | Free Tools Used |
|-----|------|-------------|-----------------|
| 1 | Design content schema | `content` table in Supabase | Supabase, SQL |
| 1 | Implement file upload endpoint | `/upload` in Express backend (or Supabase function) | Node.js, Express / Supabase |
| 2 | Integrate Supabase Storage | Store video files | Supabase Storage (1GB free) |
| 2 | Build upload UI in React | Drag-drop or file picker | React, Tailwind |
| 3 | Add Google AI Studio (Gemini) API | Backend endpoint for AI calls | Gemini API (free tier) |
| 3 | Implement caption generation | Prompt + response handling | Gemini |
| 4 | Implement hashtag generation | Platform-aware hashtags | Gemini |
| 4 | Add edit-in-place for captions | Editable text area | React state |
| 5 | Add copy-to-clipboard | Copy caption + hashtags | Clipboard API |
| 5 | Content list view | List uploaded content | Supabase query from React |

**Deliverables:**
- [ ] Video upload with progress
- [ ] AI-generated captions and hashtags
- [ ] Editable captions before publishing
- [ ] Copy-to-clipboard for manual posting
- [ ] Content list in dashboard

**Free Options Checklist:**
- [ ] Supabase Storage (1GB)
- [ ] Google AI Studio / Gemini (60 req/min)
- [ ] Alternative: Groq or Ollama if Gemini unavailable

---

### Week 3: Scheduling & Publishing

**Goal:** Schedule content, publish to Instagram (or copy fallback)

| Day | Task | Deliverable | Free Tools Used |
|-----|------|-------------|-----------------|
| 1 | Add schedule fields to content | `scheduled_at`, `status` | Supabase migration |
| 1 | Build scheduling UI in React | Date/time picker | React date picker + Tailwind |
| 2 | Content calendar view | Week/month view | Recharts or custom grid |
| 2 | Status states | draft, scheduled, published, failed | Enum, badges |
| 3 | Meta Graph API integration | Backend route to post to Instagram | Meta Graph API, Express |
| 3 | Handle OAuth token refresh | Long-lived tokens | Supabase or custom |
| 4 | Implement publish endpoint | `/publish/instagram` in Express | Node.js, Express |
| 4 | Error handling & retries | User-friendly errors | Try/catch, toast |
| 5 | Fallback: copy-to-clipboard flow | If API fails or not approved | Clipboard API |
| 5 | Optional: cron for scheduled posts | Cron job hitting backend | GitHub Actions / cron-job.org |

**Deliverables:**
- [ ] Content calendar
- [ ] Schedule date/time for posts
- [ ] Publish to Instagram (or copy fallback)
- [ ] Clear success/error feedback
- [ ] Optional: automated scheduled publishing

**Free Options Checklist:**
- [ ] Meta Graph API (free, app review for some features)
- [ ] Vercel Cron or GitHub Actions for scheduling
- [ ] Copy-to-clipboard as no-cost fallback

---

### Week 4: Analytics & Intelligence

**Goal:** Fetch metrics, build dashboard, suggest best posting times

| Day | Task | Deliverable | Free Tools Used |
|-----|------|-------------|-----------------|
| 1 | Fetch Instagram insights | Backend call to Meta Graph API | Meta Graph API, Express |
| 1 | Fetch YouTube analytics (optional) | Backend call to YouTube Data API | YouTube API |
| 2 | Store metrics in DB | `metrics` or `insights` table | Supabase |
| 2 | Metrics sync job | Cron or on-demand | GitHub Actions / cron-job.org |
| 3 | Build analytics dashboard in React | Views, likes, comments charts | Recharts |
| 3 | Per-post performance | Table with metrics | Simple React table + Tailwind |
| 4 | Best-time logic | Average top-performing hours | SQL, JS |
| 4 | Recommendations section | "Post Tue 6–8pm" style hints | Static or rule-based |
| 5 | Creator performance summary | Totals, trends | Recharts LineChart |
| 5 | Empty states & loading | UX polish | Skeleton, empty message |

**Deliverables:**
- [ ] Analytics dashboard with charts
- [ ] Per-post metrics (views, likes, comments)
- [ ] Best-time-to-post suggestion
- [ ] Creator performance overview
- [ ] Graceful empty/loading states

**Free Options Checklist:**
- [ ] Meta Graph API (insights)
- [ ] Recharts (free)
- [ ] Mock data for development if API limited

---

### Week 5: Polish, Deploy & Launch

**Goal:** Testing, documentation, deployment, demo preparation

| Day | Task | Deliverable | Free Tools Used |
|-----|------|-------------|-----------------|
| 1 | Error boundaries | Graceful error handling | React error boundary |
| 1 | Loading states | Skeletons, spinners | Custom Skeleton components with Tailwind |
| 2 | Input validation | Form validation (Zod) | Zod (free) |
| 2 | Rate limiting | Protect API routes | Simple in-memory or middleware in Express |
| 3 | E2E smoke tests (optional) | Key flows | Playwright (free) |
| 3 | README + setup instructions | Onboarding doc | Markdown |
| 4 | Production deploy (frontend) | React build to Vercel/Netlify | Vercel / Netlify |
| 4 | Production deploy (backend) | Node API to Render/Railway | Render / Railway |
| 5 | Demo script | 5-min walkthrough | Slides or doc |
| 5 | Beta feedback form | Google Form or similar | Google Forms (free) |

**Deliverables:**
- [ ] Deployed app on Vercel
- [ ] README with setup steps
- [ ] Demo script for presentation
- [ ] Basic error handling and validation

**Free Options Checklist:**
- [ ] Vercel (100GB bandwidth)
- [ ] GitHub Actions (optional CI)
- [ ] Sentry (5K errors/month) for monitoring

---

## 5. Database Schema (Supabase)

```sql
-- Users (handled by Supabase Auth, extend with profiles if needed)
-- profiles: id, user_id, display_name, avatar_url, created_at

-- Content
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  video_url TEXT,
  caption TEXT,
  hashtags TEXT[],
  platform TEXT DEFAULT 'instagram', -- 'instagram' | 'youtube'
  status TEXT DEFAULT 'draft',       -- draft | scheduled | published | failed
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics (from platform APIs)
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  platform TEXT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform connections (OAuth tokens)
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT,  -- 'instagram' | 'youtube'
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. API Routes Structure

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts           (login, logout if needed)
│   │   ├── upload.ts         (file uploads)
│   │   ├── ai.ts             (captions, hashtags)
│   │   ├── content.ts        (CRUD for content)
│   │   ├── publish.ts        (Instagram publish)
│   │   └── analytics.ts      (metrics, best time)
```

### Frontend (React)

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Upload.tsx
│   │   ├── Schedule.tsx
│   │   └── Analytics.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── UploadForm.tsx
│   │   └── Calendar.tsx
```

---

## 7. Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (choose one) - used on backend
GOOGLE_AI_API_KEY=          # Google AI Studio / Gemini
# GROQ_API_KEY=             # Alternative: Groq

# Meta (Instagram) - backend
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=

# YouTube (optional) - backend
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

---

## 8. Team Roles (2–4 Students)

| Role | Responsibilities | Suggested Owner |
|------|------------------|-----------------|
| **Frontend** | UI, forms, dashboard, charts | Student 1 |
| **Backend** | API routes, DB, Supabase | Student 2 |
| **AI & Integrations** | Gemini, Meta API, YouTube API | Student 3 |
| **DevOps & QA** | Deploy, docs, testing | Student 4 (or shared) |

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Meta/YouTube API approval delays | Use copy-to-clipboard fallback from Week 2 |
| Gemini rate limits | Cache responses, use Groq/Ollama as backup |
| Supabase free tier limits | Monitor usage; use SQLite/Turso if needed |
| Video size limits | Enforce max file size (e.g. 50MB); compress or stream |
| OAuth token expiry | Implement refresh flow; store in `platform_connections` |

---

## 10. Success Criteria

| Week | Success Metric |
|------|----------------|
| 1 | User can sign up, log in, see dashboard |
| 2 | User can upload video, get AI captions + hashtags, copy to clipboard |
| 3 | User can schedule content and publish to Instagram (or use copy flow) |
| 4 | User can view analytics and best-time recommendations |
| 5 | App deployed, documented, demo-ready |

---

## 11. Post-MVP Roadmap (Future)

- [ ] YouTube publishing
- [ ] Posting-time optimization (ML or richer rules)
- [ ] A/B caption experiments
- [ ] Multi-creator / team workspaces
- [ ] Email digest of performance
- [ ] Mobile-responsive PWA

---

*Last updated: February 2025*

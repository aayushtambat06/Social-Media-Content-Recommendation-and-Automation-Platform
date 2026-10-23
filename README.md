Trendpilot

An AI-Powered Social Media Copilot & Content Automation Pipeline

Trendpilot is a full-stack social media management dashboard built to automate the content creation pipeline. Designed with "frugal engineering" principles for a college-level MVP, it tackles the heavy lifting of handling massive video files, writing engaging captions via AI, and streamlining the publishing process—all while maintaining a highly cost-optimized, secure, and scalable cloud architecture.

🚀 Key Features

AI Content Generation: Integrates with the Groq LLM to instantly generate platform-specific captions, trending hashtags, and tone-matched copy based on a brief video description.

Direct-to-Cloud Uploads: Bypasses the Node.js backend entirely during file selection, pushing gigabytes of video directly from the React client to Supabase Storage to prevent server memory crashes (OOM).

Memory-Safe YouTube Publishing: Utilizes Node.js data streams to pipe video files directly from the Supabase bucket to the YouTube Data API. The server never buffers the full video into RAM.

Stateless Authentication: Uses Google OAuth 2.0 and Supabase JWTs. Passwords are never handled or stored in the database, ensuring zero-liability user security.

Human-in-the-Loop (HITL) Scheduling: A frontend-driven scheduling system that alerts users when their audience is most active, eliminating the need for expensive 24/7 backend cron workers (like AWS EC2).

🛠️ Tech Stack

Frontend

React.js (Single Page Application)

TypeScript (For enterprise-grade type safety and API contracts)

Custom CSS (Lightweight, utility-driven responsive design without bulky frameworks)

Backend

Node.js & Express.js (REST API)

Groq API (LLM for AI caption generation)

YouTube Data API v3 (Direct video publishing)

Database & Cloud Services

Supabase PostgreSQL (Relational data modeling with B-Tree indexing)

Supabase Storage (S3-compatible object storage for heavy media)

Supabase Auth (Stateless JWT session management)

🏗️ System Architecture

The 'Delivery Truck' Bypass: When a user uploads a video, the React UI sends the file directly to Supabase Storage. The backend is completely bypassed, keeping the Node server lightweight and fast.

The 'Straw' Streaming Method: When publishing to YouTube, the Node backend creates a readable HTTP stream from the Supabase URL and pipes it into YouTube's servers in small chunks. The server uses almost zero memory, regardless of video size.

Cost-Optimized Frugal Engineering: By utilizing Supabase's generous free tier and replacing backend cron jobs with an active frontend monitoring system, Trendpilot achieves enterprise-grade automation on a strict startup budget.

⚙️ Getting Started

Prerequisites

Node.js (v18 or higher)

A Supabase project (URL and Anon Key)

A Groq API Key

Google Cloud Console Project (with YouTube Data API v3 enabled and OAuth credentials)

Environment Variables

Create a .env file in the root of both the client and server directories.

Frontend (client/.env)

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001


Backend (server/.env)

PORT=3001
GROQ_API_KEY=your_groq_api_key
YOUTUBE_CLIENT_ID=your_google_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_google_oauth_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/auth/youtube/callback
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key


Installation

Clone the repository:

git clone https://github.com/yourusername/trendpilot.git
cd trendpilot


Install Backend Dependencies & Start:

cd server
npm install
npm run dev


Install Frontend Dependencies & Start:

cd ../client
npm install
npm run dev


View the App:
Open http://localhost:5173 in your browser.

🔮 Future Scope (Phase 2)

Multi-Platform Integration: Extend the existing robust OAuth infrastructure to support the Meta Graph API (Instagram Reels) and the X API v2 (Twitter).

Fully Automated Workers: Transition the HITL scheduler to a distributed message queue (e.g., BullMQ with Redis or AWS EventBridge) for 24/7 background publishing once cloud budget constraints are removed.

Advanced Analytics: Implement webhooks to pull real-time engagement data directly from published platforms back into the dashboard.

# SkillGap - AI Career Assistant

SkillGap is an intelligent, AI-powered career assistant designed to help professionals parse their resumes, discover missing skills for target jobs, and track their applications out of a sleek, dark/light-mode optimized dashboard.

## Features

- **Resume Parsing**: Upload your resume (PDF) and let AI extract key skills, experiences, and structured data automatically.
- **AI Job Matching**: Compare your resume against a specific job description to get a Match Score, uncover missing skills, and receive actionable recommendations.
- **Application Tracker**: Keep track of the jobs you've applied to, update their statuses (Applied, Interviewing, Offer, Rejected), and monitor your overall progress.
- **Job Board**: A featured job board (with a built-in mock/seed generator) where you can explore opportunities and save them.
- **Modern UI**: A fully responsive, accessible, and theme-able interface built with Tailwind CSS, explicitly supporting both premium Light and Dark modes seamlessly across actions.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **Database / Auth / Storage**: Supabase (PostgreSQL, Row Level Security)
- **AI & Processing**: OpenAI API (`gpt-4o-mini`), pdf.js (for client-side/server-side parsing)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A [Supabase](https://supabase.com/) account
- An [OpenAI](https://openai.com/) API Key for AI resume analysis

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/skillgap.git
   cd skillgap
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```
   *(Note: Without an OpenAI API key, the app will gracefully fall back to mock AI responses for demonstration purposes).*

4. **Database Setup**:
   Copy the contents of `supabase/schema.sql` and execute them in your Supabase project's SQL Editor. This will set up the necessary tables (`profiles`, `resumes`, `jobs`, `applications`, `job_analyses`), Triggers, Storage Buckets, and Row Level Security (RLS) policies.

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Acknowledgments
- Font optimization provided by Vercel utilizing the Geist font family.
- Icons by Lucide.

# SkillGap - AI Career Assistant

SkillGap is an intelligent, AI-powered career assistant designed to help professionals parse their resumes, discover missing skills for target jobs, and track their applications out of a sleek, dark/light-mode optimized dashboard.

## Features

- **Resume Parsing**: Upload your resume (PDF) and let AI extract key skills, experiences, and structured data automatically.
- **AI Job Matching**: Compare your resume against a specific job description to get a Match Score, uncover missing skills, and receive actionable recommendations.
- **Custom Learning Paths**: Automatically generate a comprehensive syllabus and step-by-step roadmap tailored specifically to bridge your identified skill gaps for a target job.
- **AI Mock Interview Simulator**: Practice your interview skills with an interactive, Gemini-powered chat simulator that plays the role of a technical recruiter, asks targeted questions based on your resume, and provides a final grade and constructive feedback.
- **Application Tracker**: Keep track of the jobs you've applied to, update their statuses (Applied, Interviewing, Offer, Rejected), and monitor your overall progress.
- **Modern UI**: A fully responsive, accessible, and theme-able interface built with Tailwind CSS, explicitly supporting both premium Light and Dark modes seamlessly across actions.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **Database / Auth / Storage**: Supabase (PostgreSQL, Row Level Security)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`), pdf.js (for client-side/server-side parsing)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A [Supabase](https://supabase.com/) account
- A [Google AI Studio](https://aistudio.google.com/) API Key for Gemini API

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Anish0104/skillgap.git
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
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Database Setup**:
   Execute the migration queries located in `supabase/migrations/` in your Supabase project's SQL Editor sequentially (e.g. `001_add_ai_features.sql`). This will set up the necessary tables (`profiles`, `resumes`, `jobs`, `applications`, `learning_paths`, `mock_interviews`), along with Row Level Security (RLS) policies.

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Acknowledgments
- Font optimization provided by Vercel utilizing the Geist font family.
- Icons by Lucide.

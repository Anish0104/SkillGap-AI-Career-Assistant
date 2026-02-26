
import React from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    FileText,
    Search,
    TrendingUp,
    Sparkles,
    Briefcase,
    Plus,
    Clock,
    CheckCircle2
} from "lucide-react"
import JobCard from "@/components/dashboard/JobCard"

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    color: 'blue' | 'indigo' | 'violet' | 'emerald';
}

interface ActivityItemProps {
    icon: React.ReactNode;
    text: string;
    time: string;
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch real stats
    const { count: resumeCount } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    const { count: applicationCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch jobs with their applications
    const { data: rawJobs } = await supabase
        .from('jobs')
        .select(`
            *,
            applications (
                id,
                user_id
            )
        `)
        .order('created_at', { ascending: false })
        .limit(3)

    // Compute average match score
    const { data: analyses } = await supabase
        .from('job_analyses')
        .select('match_score')
        .eq('resume_id', resumes?.[0]?.id || '')

    let avgMatchScore = 'N/A'
    if (analyses && analyses.length > 0) {
        const validScores = analyses.filter(a => typeof a.match_score === 'number')
        if (validScores.length > 0) {
            const avg = Math.round(validScores.reduce((sum, a) => sum + (a.match_score as number), 0) / validScores.length)
            avgMatchScore = `${avg}%`
        }
    }

    const jobs = rawJobs?.map(job => ({
        ...job,
        applications: (job.applications as any[])?.filter(app => app.user_id === user.id) || []
    })) || []

    const { data: recentApplications } = await supabase
        .from('applications')
        .select(`
            *,
            jobs (title, company)
        `)
        .eq('user_id', user.id)
        .limit(3)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome Back</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Here&apos;s a look at your career progress.</p>
                </div>
                <Link href="/dashboard/resumes/upload">
                    <Button size="sm" className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        New Resume
                    </Button>
                </Link>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Avg Match Score"
                    value={avgMatchScore}
                    description="Profile Strength"
                    icon={<TrendingUp className="h-4 w-4" />}
                    color="blue"
                />
                <StatCard
                    title="Resumes"
                    value={resumeCount?.toString() || "0"}
                    description="Upload versions"
                    icon={<FileText className="h-4 w-4" />}
                    color="indigo"
                />
                <StatCard
                    title="Applications"
                    value={applicationCount?.toString() || "0"}
                    description="Total tracked"
                    icon={<Briefcase className="h-4 w-4" />}
                    color="violet"
                />
                <StatCard
                    title="Job Matches"
                    value="12"
                    description="New this week"
                    icon={<Sparkles className="h-4 w-4" />}
                    color="emerald"
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Job Recommendations */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recommended for You</h3>
                        <Link href="/dashboard/jobs" className="text-xs font-bold text-blue-600 hover:underline">
                            Browse All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {jobs && jobs.length > 0 ? jobs.map((job) => (
                            <JobCard key={job.id} job={job} resumes={resumes || []} />
                        )) : (
                            <Card className="border-dashed h-40 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-white/5 border-2 rounded-2xl border-slate-200 dark:border-white/10">
                                <Search className="h-6 w-6 text-slate-300 mb-2" />
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">No jobs yet</h4>
                                <p className="text-xs text-slate-500">Upload a resume to see matching jobs.</p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                    <Card className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a]">
                        <CardContent className="p-5">
                            <ul className="space-y-5">
                                {recentApplications && recentApplications.length > 0 ? (recentApplications as any[]).map((app) => (
                                    <ActivityItem
                                        key={app.id}
                                        icon={<CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                        text={`Applied to ${app.jobs?.title}`}
                                        time={new Date(app.created_at).toLocaleDateString()}
                                    />
                                )) : (
                                    <ActivityItem
                                        icon={<Clock className="h-3 w-3 text-slate-400" />}
                                        text="Start applying to jobs to see updates."
                                        time="Just now"
                                    />
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-600 text-white rounded-2xl border-none shadow-lg shadow-blue-500/20">
                        <CardContent className="p-5 space-y-3">
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm">Next-Gen AI Analysis</h4>
                                <p className="text-blue-100 text-xs">Fine-tune your resume with AI-powered skill gap analysis.</p>
                            </div>
                            <Link href="/dashboard/analyze" className="block pt-1">
                                <Button size="sm" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl">
                                    Analyze Now
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
    const bgColors = {
        blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400",
        indigo: "bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400",
        violet: "bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400",
        emerald: "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400",
    }

    return (
        <Card className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors shadow-sm">
            <CardContent className="p-5 flex items-start justify-between">
                <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                    <p className="text-[10px] font-medium text-slate-400">{description}</p>
                </div>
                <div className={`p-2 rounded-xl ${bgColors[color]}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

function ActivityItem({ icon, text, time }: ActivityItemProps) {
    return (
        <li className="flex gap-4">
            <div className="mt-1 h-5 w-5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{text}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</p>
            </div>
        </li>
    )
}

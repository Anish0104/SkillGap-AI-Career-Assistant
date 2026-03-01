'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Loader2, ArrowRight, Play, MessageSquare, CheckCircle2, Trash2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'

export default function InterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([])
    const [resumes, setResumes] = useState<any[]>([])
    const [selectedResumeId, setSelectedResumeId] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isStarting, setIsStarting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [interviewsData, resumesData] = await Promise.all([
                supabase.from('mock_interviews').select('*, resumes(file_name)').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('resumes').select('id, file_name').eq('user_id', user.id)
            ])

            if (interviewsData.data) setInterviews(interviewsData.data)
            if (resumesData.data) {
                setResumes(resumesData.data)
                if (resumesData.data.length > 0) setSelectedResumeId(resumesData.data[0].id)
            }
            setIsLoading(false)
        }

        fetchData()
    }, [supabase])

    const startInterview = async () => {
        if (!selectedResumeId) {
            toast.error('Please select a resume first.')
            return
        }

        setIsStarting(true)
        const toastId = toast.loading('Initializing interviewer AI...')

        try {
            const res = await fetch('/api/interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start', resumeId: selectedResumeId })
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error)

            toast.success('Interview started!', { id: toastId })
            router.push(`/dashboard/interviews/${json.data.id}`)
        } catch (error: any) {
            toast.error(error.message || 'Failed to start interview', { id: toastId })
            setIsStarting(false)
        }
    }

    const deleteInterview = async (id: string) => {
        if (!confirm('Are you sure you want to delete this interview history? This cannot be undone.')) return

        const toastId = toast.loading('Deleting interview...')
        try {
            const res = await fetch(`/api/interviews?id=${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.error || 'Failed to delete')
            }

            // Remove from local state
            setInterviews(interviews.filter(inv => inv.id !== id))
            toast.success('Interview deleted successfully', { id: toastId })
        } catch (error: any) {
            toast.error(error.message, { id: toastId })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Mic className="h-8 w-8 text-rose-500" />
                    AI Mock Interviews
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Practice your talking points with an AI technical recruiter based on your resume.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 h-fit border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg">Start New Interview</CardTitle>
                        <CardDescription>Select the resume the AI should base questions on.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Resume</label>
                            {resumes.length > 0 ? (
                                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Resume" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {resumes.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.file_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm text-slate-500">No resumes found. Please upload one first.</p>
                            )}
                        </div>
                        <Button
                            className="w-full bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 py-6"
                            disabled={isStarting || !selectedResumeId}
                            onClick={startInterview}
                        >
                            {isStarting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                            Start Interview
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Past Interviews</h3>
                    {interviews.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                            You haven't done any mock interviews yet.
                        </div>
                    ) : (
                        interviews.map(inv => (
                            <Card key={inv.id} className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-6 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                                            <span>Session for {inv.resumes?.file_name || 'Resume'}</span>
                                            {inv.status === 'completed' ? (
                                                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    In Progress
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">
                                            {new Date(inv.created_at).toLocaleDateString()} at {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {inv.status === 'completed' && inv.feedback && (
                                            <div className="text-right mr-2">
                                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Score</div>
                                                <div className="text-2xl font-black text-rose-600">{inv.feedback.score}%</div>
                                            </div>
                                        )}
                                        <Button asChild variant={inv.status === 'completed' ? "outline" : "default"} size="sm" className={inv.status === 'in_progress' ? "bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto" : "w-full sm:w-auto"}>
                                            <Link href={`/dashboard/interviews/${inv.id}`}>
                                                {inv.status === 'completed' ? "View Results" : "Resume Interview"}
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                            onClick={() => deleteInterview(inv.id)}
                                            title="Delete Interview"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

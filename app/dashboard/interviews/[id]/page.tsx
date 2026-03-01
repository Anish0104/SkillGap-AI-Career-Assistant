'use client'

import { useState, useEffect, useRef, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Loader2, Send, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function InterviewChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [interview, setInterview] = useState<any>(null)
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isEnding, setIsEnding] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchInterview = async () => {
            const { data, error } = await supabase
                .from('mock_interviews')
                .select('*, resumes(file_name)')
                .eq('id', id)
                .single()

            if (error) {
                toast.error('Interview not found')
                router.push('/dashboard/interviews')
            } else {
                setInterview(data)
            }
            setIsLoading(false)
        }
        fetchInterview()
    }, [id, supabase, router])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [interview?.messages])

    const sendMessage = async () => {
        if (!message.trim() || isSending) return

        const userMsg = message
        setMessage('')
        setIsSending(true)

        try {
            // Optimistic update
            const newMessages = [...(interview.messages || []), { role: 'user', content: userMsg }]
            setInterview({ ...interview, messages: newMessages })

            const res = await fetch('/api/interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'message', interviewId: id, message: userMsg })
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error)

            setInterview(json.data)
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message')
        } finally {
            setIsSending(false)
        }
    }

    const endInterview = async () => {
        if (!confirm('Are you sure you want to end the interview and receive feedback?')) return

        setIsEnding(true)
        const toastId = toast.loading('AI is analyzing your performance...')

        try {
            const res = await fetch('/api/interviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interviewId: id })
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error)

            toast.success('Feedback generated!', { id: toastId })
            setInterview(json.data)
        } catch (error: any) {
            toast.error(error.message || 'Failed to end interview', { id: toastId })
            setIsEnding(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
        )
    }

    if (!interview) return null

    const isCompleted = interview.status === 'completed'

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full" asChild>
                        <Link href="/dashboard/interviews">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            Mock Interview <Badge variant="outline" className="ml-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-none">{interview.resumes?.file_name}</Badge>
                        </h2>
                        <p className="text-sm text-slate-500">Status: {isCompleted ? 'Finished' : 'In Progress'}</p>
                    </div>
                </div>
                {!isCompleted && (
                    <Button variant="outline" onClick={endInterview} disabled={isEnding || isSending} className="shadow-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                        {isEnding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        End Interview
                    </Button>
                )}
            </div>

            {isCompleted && interview.feedback && (
                <Card className="border-none bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900 rounded-3xl shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-500 mb-8">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-4 flex-1">
                                <div className="space-y-1">
                                    <h3 className="text-rose-600 text-sm font-bold uppercase tracking-wider">Performance Feedback</h3>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                        {interview.feedback.summary}
                                    </p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
                                        </h4>
                                        <ul className="space-y-2">
                                            {interview.feedback.strengths?.map((s: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                    <span className="text-emerald-400 mt-0.5">•</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Areas to Improve
                                        </h4>
                                        <ul className="space-y-2">
                                            {interview.feedback.improvements?.map((s: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                    <span className="text-amber-500 mt-0.5">•</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-950/50 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/50 min-w-[150px]">
                                <div className="text-xs uppercase font-bold text-slate-400 mb-2">Overall Score</div>
                                <div className="text-6xl font-black text-rose-500">{interview.feedback.score}%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
                    {interview.messages?.map((msg: any, i: number) => {
                        const isAI = msg.role === 'ai'
                        return (
                            <div key={i} className={`flex items-start gap-4 ${isAI ? '' : 'flex-row-reverse'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAI ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400' : 'bg-blue-600 text-white'}`}>
                                    {isAI ? <Mic className="w-4 h-4" /> : <div className="text-xs font-bold">You</div>}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${isAI
                                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                                    : 'bg-blue-600 text-white rounded-tr-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        )
                    })}
                    {isSending && (
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 flex items-center justify-center shrink-0">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                            <div className="max-w-[80%] rounded-2xl rounded-tl-none p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce delay-75" />
                                    <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce delay-150" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {!isCompleted && (
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-end gap-2">
                            <Textarea
                                placeholder="Type your answer here..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="min-h-[60px] max-h-[150px] resize-y rounded-xl focus-visible:ring-rose-500"
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />
                            <Button size="icon" className="h-[60px] w-[60px] rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0 shadow-md" onClick={sendMessage} disabled={!message.trim() || isSending}>
                                {isSending ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white ml-1" />}
                            </Button>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 px-1">
                            <span className="text-xs text-slate-400 order-2 sm:order-1">Press Enter to send, Shift+Enter for new line.</span>
                            <Button variant="destructive" size="default" onClick={endInterview} disabled={isEnding || isSending} className="shadow-lg w-full sm:w-auto order-1 sm:order-2">
                                {isEnding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                                End Interview & Get Feedback
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

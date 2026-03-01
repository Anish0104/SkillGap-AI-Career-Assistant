'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowRight, Loader2, Sparkles, Clock, BookOpen, Download, Printer } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function LearningPathsPage() {
    const [paths, setPaths] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchPaths = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('learning_paths')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                toast.error("Failed to load learning paths")
            } else {
                setPaths(data || [])
            }
            setIsLoading(false)
        }

        fetchPaths()
    }, [supabase])

    const handleDownloadPdf = (pathId: string, title: string) => {
        const element = document.getElementById(`pdf-content-${pathId}`)
        if (!element) {
            toast.error("Could not find content to print")
            return
        }

        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            toast.error("Please allow popups to save as PDF")
            return
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${title} - Learning Path</title>
                    <style>
                        body { 
                            font-family: system-ui, -apple-system, sans-serif; 
                            line-height: 1.6; 
                            color: #1e293b; 
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 40px; 
                        }
                        h1 { color: #0f172a; margin-bottom: 8px; font-size: 28px; }
                        h2 { color: #1e293b; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 20px; }
                        h3 { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 24px; margin-bottom: 12px; font-weight: 700; }
                        p { margin-bottom: 16px; color: #475569; }
                        .text-slate-500 { color: #64748b; }
                        .bg-indigo-50 { display: inline-block; background: #eef2ff; color: #4338ca; padding: 4px 12px; border-radius: 999px; font-size: 13px; margin: 4px 8px 4px 0; border: 1px solid #c7d2fe; font-weight: 600; }
                        ul { padding-left: 20px; margin-bottom: 16px; }
                        li { margin-bottom: 6px; color: #334155; font-size: 15px;}
                        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
                        
                        /* Utility classes matched from React */
                        .flex { display: flex; }
                        .flex-wrap { flex-wrap: wrap; }
                        .gap-2 { gap: 8px; }
                        .mt-4 { margin-top: 16px; }
                        .mb-8 { margin-bottom: 32px; }
                        .mb-4 { margin-bottom: 16px; }
                        .mb-2 { margin-bottom: 8px; }
                        .pb-6 { padding-bottom: 24px; }
                        .pt-6 { padding-top: 24px; }
                        .mt-12 { margin-top: 48px; }
                        .text-sm { font-size: 14px; }
                        .text-xs { font-size: 12px; }
                        .font-normal { font-weight: normal; }
                        .text-center { text-align: center; }

                        @media print {
                            @page { margin: 20mm; }
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
                            .keep-together { page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    ${element.innerHTML.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')}
                </body>
            </html>
        `)

        printWindow.document.close()

        // Wait for fonts and styles to resolve, then open print dialog
        setTimeout(() => {
            printWindow.print()
        }, 300)
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
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-indigo-600" />
                        Learning Paths
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Custom AI-generated curriculum to help you bridge your skill gaps.
                    </p>
                </div>
                <Button asChild variant="outline" className="rounded-xl border-dashed">
                    <Link href="/dashboard/analyze">Analyze a Job to Generate</Link>
                </Button>
            </div>

            {paths.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-12 text-center rounded-2xl">
                    <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Learning Paths Yet</h3>
                    <p className="text-slate-500 max-w-sm mt-2 mb-6">Generate your first active learning path by analyzing a job description and clicking the generator button for missing skills.</p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                        <Link href="/dashboard/analyze">Go to Job Matcher</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 space-y-4">
                    {paths.map((path) => {
                        const data = path.path_data
                        return (
                            <Card key={path.id} className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 pb-6">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {path.missing_skills?.map((skill: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur text-indigo-700 dark:text-indigo-300 font-medium whitespace-nowrap">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                    <CardTitle className="text-2xl font-bold">{data.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-4 mt-2 font-medium">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                                <Clock className="w-4 h-4" /> {data.estimatedHours} Hours Total
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs bg-white/50 dark:bg-slate-800/50 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300"
                                                onClick={() => handleDownloadPdf(path.id, data.title)}
                                            >
                                                <Printer className="w-3 h-3 mr-1.5" /> Save / Print PDF
                                            </Button>
                                        </div>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Accordion type="single" collapsible className="w-full">
                                        {data.modules?.map((mod: any, i: number) => (
                                            <AccordionItem key={i} value={`module-${i}`} className="border-b-slate-100 dark:border-b-slate-800 px-6">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex items-center text-left gap-4">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold text-sm shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 dark:text-white">{mod.title}</div>
                                                            <div className="text-sm font-normal text-slate-500">{mod.duration}</div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pl-12 pb-6 space-y-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 pl-4 border-indigo-100 dark:border-indigo-900/50">
                                                        {mod.description}
                                                    </p>

                                                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                                                        <div className="space-y-2">
                                                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                                <BookOpen className="w-3 h-3" /> Topics to Learn
                                                            </h5>
                                                            <ul className="space-y-1">
                                                                {mod.topics?.map((topic: string, j: number) => (
                                                                    <li key={j} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                                                        <span className="text-indigo-400 mt-0.5">•</span> {topic}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                                <Sparkles className="w-3 h-3" /> Suggested Resources
                                                            </h5>
                                                            <ul className="space-y-1.5">
                                                                {mod.resources?.map((res: any, j: number) => (
                                                                    <li key={j} className="text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md">
                                                                        <span className="font-medium truncate mr-2">{res.name}</span>
                                                                        <Badge variant="outline" className="shrink-0 text-[10px] uppercase border-slate-200 dark:border-slate-700">
                                                                            {res.type}
                                                                        </Badge>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>

                                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-950/20 text-center">
                                        <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 italic font-medium">
                                            "{data.encouragement || "You can do this!"}"
                                        </p>
                                    </div>

                                    {/* HIDDEN RENDER TARGET FOR PDF GENERATION */}
                                    <div id={`pdf-content-${path.id}`} className="hidden fixed top-[-9999px] left-[-9999px] w-[800px] bg-white p-12 text-slate-900 border border-slate-200 shadow-none z-0">
                                        <div className="mb-8 border-b border-slate-200 pb-6">
                                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{data.title}</h1>
                                            <p className="text-slate-500">Total Duration: {data.estimatedHours} Hours</p>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {path.missing_skills?.map((skill: string, idx: number) => (
                                                    <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {data.modules?.map((mod: any, idx: number) => (
                                            <div key={idx} className="mb-8 keep-together">
                                                <h2 className="text-xl font-bold text-slate-800 mb-2">
                                                    {idx + 1}. {mod.title} <span className="text-sm font-normal text-slate-500 ml-2">({mod.duration})</span>
                                                </h2>
                                                <p className="text-slate-600 mb-4 text-sm leading-relaxed">{mod.description}</p>

                                                <div className="grid grid-cols-2 gap-8">
                                                    <div>
                                                        <h3 className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Topics to Learn</h3>
                                                        <ul className="list-disc pl-5 mb-4 space-y-1">
                                                            {mod.topics?.map((topic: string, j: number) => (
                                                                <li key={j} className="text-sm text-slate-700">{topic}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Recommended Resources</h3>
                                                        <ul className="list-disc pl-5 mb-4 space-y-1">
                                                            {mod.resources?.map((res: any, j: number) => (
                                                                <li key={j} className="text-sm text-slate-700">
                                                                    {res.name} <span className="text-xs text-slate-400">({res.type})</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-12 pt-6 border-t border-slate-100 text-center text-slate-400 text-xs">
                                            Generated by SkillGap AI Learning Path System
                                        </div>
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                            .keep-together { page-break-inside: avoid; }
                                        `}} />
                                    </div>

                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )
            }
        </div >
    )
}

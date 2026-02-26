'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    MapPin,
    DollarSign,
    ExternalLink,
    Loader2,
    CheckCircle2,
    Info,
    TrendingUp,
    XCircle,
    Heart,
    Sparkles,
    Briefcase
} from "lucide-react"
import { toast } from "sonner"
import { applyToJob, toggleSaveJob } from "@/app/dashboard/jobs/actions"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface JobCardProps {
    job: any
    resumes: any[]
}

export default function JobCard({ job, resumes }: JobCardProps) {
    const [hasApplied, setHasApplied] = useState(job.applications?.length > 0)
    const [isSaved, setIsSaved] = useState(job.saved_jobs?.length > 0)
    const [analyzing, setAnalyzing] = useState(false)
    const [analysisResults, setAnalysisResults] = useState<any>(null)

    const handleSave = async () => {
        const newSavedStatus = !isSaved
        setIsSaved(newSavedStatus)
        try {
            const result = await toggleSaveJob(job.id, isSaved)
            if (!result.success) {
                setIsSaved(!newSavedStatus)
                toast.error("Failed to save job.")
            } else {
                toast.success(newSavedStatus ? "Job saved!" : "Job removed.")
            }
        } catch (error) {
            setIsSaved(!newSavedStatus)
            toast.error("An error occurred.")
        }
    }

    const handleApply = async () => {
        if (!resumes || resumes.length === 0) {
            toast.error("Please upload a resume first.")
            return
        }

        if (!hasApplied) {
            setHasApplied(true)
            try {
                const result = await applyToJob(job.id, resumes[0].id)
                if (!result.success) {
                    setHasApplied(false)
                    toast.error("Failed to track application.")
                }
            } catch (error) {
                setHasApplied(false)
                console.error("Tracking failed", error)
            }
        }
    }

    const handleAnalysis = async () => {
        if (!resumes || resumes.length === 0) {
            toast.error("Please upload a resume first.")
            return
        }

        setAnalyzing(true)
        try {
            const response = await fetch('/api/analysis/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId: resumes[0].id,
                    jobDescription: job.description,
                    jobId: job.id
                })
            })

            const result = await response.json()
            if (result.success) {
                setAnalysisResults(result.data)
                toast.success("AI Analysis complete!")
            } else {
                toast.error(result.error || "Analysis failed")
            }
        } catch (error) {
            console.error("Analysis Error:", error)
            toast.error("An error occurred during analysis")
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-900/50 rounded-xl bg-white dark:bg-[#0f172a]">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch">
                    <div className="flex-1 p-5 space-y-3">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden p-2">
                                {job.company_logo ? (
                                    <img src={job.company_logo} alt={job.company} className="h-full w-full object-contain" />
                                ) : (
                                    <Building2 className="h-6 w-6 text-blue-400" />
                                )}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate tracking-tight">{job.title}</h4>
                                    <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border-none font-bold rounded-lg px-2 py-0.5 text-[10px]">
                                        {job.match_score || 85}% Match
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{job.company}</span>
                                    <div className="flex items-center gap-1 font-medium">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{job.location}</span>
                                    </div>
                                    {(job.salary_min || job.salary_max) && (
                                        <div className="flex items-center gap-1 font-medium">
                                            <DollarSign className="h-3 w-3 text-emerald-600" />
                                            <span className="text-emerald-700 dark:text-emerald-400">
                                                {job.salary_min && `$${job.salary_min.toLocaleString()}`}{job.salary_min && job.salary_max && ' - '}{job.salary_max && `$${job.salary_max.toLocaleString()}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                            {job.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                            {job.is_remote && (
                                <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-full">
                                    Remote
                                </Badge>
                            )}
                            {job.employment_type && (
                                <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full">
                                    {job.employment_type}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="sm:w-44 p-5 bg-slate-50/50 dark:bg-black/20 border-l border-slate-100 dark:border-white/5 flex flex-row sm:flex-col justify-center gap-2.5">
                        <a
                            href={job.apply_url || job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                if (resumes && resumes.length > 0) {
                                    handleApply()
                                } else {
                                    toast.error("Please upload a resume first.")
                                }
                            }}
                            className={`flex flex-1 items-center justify-center rounded-xl h-10 font-bold text-xs px-4 transition-all shadow-sm active:scale-95 ${hasApplied
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10"
                                }`}
                        >
                            {hasApplied ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                    Applied
                                </>
                            ) : (
                                <>
                                    Apply Now
                                    <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                                </>
                            )}
                        </a>

                        <div className="flex gap-2 flex-1 sm:flex-none">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSave}
                                className={`rounded-xl h-10 w-10 transition-all shrink-0 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/30 ${isSaved ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-500" : "text-slate-400 dark:text-slate-500"}`}
                            >
                                <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                            </Button>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="rounded-xl h-10 text-[10px] gap-2 flex-1 font-bold border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-900/30">
                                        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                                        AI Match
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-md lg:max-w-xl overflow-y-auto bg-white dark:bg-[#020617] border-l border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100">
                                    <SheetHeader className="space-y-4 pb-6 border-b border-slate-100 dark:border-white/5 text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center overflow-hidden border border-blue-100 dark:border-blue-900/20">
                                                {job.company_logo ? (
                                                    <img src={job.company_logo} alt={job.company} className="h-full w-full object-contain p-2" />
                                                ) : (
                                                    <Building2 className="h-7 w-7 text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <SheetTitle className="text-lg text-left font-bold text-slate-900 dark:text-slate-100 tracking-tight">{job.title}</SheetTitle>
                                                <SheetDescription className="text-blue-600 dark:text-blue-400 font-bold text-left text-sm">
                                                    {job.company}
                                                </SheetDescription>
                                            </div>
                                        </div>
                                    </SheetHeader>

                                    <div className="space-y-6 py-6 font-medium">
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                                                AI Analysis & Matching
                                            </h4>

                                            {!analysisResults ? (
                                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300">
                                                    <div className="flex items-center gap-3 mb-3 text-blue-700 dark:text-blue-400">
                                                        <Info className="h-4 w-4" />
                                                        <span className="font-bold">Match score is an estimate.</span>
                                                    </div>
                                                    Generate a deep-dive analysis to see missing skills and suggestions.
                                                    <Button
                                                        onClick={handleAnalysis}
                                                        disabled={analyzing}
                                                        className="w-full mt-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/10 transition-all text-xs"
                                                    >
                                                        {analyzing ? (
                                                            <>
                                                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                                                Analyzing...
                                                            </>
                                                        ) : "Run Full AI Analysis"}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-5">
                                                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                                        <div className="space-y-0.5">
                                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Match Score</span>
                                                            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{analysisResults.match_score}%</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Matching Skills</h5>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {analysisResults.matching_skills?.map((skill: string, i: number) => (
                                                                <Badge key={i} variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border-none px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-sm">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Gaps</h5>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {analysisResults.missing_skills?.map((skill: string, i: number) => (
                                                                <Badge key={i} variant="secondary" className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border-none px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-sm">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Suggestions</h5>
                                                        <ul className="space-y-1.5">
                                                            {analysisResults.suggestions?.map((s: string, i: number) => (
                                                                <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex gap-2.5">
                                                                    <div className="h-1 w-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                                    {s}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-white/5">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                                Job Description
                                            </h4>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                                                {job.description}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                                            <a
                                                href={job.apply_url || job.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center w-full h-12 text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/10 bg-blue-600 hover:bg-blue-700 text-white transition-all"
                                            >
                                                Apply on Company Site
                                                <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


'use client'

import { useState, useEffect, useCallback } from "react"
import JobCard from "@/components/dashboard/JobCard"
import { Briefcase, Search, Loader2, SlidersHorizontal, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface JobBoardClientProps {
    initialResumes: { id: string; file_name: string }[]
}

export default function JobBoardClient({ initialResumes }: JobBoardClientProps) {
    const [jobs, setJobs] = useState<Record<string, any>[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("Software Engineer")
    const [location, setLocation] = useState("United States")
    const [remoteOnly, setRemoteOnly] = useState(false)
    const [jobType, setJobType] = useState("FULLTIME")
    const [page, setPage] = useState(1)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchJobs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                query,
                location,
                remote_only: remoteOnly.toString(),
                employment_types: jobType,
                page: page.toString()
            })

            const response = await fetch(`/api/jobs/search?${params.toString()}`)
            const result = await response.json()

            if (result.success) {
                setJobs(result.data)
                setLastUpdated(new Date())
            } else {
                toast.error(result.error || "Failed to fetch jobs")
                if (result.isMock) {
                    console.warn("RapidAPI Key missing, please configure .env.local")
                }
            }
        } catch (error) {
            console.error("Error fetching jobs:", error)
            toast.error("An error occurred while fetching jobs")
        } finally {
            setLoading(false)
        }
    }, [query, location, remoteOnly, jobType, page])

    useEffect(() => {
        fetchJobs()
    }, [fetchJobs])

    return (
        <div className="space-y-10 py-6">
            <div className="relative overflow-hidden p-10 rounded-[2.5rem] bg-linear-to-br from-primary/10 via-transparent to-transparent border border-white/10 dark:border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] bg-white dark:bg-slate-950">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 h-96 w-96 bg-primary/10 dark:bg-primary/5 blur-[100px] rounded-full" />

                <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-1000">
                            Discover Opportunity
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground leading-tight flex items-center gap-4">
                            Job Board
                            {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed">
                            {lastUpdated ? `Real-time jobs updated at ${lastUpdated.toLocaleTimeString()}` : 'Searching for the best opportunities...'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary z-10" />
                            <Input
                                placeholder="Role (e.g. Frontend)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-12 h-14 rounded-2xl bg-white dark:bg-slate-900 border-border/50 focus:border-primary focus:ring-primary/20 text-base font-medium transition-all"
                            />
                        </div>
                        <div className="relative group w-full sm:w-60">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary z-10" />
                            <Input
                                placeholder="Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="pl-12 h-14 rounded-2xl bg-white dark:bg-slate-900 border-border/50 focus:border-primary focus:ring-primary/20 text-base font-medium transition-all"
                            />
                        </div>
                        <Button onClick={() => fetchJobs()} className="h-14 px-8 rounded-2xl font-black text-base transition-all active:scale-95 shadow-lg shadow-primary/20">
                            Explore
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="p-3 border-none bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[1.5rem] shadow-sm">
                <div className="flex flex-wrap items-center gap-6 px-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Filters</span>
                    </div>

                    <div className="h-6 w-px bg-border/50 hidden sm:block" />

                    <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger className="w-[160px] rounded-xl h-11 bg-transparent border-none shadow-none font-bold text-sm">
                            <SelectValue placeholder="Job Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/50 backdrop-blur-3xl">
                            <SelectItem value="FULLTIME" className="rounded-xl">Full-time</SelectItem>
                            <SelectItem value="CONTRACTOR" className="rounded-xl">Contract</SelectItem>
                            <SelectItem value="PARTTIME" className="rounded-xl">Part-time</SelectItem>
                            <SelectItem value="INTERN" className="rounded-xl">Internship</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-3 pr-4 group cursor-pointer" onClick={() => setRemoteOnly(!remoteOnly)}>
                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${remoteOnly ? 'bg-primary border-primary shadow-lg shadow-primary/30' : 'border-border group-hover:border-primary/50'}`}>
                            {remoteOnly && <div className="h-2 w-2 rounded-full bg-white animate-in zoom-in-50" />}
                        </div>
                        <span className={`text-sm font-bold transition-colors ${remoteOnly ? 'text-primary' : 'text-muted-foreground'}`}>Remote Only</span>
                    </div>

                    <div className="ml-auto flex items-center gap-4 py-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="rounded-xl h-11 w-11"
                        >
                            <Search className="h-4 w-4 rotate-180" />
                        </Button>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Page</span>
                            <span className="text-sm font-black text-primary">{page}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-xl h-11 w-11"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="grid gap-6">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <Card key={i} className="p-6 border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
                            <div className="flex gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 rounded" />
                                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                                    <div className="h-16 w-full bg-slate-50 dark:bg-slate-900/50 rounded mt-4" />
                                </div>
                            </div>
                        </Card>
                    ))
                ) : jobs.length > 0 ? (
                    jobs.map((job) => (
                        <JobCard key={job.id} job={job} resumes={initialResumes} />
                    ))
                ) : (
                    <div className="p-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No jobs found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search filters or keywords.</p>
                        <Button onClick={() => fetchJobs()} variant="outline" className="rounded-xl">
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

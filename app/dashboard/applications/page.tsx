import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, MapPin, Calendar, ExternalLink, TrendingUp, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { StatusDropdown } from "@/components/dashboard/StatusDropdown"

export const revalidate = 0

export default async function ApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: applications } = await supabase
        .from('applications')
        .select(`
            *,
            jobs (*)
        `)
        .eq('user_id', user?.id)
        .order('applied_at', { ascending: false })

    const stats = {
        total: applications?.length || 0,
        interviewing: applications?.filter(a => a.status === 'interviewing').length || 0,
        offers: applications?.filter(a => a.status === 'offer').length || 0,
        rejected: applications?.filter(a => a.status === 'rejected').length || 0,
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Mission Control</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track and manage your professional opportunities precision.</p>
                </div>
                <Link href="/dashboard/jobs">
                    <Button className="gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 font-bold h-12 px-6 rounded-2xl shadow-xl transition-all">
                        <Plus className="h-5 w-5" /> Browse New Roles
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.total}</div>
                        <TrendingUp className="absolute -right-2 -bottom-2 h-16 w-16 text-slate-100 dark:text-slate-900/50 -rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Interviewing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{stats.interviewing}</div>
                        <CheckCircle2 className="absolute -right-2 -bottom-2 h-16 w-16 text-indigo-50/50 dark:text-indigo-900/20 -rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Offers Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{stats.offers}</div>
                        <TrendingUp className="absolute -right-2 -bottom-2 h-16 w-16 text-emerald-50/50 dark:text-emerald-900/20 -rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-red-400 uppercase tracking-widest">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-red-500 dark:text-red-400">{stats.rejected}</div>
                        <XCircle className="absolute -right-2 -bottom-2 h-16 w-16 text-red-50/50 dark:text-red-900/20 -rotate-12 group-hover:scale-110 transition-transform" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4">
                {applications && applications.length > 0 ? (
                    applications.map((app) => (
                        <Card key={app.id} className="border-slate-200 dark:border-slate-800 shadow-sm rounded-[2rem] group hover:border-blue-500/50 transition-all overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform relative overflow-hidden p-2">
                                            {app.jobs?.company_logo ? (
                                                <Image src={app.jobs.company_logo} alt={app.jobs.company} fill className="object-contain p-2" />
                                            ) : (
                                                <Building2 className="h-8 w-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">{app.jobs?.title}</h4>
                                                {app.jobs?.is_remote && (
                                                    <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-blue-100 dark:border-blue-900/30 text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 px-1 py-0">Remote</Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">{app.jobs?.company}</span>
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {app.jobs?.location}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8">
                                        <div className="flex flex-col items-start sm:items-end gap-1">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pipeline Status</span>
                                            <StatusDropdown applicationId={app.id} currentStatus={app.status} />
                                        </div>

                                        <div className="h-12 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block" />

                                        <div className="flex flex-col items-start sm:items-end gap-1">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Applied Date</span>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <a href={app.jobs?.apply_url || app.jobs?.url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                                    <ExternalLink className="h-5 w-5 text-slate-500" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-xl mb-6">
                            <Plus className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Initialize Your Journey</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mb-8">You haven&apos;t tracked any applications yet. Find your next milestone on the job board.</p>
                        <Link href="/dashboard/jobs">
                            <Button className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all">
                                Explore Roles
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

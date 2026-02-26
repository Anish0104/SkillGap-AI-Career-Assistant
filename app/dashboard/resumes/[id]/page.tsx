
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    Calendar,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    ArrowLeft,
    Sparkles,
    CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default async function ResumeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: resume, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !resume) {
        notFound()
    }

    const raw = resume.structured_data || {}

    // Normalize field names: AI returns `name`, `start_date`, `end_date`, `graduation_year`
    // while the UI uses `firstName`, `startDate`, `endDate`, `year`.
    const nameParts = (raw.name || '').split(' ')
    const data = {
        firstName: raw.firstName || nameParts[0] || user.email?.split('@')[0] || "User",
        lastName: raw.lastName || nameParts.slice(1).join(' ') || "",
        email: raw.email || user.email,
        phone: raw.phone || "N/A",
        skills: raw.skills || [],
        experience: (raw.experience || []).map((exp: Record<string, any>) => ({
            title: exp.title || '',
            company: exp.company || '',
            startDate: exp.startDate || exp.start_date || '',
            endDate: exp.endDate || exp.end_date || 'Present',
            description: exp.description || ''
        })),
        education: (raw.education || []).map((edu: Record<string, any>) => ({
            school: edu.school || '',
            degree: edu.degree ? `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}` : '',
            year: edu.year || edu.graduation_year || ''
        }))
    }

    // Only use placeholder data when there is genuinely no parsed info at all
    const hasRealData = data.skills.length > 0 || (raw.name && raw.name !== 'Unknown')
    if (!hasRealData) {
        data.skills = ["JavaScript", "React", "Next.js", "Tailwind CSS"]
        data.experience = [{
            title: "Professional",
            company: "Previous Company",
            startDate: "2020",
            endDate: "Present",
            description: "Upload a new resume or re-analyze to see real data here."
        }]
        data.education = [{
            school: "University",
            degree: "Degree",
            year: "2020"
        }]
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/resumes">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {resume.file_name}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Analysis and structured data from your resume.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Overview */}
                <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg">Contact Info</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">{data.firstName} {data.lastName}</h3>
                            <p className="text-sm text-blue-600 font-medium">{data.experience?.[0]?.title || "Professional"}</p>
                        </div>

                        <div className="space-y-3 pt-4">
                            {data.email && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    {data.email}
                                </div>
                            )}
                            {data.phone && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    {data.phone}
                                </div>
                            )}
                        </div>

                        <div className="pt-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.skills?.map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Experience & Education */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                            <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-600" />
                                    Work Experience
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.experience?.map((exp: Record<string, any>, i: number) => (
                                    <div key={i} className="p-6 hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                                                <p className="text-sm font-medium text-blue-600">{exp.company}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                    <Calendar className="h-3 w-3" />
                                                    {exp.startDate} - {exp.endDate || "Present"}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                                {(!data.experience || data.experience.length === 0) && (
                                    <div className="p-6 text-center text-slate-500 italic">
                                        No experience found in the resume.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Education
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {data.education?.map((edu: Record<string, any>, i: number) => (
                                    <div key={i} className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white">{edu.school}</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{edu.degree}</p>
                                        </div>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                            {edu.year}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Raw Text Extract */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                    <CardTitle className="text-lg">Original Text Extract</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                        <pre className="text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                            {resume.extracted_text}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

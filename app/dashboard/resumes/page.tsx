
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Plus, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import DeleteResumeButton from "./DeleteResumeButton"

export const revalidate = 0

export default async function ResumesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: resumes, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Resumes</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your resume versions and view parsing insights.</p>
                </div>
                <Link href="/dashboard/resumes/upload">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4" /> Upload New
                    </Button>
                </Link>
            </div>

            {!resumes || resumes.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 my-12">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                            <FileText className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">No resumes uploaded yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Upload your first resume to start analyzing job matches and finding your skill gaps.</p>
                        </div>
                        <Link href="/dashboard/resumes/upload">
                            <Button variant="outline" className="mt-4">Upload Resume</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {resumes.map((resume) => (
                        <Card key={resume.id} className="group hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <DeleteResumeButton id={resume.id} fileName={resume.file_name} />
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold text-lg truncate" title={resume.file_name}>{resume.file_name}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-1">
                                    {(resume.structured_data?.skills || ["React", "JavaScript", "Tailwind"]).slice(0, 3).map((skill: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-300">
                                            {skill}
                                        </span>
                                    ))}
                                    {(resume.structured_data?.skills?.length > 3 || !resume.structured_data?.skills) && (
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-300">
                                            {resume.structured_data?.skills ? `+${resume.structured_data.skills.length - 3} more` : "..."}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Link href={`/dashboard/resumes/${resume.id}`} className="w-full">
                                    <Button variant="outline" className="w-full">View Analysis</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

import { createClient } from "@/lib/supabase/server"
import JobBoardClient from "./JobBoardClient"

export const revalidate = 0

export default async function JobsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user resumes for application context
    const { data: resumes } = await supabase
        .from('resumes')
        .select('id, file_name')
        .eq('user_id', user?.id)

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <JobBoardClient initialResumes={resumes || []} />
        </div>
    )
}

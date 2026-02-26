'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyToJob(jobId: string, resumeId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('applications')
        .insert({
            user_id: user.id,
            job_id: jobId,
            resume_id: resumeId || null,
            status: 'applied'
        })

    if (error) {
        console.error("Error applying to job:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/applications')
    return { success: true }
}

export async function toggleSaveJob(jobId: string, isSaved: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    if (isSaved) {
        const { error } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('user_id', user.id)
            .eq('job_id', jobId)

        if (error) return { success: false, error: error.message }
    } else {
        const { error } = await supabase
            .from('saved_jobs')
            .insert({
                user_id: user.id,
                job_id: jobId
            })

        if (error) return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/jobs')
    return { success: true }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error updating application status:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/applications')
    return { success: true }
}

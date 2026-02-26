'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteResume(resumeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // First get the resume to find the storage path
    const { data: resume, error: fetchError } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !resume) {
        return { success: false, error: 'Resume not found' }
    }

    // Delete from storage if possible
    if (resume.file_path) {
        const { error: storageError } = await supabase
            .storage
            .from('resumes')
            .remove([resume.file_path])

        if (storageError) {
            console.error("Error deleting from storage:", storageError)
        }
    }

    // Delete from DB (cascade rules will handle job_analyses, applications)
    const { error: deleteError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user.id)

    if (deleteError) {
        return { success: false, error: 'Failed to delete resume record' }
    }

    revalidatePath('/dashboard/resumes')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/analyze')
    return { success: true }
}

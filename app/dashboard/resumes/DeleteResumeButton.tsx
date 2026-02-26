'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteResume } from './actions'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DeleteResumeButton({ id, fileName }: { id: string, fileName: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteResume(id)
            if (result.success) {
                toast.success('Resume deleted successfully')
                setOpen(false)
            } else {
                toast.error(result.error || 'Failed to delete resume')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete Resume">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong className="text-slate-900 dark:text-slate-100">{fileName}</strong>? This will permanently remove the file and all associated job analyses. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Cancel</AlertDialogCancel>
                    <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

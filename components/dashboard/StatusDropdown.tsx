'use client'

import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateApplicationStatus } from "@/app/dashboard/jobs/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface StatusDropdownProps {
    applicationId: string
    currentStatus: string
}

const statusOptions = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-50 text-blue-700' },
    { value: 'interviewing', label: 'Interviewing', color: 'bg-indigo-50 text-indigo-700' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700' },
    { value: 'offer', label: 'Offer Received', color: 'bg-emerald-50 text-emerald-700' },
]

export function StatusDropdown({ applicationId, currentStatus }: StatusDropdownProps) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        setLoading(true)
        try {
            const result = await updateApplicationStatus(applicationId, newStatus)
            if (result.success) {
                setStatus(newStatus)
                toast.success("Status updated!")
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
                <SelectTrigger className="w-[160px] h-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                    {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="capitalize font-medium focus:bg-slate-100 dark:focus:bg-slate-800">
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

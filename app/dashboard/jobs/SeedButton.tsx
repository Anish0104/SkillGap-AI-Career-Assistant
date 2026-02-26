
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { seedJobs } from './seed-action'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SeedButton() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSeed = async () => {
        setIsLoading(true)
        try {
            const result = await seedJobs()
            if (result.success) {
                toast.success("Jobs seeded successfully!")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to seed jobs")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleSeed}
            disabled={isLoading}
            className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-8 py-6 rounded-2xl shadow-xl"
        >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
            Populate Sample Jobs
        </Button>
    )
}

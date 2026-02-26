
'use server'

import { createClient } from '@/lib/supabase/server'

export async function seedJobs() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const sampleJobs = [
        {
            user_id: user.id,
            title: "Senior Product Designer",
            company: "Airbnb",
            location: "San Francisco, CA (Remote)",
            description: "Airbnb is looking for a Senior Product Designer to help define the future of travel. You will design core experiences for millions of guests and hosts worldwide.",
            salary_range: "$165k - $210k",
            url: "https://careers.airbnb.com/positions/senior-product-designer",
            match_score: 94,
            status: "open"
        },
        {
            user_id: user.id,
            title: "Software Engineer, Frontend",
            company: "Vercel",
            location: "Remote",
            description: "Join the team that built Next.js. We are looking for engineers who are passionate about developer experience and performance.",
            salary_range: "$150k - $200k",
            url: "https://vercel.com/careers",
            match_score: 88,
            status: "open"
        },
        {
            user_id: user.id,
            title: "Growth Marketing Manager",
            company: "Duolingo",
            location: "Pittsburgh, PA",
            description: "Help us make language learning free and accessible to everyone. You'll drive user acquisition and engagement through data-driven campaigns.",
            salary_range: "$110k - $155k",
            url: "https://careers.duolingo.com",
            match_score: 76,
            status: "open"
        },
        {
            user_id: user.id,
            title: "Engineering Manager",
            company: "Stripe",
            location: "Dublin, Ireland",
            description: "Stripe builds economic infrastructure for the internet. As an EM, you will support and grow high-performing teams building mission-critical services.",
            salary_range: "€130k - €180k",
            url: "https://stripe.com/jobs",
            match_score: 82,
            status: "open"
        }
    ]

    const { error } = await supabase
        .from('jobs')
        .insert(sampleJobs)

    if (error) {
        console.error("Error seeding jobs:", error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

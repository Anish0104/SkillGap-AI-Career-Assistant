import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface JSearchJob {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo?: string;
    job_city?: string;
    job_state?: string;
    job_country?: string;
    job_description: string;
    job_apply_link: string;
    job_google_link?: string;
    job_min_salary?: number | null;
    job_max_salary?: number | null;
    job_is_remote: boolean;
    job_employment_type?: string;
    job_posted_at_datetime_utc: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || 'Software Engineer'
    const location = searchParams.get('location') || 'United States'
    const remoteOnly = searchParams.get('remote_only') === 'true'
    const employmentTypes = searchParams.get('employment_types') || 'FULLTIME'
    const page = searchParams.get('page') || '1'

    const apiKey = process.env.RAPIDAPI_KEY

    console.log(`[JSearch] Request: query="${query}", location="${location}", remote=${remoteOnly}, type=${employmentTypes}, page=${page}`)

    if (!apiKey || apiKey === 'your_rapidapi_key_here') {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[JSearch] RapidAPI Key is missing or default.')
        }
        return NextResponse.json({
            error: 'RapidAPI Key is not configured correctly. Check your .env.local file.',
            isMock: true,
            data: []
        }, { status: 400 })
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL('https://jsearch.p.rapidapi.com/search')
        // JSearch likes the location inside the query for better results
        url.searchParams.set('query', `${query} in ${location}`)
        url.searchParams.set('page', page)
        url.searchParams.set('num_pages', '1')

        if (remoteOnly) {
            url.searchParams.set('remote_jobs_only', 'true')
        }

        url.searchParams.set('employment_types', employmentTypes)

        console.log(`[JSearch] Calling URL: ${url.toString()}`)

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[JSearch] API Error (${response.status}):`, errorText)
            return NextResponse.json({ error: `JSearch API error: ${response.statusText}` }, { status: response.status })
        }

        const result = await response.json() as { data: JSearchJob[] }
        console.log(`[JSearch] Received ${result?.data?.length || 0} jobs.`)

        if (!result.data || !Array.isArray(result.data)) {
            console.error('[JSearch] Unexpected response structure:', result)
            return NextResponse.json({ error: 'Unexpected response from JSearch' }, { status: 500 })
        }

        // Transform the JSearch data to our internal format
        const jobs = result.data.map((job: JSearchJob) => ({
            id: job.job_id,
            external_job_id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            company_logo: job.employer_logo,
            location: `${job.job_city ? job.job_city + ', ' : ''}${job.job_state || job.job_country || ''}`,
            description: job.job_description,
            apply_url: job.job_apply_link,
            url: job.job_google_link || job.job_apply_link,
            salary_min: job.job_min_salary,
            salary_max: job.job_max_salary,
            is_remote: job.job_is_remote,
            employment_type: job.job_employment_type?.replace('_', ' '),
            posted_at: job.job_posted_at_datetime_utc,
            match_score: 85, // Default score, will be updated by client-side analysis
            status: 'open'
        }))

        return NextResponse.json({
            success: true,
            data: jobs,
            total: jobs.length
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An internal error occurred during job search'
        console.error('[JSearch] Route Crash:', error)
        return NextResponse.json({
            error: errorMessage,
            data: []
        }, { status: 500 })
    }
}

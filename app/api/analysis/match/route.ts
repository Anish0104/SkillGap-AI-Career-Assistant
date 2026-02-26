import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

interface MatchResult {
    match_score: number
    matching_skills: string[]
    missing_skills: string[]
    suggestions: string[]
    strengths: string[]
    concerns: string[]
    isMock?: boolean
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.OPENAI_API_KEY
    const openai = apiKey ? new OpenAI({ apiKey }) : null

    try {
        const { resumeId, jobDescription, jobId } = await request.json()

        console.log(`[Match API] Resume: ${resumeId}, Job ID: ${jobId}, API Key: ${!!apiKey}`)

        if (!resumeId || !jobDescription) {
            return NextResponse.json({ error: 'Resume and Job Description are required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch the resume
        const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', resumeId)
            .eq('user_id', user.id)
            .single()

        if (resumeError || !resume) {
            console.error('[Match API] Resume Fetch Error:', resumeError)
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
        }

        // 3. AI Semantic Matching
        let matchResult: MatchResult = {
            match_score: 0,
            matching_skills: [],
            missing_skills: [],
            suggestions: [],
            strengths: [],
            concerns: []
        }

        const getMockMatchResult = (): MatchResult => ({
            match_score: 82,
            matching_skills: ["React", "TypeScript", "Next.js"],
            missing_skills: ["Tailwind CSS", "Supabase"],
            suggestions: ["Mention your experience with Supabase if you've used it.", "Highlight responsive design projects."],
            strengths: ["Strong React background.", "Experience with modern frontend stacks."],
            concerns: ["Limited evidence of backend integration in recent roles."],
            isMock: true
        })

        if (openai) {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert career advisor. Analyze resume-job fit and return ONLY valid JSON."
                        },
                        {
                            role: "user",
                            content: `Compare this resume with the job description and provide analysis as JSON:
{
  "match_score": <number 0-100>,
  "matching_skills": [<array of strings>],
  "missing_skills": [<array of strings>],
  "suggestions": [<array of actionable suggestions>],
  "strengths": [<array of candidate strengths for this role>],
  "concerns": [<array of potential gaps or concerns>]
}

Resume Data:
${JSON.stringify(resume.structured_data || resume.extracted_text)}

Job Description:
${jobDescription}

Be specific and honest in your assessment.`
                        }
                    ],
                    temperature: 0.5,
                    response_format: { type: "json_object" }
                })

                const content = completion.choices[0].message.content
                if (content) {
                    matchResult = JSON.parse(content)
                    matchResult.isMock = false
                } else {
                    matchResult = getMockMatchResult()
                }
                console.log('[Match API] AI Matching Success.')
            } catch (apiError: unknown) {
                console.error("[Match API] OpenAI API Error:", apiError)
                matchResult = getMockMatchResult()
            }
        } else {
            console.warn("[Match API] OpenAI Key missing, using mock data.")
            matchResult = getMockMatchResult()
        }

        // 4. Save to Database
        if (jobId) {
            const { error: upsertError } = await supabase
                .from('job_analyses')
                .upsert({
                    job_id: jobId,
                    resume_id: resumeId,
                    match_score: matchResult.match_score,
                    missing_skills: matchResult.missing_skills,
                    recommendations: matchResult.suggestions,
                    analysis_text: JSON.stringify({
                        matching_skills: matchResult.matching_skills,
                        strengths: matchResult.strengths,
                        concerns: matchResult.concerns
                    })
                }, { onConflict: 'job_id,resume_id' })

            if (upsertError) {
                console.error('[Match API] Upsert Error:', upsertError)
            }
        }

        return NextResponse.json({ success: true, data: matchResult })

    } catch (error: unknown) {
        console.error('[Match API] Fatal Route Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during matching'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

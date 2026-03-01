
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

interface AnalysisResult {
    matchScore: number
    summary: string
    missingSkills: string[]
    recommendations: string[]
    detailedAnalysis: string
    isMock?: boolean
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

    try {
        const { resumeId, jobDescription, jobId } = await request.json()

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
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
        }

        console.log(`[Analyze] Resume ID: ${resumeId}, Text Length: ${resume.extracted_text?.length || 0}`)
        console.log(`[Analyze] Job Desc Length: ${jobDescription.length}`)

        // 3. AI Analysis
        let analysis: AnalysisResult = {
            matchScore: 0,
            summary: "",
            missingSkills: [],
            recommendations: [],
            detailedAnalysis: ""
        }

        const getMockAnalysis = (): AnalysisResult => ({
            matchScore: Math.floor(Math.random() * 20) + 75,
            summary: "Your profile is a strong match for this role, with significant overlap in core technologies.",
            missingSkills: ["Cloud Architecture", "Advanced Kubernetes", "Go Programming"],
            recommendations: [
                "Highlight your experience with Tailwind CSS more prominently.",
                "Mention specific projects where you used Next.js 14 features.",
                "Include a link to your portfolio to showcase design skills."
            ],
            detailedAnalysis: "Based on the job description, you have about 80% of the required skills. The company is looking for someone with strong React/Next.js experience which you clearly possess. The main gap is in backend Go development.",
            isMock: true
        })

        if (ai) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `RESUME TEXT:\n${resume.extracted_text}\n\nJOB DESCRIPTION:\n${jobDescription}`,
                    config: {
                        systemInstruction: `You are a world-class Technical Recruiter and ATS Optimization Expert with 20+ years of experience at top-tier firms like Google and Meta.
                            Your goal is to perform a BRUTALLY HONEST and HIGHLY DETAILED gap analysis between a candidate's resume and a job description.
                            
                            INSTRUCTIONS:
                            1. Analyze the 'RESUME TEXT' for specific evidence of 'JOB DESCRIPTION' requirements.
                            2. If a skill is not explicitly found or strongly implied in the resume, count it as a gap.
                            3. Match Score: 0-100. Be strict. 90+ is for perfect fits. 70-80 for good fits. Below 50 for poor fits.
                            4. Summary: 2-3 sentences. Identify exactly why they are or aren't a fit.
                            5. Missing Skills: List the top 5-7 most critical technical or soft skills mentioned in the job desc that are absent from the resume.
                            6. Recommendations: Provide specific, actionable advice. Instead of 'Add keywords', say 'In the X role section, mention your experience with Y technology to align with the JD'.
                            
                            Return a JSON object with:
                            - matchScore (number)
                            - summary (string)
                            - missingSkills (string array)
                            - recommendations (string array)
                            - detailedAnalysis (string - a deep dive into alignment, culture fit, and potential red flags)
                            
                            TONE: Professional, analytical, and authoritative.`,
                        responseMimeType: "application/json",
                    }
                })

                const content = response.text
                if (content) {
                    analysis = JSON.parse(content)
                    analysis.isMock = false
                } else {
                    analysis = getMockAnalysis()
                }
            } catch (apiError: unknown) {
                console.error("Gemini API Error (Analyze):", apiError)
                analysis = getMockAnalysis()
            }
        } else {
            // MOCK ANALYSIS FALLBACK
            console.warn("Using Mock Analysis because GEMINI_API_KEY is missing")
            analysis = getMockAnalysis()
        }

        // 4. Optionally save to Database if a jobId was provided
        if (jobId) {
            await supabase
                .from('job_analyses')
                .upsert({
                    job_id: jobId,
                    resume_id: resumeId,
                    match_score: analysis.matchScore,
                    missing_skills: analysis.missingSkills,
                    recommendations: analysis.recommendations,
                    analysis_text: analysis.detailedAnalysis
                }, { onConflict: 'job_id,resume_id' })
        }

        return NextResponse.json({ success: true, analysis })
    } catch (error: unknown) {
        console.error('Analysis error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

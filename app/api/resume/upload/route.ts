import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseResume } from '@/lib/resume-parser'
import { GoogleGenAI } from '@google/genai'

interface ExperienceEntry {
    title: string
    company: string
    start_date: string
    end_date: string
    description: string
}

interface EducationEntry {
    school: string
    degree: string
    field: string
    graduation_year: string
}

interface StructuredResumeData {
    name: string
    email: string
    phone: string | null
    skills: string[]
    experience: ExperienceEntry[]
    education: EducationEntry[]
    isMock?: boolean
    parsedWithFallback?: boolean
}

// Regex-based fallback parser — extracts real data from text when OpenAI is unavailable
function parseResumeWithRegex(text: string, userEmail: string): StructuredResumeData {
    // Extract email
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/)?.[0] || userEmail

    // Extract phone
    const phoneMatch = text.match(/(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/)?.[0] || null

    // Extract name: usually the first non-empty line that looks like a name
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    let name = null
    for (const line of lines.slice(0, 5)) {
        // A name line: 2-4 words, no special chars, not an email/phone/URL
        if (/^[A-Za-z]+([ '-][A-Za-z]+){1,3}$/.test(line) && !line.includes('@') && !line.includes('http')) {
            name = line
            break
        }
    }

    // Escape special regex characters in skill names (e.g. C++, C#, Next.js)
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Extract skills: look for common tech keywords
    const skillKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
        'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
        'HTML', 'CSS', 'Tailwind', 'SASS', 'Bootstrap',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase',
        'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git', 'GitHub',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'LLM', 'OpenAI',
        'REST', 'GraphQL', 'gRPC', 'WebSocket',
        'Agile', 'Scrum', 'Jira', 'Figma', 'Postman',
        'Linux', 'Bash', 'PowerShell',
        '.NET', 'Spring Boot', 'FastAPI', 'Svelte', 'Flutter', 'React Native',
        'Pandas', 'NumPy', 'Scikit-learn', 'Spark', 'Hadoop',
        'Jenkins', 'CircleCI', 'GitHub Actions', 'Nginx', 'Apache'
    ]
    const foundSkills = skillKeywords.filter(skill =>
        new RegExp(escapeRegex(skill), 'i').test(text)
    )

    // Extract experience by looking for section headers and date patterns
    const experience: ExperienceEntry[] = []
    const expSectionMatch = text.match(/(?:EXPERIENCE|WORK HISTORY|EMPLOYMENT|PROFESSIONAL EXPERIENCE)[:\s]*\n([\s\S]*?)(?=\n(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|REFERENCES|$))/i)
    if (expSectionMatch) {
        // Look for entries with date ranges like "Jan 2020 - Present" or "2020 - 2023"
        const datePattern = /(\w+\.?\s*\d{4}|\d{4})\s*[-–—to]+\s*(\w+\.?\s*\d{4}|\d{4}|present|current)/gi
        const entryLines = expSectionMatch[1].split('\n').filter(l => l.trim())
        let currentEntry: ExperienceEntry | null = null

        for (const line of entryLines) {
            const dateMatch = line.match(datePattern)
            if (dateMatch || (/^[A-Z]/.test(line.trim()) && line.trim().length > 3 && line.trim().length < 80)) {
                if (currentEntry && currentEntry.title) {
                    experience.push(currentEntry)
                }
                currentEntry = {
                    title: line.replace(datePattern, '').replace(/[|,].*$/, '').trim(),
                    company: '',
                    start_date: dateMatch ? dateMatch[0].split(/[-–—]|to/i)[0].trim() : '',
                    end_date: dateMatch ? dateMatch[0].split(/[-–—]|to/i).pop()?.trim() || 'Present' : 'Present',
                    description: ''
                }
            } else if (currentEntry) {
                if (!currentEntry.company && /[A-Z]/.test(line.trim()[0]) && line.trim().length < 60) {
                    currentEntry.company = line.trim()
                } else {
                    currentEntry.description += (currentEntry.description ? ' ' : '') + line.trim()
                }
            }
        }
        if (currentEntry && currentEntry.title) {
            experience.push(currentEntry)
        }
    }

    // Extract education
    const education: EducationEntry[] = []
    const eduSectionMatch = text.match(/(?:EDUCATION|ACADEMIC|QUALIFICATIONS)[:\s]*\n([\s\S]*?)(?=\n(?:EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|REFERENCES|$))/i)
    if (eduSectionMatch) {
        const eduLines = eduSectionMatch[1].split('\n').filter(l => l.trim())
        let currentEdu: EducationEntry | null = null

        for (const line of eduLines) {
            const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/)
            const degreeMatch = line.match(/\b(B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|Bachelor|Master|Associate|Diploma|Certificate)\b/i)
            if (degreeMatch || (yearMatch && line.trim().length < 100)) {
                if (currentEdu && currentEdu.school) {
                    education.push(currentEdu)
                }
                currentEdu = {
                    school: '',
                    degree: line.trim(),
                    field: '',
                    graduation_year: yearMatch ? yearMatch[1] : ''
                }
            } else if (currentEdu && !currentEdu.school && line.trim().length > 2) {
                currentEdu.school = line.trim()
            }
        }
        if (currentEdu && (currentEdu.school || currentEdu.degree)) {
            education.push(currentEdu)
        }
    }

    return {
        name: name || 'Unknown',
        email: emailMatch,
        phone: phoneMatch,
        skills: foundSkills,
        experience,
        education,
        isMock: false,
        parsedWithFallback: true
    }
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const filePath = formData.get('filePath') as string

        console.log(`[Resume Upload] Processing: ${file?.name}, size: ${file?.size}b, Gemini key: ${!!apiKey}`)

        if (!file || !filePath) {
            return NextResponse.json({ error: 'File and filePath are required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 1. Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // 2. Extract Text
        let extractedText = ''
        try {
            extractedText = await parseResume(buffer, file.type)
            console.log(`[Resume Upload] ✅ Text extracted: ${extractedText.length} chars`)
            console.log(`[Resume Upload] 📄 Preview: ${extractedText.substring(0, 300)}`)
        } catch (extractError: unknown) {
            const errorMessage = extractError instanceof Error ? extractError.message : 'Unknown extraction error'
            console.error('[Resume Upload] ❌ Text Extraction Failed:', extractError)
            return NextResponse.json({ error: `Text extraction failed: ${errorMessage}` }, { status: 500 })
        }

        // 3. AI Structured Analysis (with regex fallback)
        let structuredData: StructuredResumeData = {
            name: 'Unknown',
            email: user.email || '',
            phone: null,
            skills: [],
            experience: [],
            education: []
        }

        if (ai) {
            try {
                console.log('[Resume Upload] 🤖 Calling Gemini...')
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `Parse the following RESUME text and return a JSON object with this exact structure:
{
  "name": "Full name exactly as written",
  "email": "Email address",
  "phone": "Phone number",
  "skills": ["Every skill, tool, language, or framework mentioned"],
  "experience": [
    { 
      "company": "Company Name", 
      "title": "Job Title", 
      "start_date": "Start Date (e.g., Jan 2020 or 2020)", 
      "end_date": "End Date (e.g., Present, Dec 2023)", 
      "description": "Full description of responsibilities and achievements" 
    }
  ],
  "education": [
    { 
      "school": "University or School Name", 
      "degree": "Degree Level (e.g., Bachelor of Science)", 
      "field": "Major or Field of Study", 
      "graduation_year": "Year of Graduation" 
    }
  ]
}

RESUME TEXT:
${extractedText}`,
                    config: {
                        systemInstruction: `You are an expert ATS (Applicant Tracking System) resume parser. Your job is to extract highly structured data from a raw resume text.
Rules:
1. Extract ALL work experience (jobs, internships, freelance) into the "experience" array. Do not miss any past roles.
2. Extract ALL educational history (degrees, universities, certifications) into the "education" array.
3. Keep descriptions detailed but formatted as a single string.
4. If a field is not found, use null or an empty string/array.
5. Return valid JSON only, exactly matching the requested format.`,
                        temperature: 0,
                        responseMimeType: "application/json"
                    }
                })

                const content = response.text
                if (content) {
                    // Strip markdown wrapping (```json ... ```) that Gemini sometimes adds
                    const cleanJson = content.replace(/```json\n?/g, '').replace(/```/g, '').trim()
                    try {
                        structuredData = JSON.parse(cleanJson)
                        structuredData.isMock = false
                        console.log('[Resume Upload] ✅ AI parsed successfully.')
                    } catch (parseError) {
                        console.error('[Resume Upload] ❌ Failed to parse Gemini JSON output:', cleanJson)
                        throw new Error("Invalid JSON from Gemini")
                    }
                } else {
                    structuredData = parseResumeWithRegex(extractedText, user.email || '')
                }

            } catch (aiError: unknown) {
                const errorMessage = aiError instanceof Error ? aiError.message : String(aiError)
                const isQuotaError = errorMessage.includes('429') || errorMessage.includes('Resource has been exhausted')
                console.error(`[Resume Upload] ❌ Gemini Error (${isQuotaError ? 'QUOTA EXCEEDED' : 'API ERROR'}):`, errorMessage)

                // Use regex-based parser instead of mock data
                console.log('[Resume Upload] 🔄 Using regex fallback parser...')
                structuredData = parseResumeWithRegex(extractedText, user.email || '')
                structuredData.isMock = true // Let frontend know this isn't fully AI
                    // We add an explicit tag so the frontend can optionally warn the user
                    ; (structuredData as any).aiError = isQuotaError ? "Gemini Quota Exceeded. Using basic fallback text extraction." : "AI Processing Failed. Using basic fallback text extraction."
                console.log('[Resume Upload] ✅ Regex parsed:', JSON.stringify(structuredData, null, 2))
            }
        } else {
            console.warn('[Resume Upload] ⚠️ No API Key — using regex fallback')
            structuredData = parseResumeWithRegex(extractedText, user.email || '')
        }

        // 4. Save to Database
        const { data, error } = await supabase
            .from('resumes')
            .insert({
                user_id: user.id,
                file_path: filePath,
                file_name: file.name,
                extracted_text: extractedText,
                structured_data: structuredData
            })
            .select()
            .single()

        if (error) {
            console.error('[Resume Upload] ❌ DB Error:', error)
            return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 })
        }

        console.log('[Resume Upload] ✅ Saved resume ID:', data.id)
        return NextResponse.json({
            success: true,
            data,
            warning: (structuredData as any).aiError || null
        })

    } catch (error: unknown) {
        console.error('[Resume Upload] ❌ Fatal Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

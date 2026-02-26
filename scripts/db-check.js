
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function check() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    console.log("Checking Jobs...")
    const { data: jobs } = await supabase.from('jobs').select('title, url').limit(5)
    console.log("Jobs URLs:", jobs?.map(j => j.url))

    console.log("\nChecking Resumes...")
    const { data: resumes } = await supabase.from('resumes').select('id, file_name, extracted_text').limit(1)
    if (resumes && resumes[0]) {
        console.log("Resume ID:", resumes[0].id)
        console.log("File Name:", resumes[0].file_name)
        console.log("Extracted Text Length:", resumes[0].extracted_text?.length)
        console.log("Extracted Text Preview:", resumes[0].extracted_text?.substring(0, 100))
    } else {
        console.log("No resumes found.")
    }
}

check()

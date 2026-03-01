import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role to bypass RLS

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fetchLearningPaths() {
    const { data, error } = await supabase
        .from('learning_paths')
        .select('*, profiles(email), jobs(title)')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching data:", error)
        return
    }

    if (!data || data.length === 0) {
        console.log("No learning paths found in the database yet!")
        return
    }

    const outputPath = path.resolve(process.cwd(), 'test_data', 'learning_paths_export.json')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    console.log(`Successfully exported ${data.length} learning path(s) to ${outputPath}`)
}

fetchLearningPaths()

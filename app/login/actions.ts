
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in a real app, you would validate these
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log(`Attempting login for: ${email}`)
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error.message, error.status)
        return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    console.log('Login successful for:', data.user?.email)
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const origin = (await headers()).get('origin')
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    console.log(`Attempting signup for: ${email}`)
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: fullName,
            }
        },
    })

    if (error) {
        console.error('Signup error:', error.message, error.status)
        return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    console.log('Signup successful, user data:', !!data.user)
    return redirect('/login?message=Check email to continue sign in process')
}

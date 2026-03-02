import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Verify the user is currently authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // 2. We need the Service Role Key to delete a user from auth.users
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
        }

        const supabaseAdmin = createSupabaseClient(supabaseUrl.trim(), supabaseServiceKey.trim());

        // 3. Delete the user
        // Note: Because we have ON DELETE CASCADE on the profiles table, 
        // deleting the user from auth.users will automatically delete their profile, resumes, jobs, etc.
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error("Error deleting user:", error);
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Exception during user deletion:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

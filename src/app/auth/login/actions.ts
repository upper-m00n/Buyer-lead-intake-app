'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const email = formData.get('email') as string

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          // Add async and await here
          const cookieObj = await cookies();
          return cookieObj.get(name)?.value;
        },
        async set(name: string, value: string, options) {
          // Add async and await here
          const cookieObj = await cookies();
          await cookieObj.set({ name, value, ...options });
        },
        async remove(name: string, options) {
          // Add async and await here
          const cookieObj = await cookies();
          await cookieObj.delete({ name, ...options });
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error(error)
    return { error }
  }

  return { error: null }
}
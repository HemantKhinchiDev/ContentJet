import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const cookieStore = cookies()

  // 🔴 IMPORTANT: create redirect response FIRST
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // ===============================
  // 1️⃣ EMAIL VERIFICATION FLOW
  // ===============================
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=verification_failed`
      )
    }

    // Optional: Prisma sync AFTER successful verification
    if (data?.user?.email) {
      try {
        const { prisma } = await import('@/lib/prisma')

        await prisma.user.upsert({
          where: { email: data.user.email },
          update: {
            emailVerified: new Date(),
            email_confirmed_at: new Date(),
            updatedAt: new Date(),
          },
          create: {
            id: data.user.id,
            email: data.user.email,
            emailVerified: new Date(),
            email_confirmed_at: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      } catch (err) {
        console.error('Prisma sync error:', err)
        // Do NOT block verification if DB fails
      }
    }

    return response
  }

  // ===============================
  // 2️⃣ OAUTH FLOW (Google/GitHub)
  // ===============================
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=oauth_failed`
      )
    }

    return response
  }

  // ===============================
  // 3️⃣ INVALID CALLBACK
  // ===============================
  return NextResponse.redirect(
    `${origin}/login?error=invalid_callback`
  )
}

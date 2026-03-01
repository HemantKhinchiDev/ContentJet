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

  // 🆕 ADDED: Log all incoming params so failures are visible in the terminal
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 [Auth Callback] Route hit')
  console.log('📋 [Auth Callback] Params:', { token_hash: token_hash ? '[present]' : null, type, code: code ? '[present]' : null, next })
  console.log('🌐 [Auth Callback] Origin:', origin)

  const cookieStore = await cookies()

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
    console.log(`📧 [Auth Callback] Attempting email verification (type: ${type})`)

    const { data, error } = await supabase.auth.verifyOtp({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
      token_hash,
    })

    if (error) {
      // 🆕 ADDED: Log full error details and include msg in redirect URL
      console.error('❌ [Auth Callback] verifyOtp failed:', {
        message: error.message,
        status: error.status,
        name: error.name,
      })
      return NextResponse.redirect(
        `${origin}/login?error=verification_failed&msg=${encodeURIComponent(error.message)}`
      )
    }

    // 🆕 ADDED: Log success details
    console.log('✅ [Auth Callback] verifyOtp success')
    console.log(`   User: ${data?.user?.email}`)
    console.log(`   Confirmed at: ${data?.user?.email_confirmed_at}`)

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
    console.log('🔗 [Auth Callback] Attempting OAuth code exchange')

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ [Auth Callback] OAuth exchange failed:', {
        message: error.message,
        status: error.status,
      })
      return NextResponse.redirect(
        `${origin}/login?error=oauth_failed&msg=${encodeURIComponent(error.message)}`
      )
    }

    console.log('✅ [Auth Callback] OAuth exchange success')
    return response
  }

  // ===============================
  // 3️⃣ INVALID CALLBACK
  // ===============================
  console.warn('⚠️  [Auth Callback] No valid params (no token_hash, type, or code) — invalid callback')
  return NextResponse.redirect(
    `${origin}/login?error=invalid_callback`
  )
}

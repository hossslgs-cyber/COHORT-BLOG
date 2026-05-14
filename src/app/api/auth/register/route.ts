import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Check whitelist
    const { data: whitelistEntry } = await supabase
      .from('whitelist')
      .select('email')
      .eq('email', email)
      .single()

    if (!whitelistEntry) {
      return NextResponse.json(
        { error: 'Email is not whitelisted' },
        { status: 403 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    const { error } = await supabase.from('users').insert({
      id: userId,
      email,
      password: hashedPassword,
      github_user: email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'User registered successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: Request) {
  try {
    // --- Authenticate user with Clerk ---
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // --- Parse request body ---
    const { message } = await request.json()
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // --- Get user from DB ---
    let { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, organization_id, group_id')
      .eq('clerk_id', userId)
      .single()

    let userDbId = dbUser?.id
    let organizationId = dbUser?.organization_id
    let groupId = dbUser?.group_id

    // --- If user doesn't exist, create them ---
    if (!dbUser) {
      const { data: defaultOrg } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('name', 'Default Organization')
        .single()

      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          name: user?.fullName || user?.firstName || 'User',
          organization_id: defaultOrg?.id,
          role: 'user',
        })
        .select()
        .single()

      userDbId = newUser?.id
      organizationId = newUser?.organization_id
      groupId = newUser?.group_id
    }

    // --- Generate AI response ---
    const aiModel = 'gemini-pro'
    const sensitivityLevel = 'low' // placeholder, implement content filtering later

    const model = genAI.getGenerativeModel({
      model: aiModel,
      generationConfig: { maxOutputTokens: 1024 },
    })

    console.log('Generating content for message:', message)

    // Pass message as string
    const result = await model.generateContent(message)

    // Extract text from SDK response using the text() method
    const responseText = result.response.text()

    console.log('Response generated successfully:', responseText)

    // --- Log conversation to Supabase ---
    if (userDbId) {
      await supabaseAdmin.from('chat_logs').insert({
        user_id: userDbId,
        organization_id: organizationId,
        group_id: groupId,
        query: message,
        response: responseText,
        ai_model: aiModel,
        sensitivity_level: sensitivityLevel,
      })
    }

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

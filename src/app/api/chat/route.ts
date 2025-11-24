import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

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
      const userRole = (user?.publicMetadata as { role?: string })?.role || 'user'

      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          name: user?.fullName || user?.firstName || 'User',
          organization_id: null,
          role: userRole,
        })
        .select('id, organization_id, group_id')
        .single()

      userDbId = newUser?.id
      organizationId = newUser?.organization_id
      groupId = newUser?.group_id
    }

    // --- Check if user has an organization ---
    if (!organizationId) {
      return NextResponse.json({
        error: 'NO_ORGANIZATION',
        message: 'You must join an organization to use the chat'
      }, { status: 400 })
    }

    // --- Get organization details to check for classification model preference ---
    const { data: organization } = await supabaseAdmin
      .from('organizations')
      .select('classification_data_source_id')
      .eq('id', organizationId)
      .single()

    // --- Check for active data sources in the organization ---
    const { data: dataSources, error: dsError } = await supabaseAdmin
      .from('data_sources')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (dsError) {
      console.error('Error fetching data sources:', dsError)
      return NextResponse.json({ error: 'Failed to fetch AI models' }, { status: 500 })
    }

    // --- If no active data sources, return error ---
    if (!dataSources || dataSources.length === 0) {
      return NextResponse.json({
        error: 'NO_AI_MODEL',
        message: 'No AI model found. Please ask your administrator to add an AI model.'
      }, { status: 400 })
    }

    // --- Use organization's preferred classification model or first active data source ---
    let classificationModel = dataSources[0]

    if (organization?.classification_data_source_id) {
      const preferredModel = dataSources.find(ds => ds.id === organization.classification_data_source_id)
      if (preferredModel) {
        classificationModel = preferredModel
        console.log('Using organization-preferred classification model:', classificationModel.name)
      } else {
        console.log('Preferred classification model not found or inactive, using first active:', classificationModel.name)
      }
    } else {
      console.log('No preferred classification model set, using first active:', classificationModel.name)
    }

    // --- Classify the query ---
    let classification = 'public' // Default classification
    let classificationResponse = ''

    try {
      // Initialize the AI based on the provider type
      if (classificationModel.type === 'google') {
        const genAI = new GoogleGenerativeAI(classificationModel.api_key)
        const model = genAI.getGenerativeModel({
          model: classificationModel.model_name || 'gemini-2.0-flash-exp',
          generationConfig: { maxOutputTokens: 1024 },
        })

        // First, classify the content
        const classificationPrompt = `You are a data classification AI. Analyze the following query and classify it into ONE of these categories:
- PUBLIC: General information, public knowledge, non-sensitive
- INTERNAL: Company/organization internal information, not public but not highly sensitive
- CONFIDENTIAL: Sensitive business information, financial data, strategic plans
- RESTRICTED: Highly sensitive data, personal information, legal matters, security-critical

Query: "${message}"

Respond with ONLY the classification level (PUBLIC, INTERNAL, CONFIDENTIAL, or RESTRICTED) and nothing else.`

        const classResult = await model.generateContent(classificationPrompt)
        const classText = classResult.response.text().trim().toUpperCase()

        // Map the response to our classification levels
        if (classText.includes('RESTRICTED') || classText.includes('SENSITIVE')) {
          classification = 'restricted'
        } else if (classText.includes('CONFIDENTIAL')) {
          classification = 'confidential'
        } else if (classText.includes('INTERNAL')) {
          classification = 'internal'
        } else {
          classification = 'public'
        }

        console.log('Classification:', classification)

        // --- Check for rules to determine which AI model to use ---
        const { data: rules } = await supabaseAdmin
          .from('rules')
          .select('*, data_source:data_sources(*)')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .eq('classification_level', classification)
          .order('priority', { ascending: false })
          .limit(1)

        // Determine which data source to use for the actual response
        let responseDataSource = classificationModel // Default to classification model

        if (rules && rules.length > 0 && rules[0].data_source) {
          responseDataSource = rules[0].data_source
          console.log('Using rule-based model:', responseDataSource.name)
        }

        // Generate the actual response using the determined model
        let responseAI = genAI
        if (responseDataSource.id !== classificationModel.id) {
          // Different model, initialize it
          if (responseDataSource.type === 'google') {
            responseAI = new GoogleGenerativeAI(responseDataSource.api_key)
          }
        }

        const responseModel = responseAI.getGenerativeModel({
          model: responseDataSource.model_name || 'gemini-2.0-flash-exp',
          generationConfig: { maxOutputTokens: 2048 },
        })

        const result = await responseModel.generateContent(message)
        classificationResponse = result.response.text()

      } else {
        // For now, only Google is supported
        return NextResponse.json({
          error: 'UNSUPPORTED_PROVIDER',
          message: 'Only Google AI models are currently supported'
        }, { status: 400 })
      }

    } catch (aiError) {
      console.error('AI generation error:', aiError)
      return NextResponse.json({
        error: 'AI_ERROR',
        message: 'Failed to generate AI response. Please check your API key.'
      }, { status: 500 })
    }

    // --- Log conversation to Supabase ---
    if (userDbId) {
      await supabaseAdmin.from('chat_logs').insert({
        user_id: userDbId,
        organization_id: organizationId,
        group_id: groupId,
        query: message,
        response: classificationResponse,
        ai_model: classificationModel.name,
        sensitivity_level: classification,
      })
    }

    return NextResponse.json({
      response: classificationResponse,
      classification: classification,
      model: classificationModel.name
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

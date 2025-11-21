import { NextRequest, NextResponse } from 'next/server'
import { generateProjectPlan } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json()

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { error: 'Project idea is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    const plan = await generateProjectPlan(idea)
    
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error generating project plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate project plan' },
      { status: 500 }
    )
  }
}

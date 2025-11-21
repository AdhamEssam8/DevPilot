import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
})

export interface ProjectPlan {
  project_name: string
  summary: string
  estimated_weeks: number
  phases: {
    name: string
    description: string
    tasks: {
      title: string
      description: string
      estimate_hours: number
      priority: 'high' | 'medium' | 'low'
    }[]
  }[]
}

export async function generateProjectPlan(idea: string): Promise<ProjectPlan> {
  const systemPrompt = `You are DevPilot Assistant. When given a short project idea, produce a structured project plan for a software developer. Output strict JSON only with fields: project_name, summary, estimated_weeks, phases. Each phase must have: name, description, tasks (array of {title, description, estimate_hours, priority}). Keep JSON valid.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: idea }
    ],
    temperature: 0.7,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    return JSON.parse(content) as ProjectPlan
  } catch (error) {
    throw new Error('Failed to parse OpenAI response as JSON')
  }
}

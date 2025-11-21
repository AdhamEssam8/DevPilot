'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProjectPlan } from '@/types'
import { Wand2, Loader2, CheckCircle } from 'lucide-react'

interface ProjectPlannerProps {
  onGenerateBoard: (plan: ProjectPlan) => void
}

export function ProjectPlanner({ onGenerateBoard }: ProjectPlannerProps) {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<ProjectPlan | null>(null)
  const [error, setError] = useState('')

  const generatePlan = async () => {
    if (!idea.trim()) return

    setLoading(true)
    setError('')
    setPlan(null)

    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: idea.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate project plan')
      }

      const data = await response.json()
      setPlan(data)
    } catch (err) {
      setError('Failed to generate project plan. Please try again.')
      console.error('Error generating plan:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBoard = () => {
    if (plan) {
      onGenerateBoard(plan)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          AI Project Planner
        </CardTitle>
        <CardDescription>
          Describe your project idea and get an AI-generated development plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="project-idea" className="block text-sm font-medium text-gray-700 mb-2">
            Project Idea
          </label>
          <textarea
            id="project-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., Build a task management app with React and Node.js"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        </div>

        <Button
          onClick={generatePlan}
          disabled={loading || !idea.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Project Plan
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {plan && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-800">Project Plan Generated!</h3>
              </div>
              <p className="text-sm text-green-700">
                <strong>{plan.project_name}</strong> - {plan.summary}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Estimated duration: {plan.estimated_weeks} weeks
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Development Phases:</h4>
              {plan.phases.map((phase, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <h5 className="font-medium text-gray-900">{phase.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                  <div className="space-y-1">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{task.title}</span>
                        <span className="text-gray-500">
                          {task.estimate_hours}h • {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleGenerateBoard}
              className="w-full"
            >
              Generate Kanban Board
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

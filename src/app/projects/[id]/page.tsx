'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Project, Task } from '@/types'
import { ArrowLeft, Edit, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function ProjectDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  useEffect(() => {
    if (user && projectId) {
      fetchProject()
      fetchTasks()
    }
  }, [user, projectId])

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', projectId)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user?.id)
        .order('order_index')

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const calculateProgress = () => {
    if (tasks.length === 0) return 0
    const doneTasks = tasks.filter(task => task.status === 'done').length
    return Math.round((doneTasks / tasks.length) * 100)
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
          <Button asChild>
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  const progress = calculateProgress()

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {project.client?.name || 'No client assigned'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Link>
          </Button>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Project Progress</span>
                <span className="text-sm font-semibold text-gray-900">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
              <p className="text-xs text-gray-500 mt-1">
                {tasks.filter(t => t.status === 'done').length} of {tasks.length} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions Section (Optional) */}
        {showAISuggestions && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Based on your project progress, here are some recommendations:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Consider breaking down large tasks into smaller, more manageable pieces</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Review tasks in "In Progress" that have been there for more than a week</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Prioritize tasks based on client deadlines and dependencies</span>
                    </li>
                  </ul>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAISuggestions(false)}
                  className="ml-4"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kanban Board */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <div className="flex items-center gap-2">
              {!showAISuggestions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAISuggestions(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Suggestions
                </Button>
              )}
              <Button
                onClick={() => {
                  const title = prompt('Enter task title:')
                  if (!title) return
                  
                  supabase
                    .from('tasks')
                    .insert({
                      project_id: projectId,
                      user_id: user?.id,
                      title,
                      status: 'todo',
                      order_index: tasks.filter(t => t.status === 'todo').length,
                    })
                    .then(() => fetchTasks())
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
          <KanbanBoard projectId={projectId} onTasksChange={fetchTasks} />
        </div>
      </div>
    </Layout>
  )
}

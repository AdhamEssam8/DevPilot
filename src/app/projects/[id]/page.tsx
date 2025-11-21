'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Project, ProjectPlan } from '@/types'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { ProjectPlanner } from '@/components/ai/ProjectPlanner'
import { ArrowLeft, ExternalLink, Archive, Edit } from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPlanner, setShowPlanner] = useState(false)

  useEffect(() => {
    if (user && projectId) {
      fetchProject()
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

  const archiveProject = async () => {
    if (!confirm('Are you sure you want to archive this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', projectId)

      if (error) throw error
      router.push('/projects')
    } catch (error) {
      console.error('Error archiving project:', error)
    }
  }

  const handleGenerateBoard = async (plan: ProjectPlan) => {
    if (!project) return

    try {
      // Create tasks from the AI plan
      const tasks = plan.phases.flatMap((phase, phaseIndex) =>
        phase.tasks.map((task, taskIndex) => ({
          project_id: project.id,
          user_id: user?.id,
          title: task.title,
          description: task.description,
          status: 'backlog' as const,
          order_index: phaseIndex * 100 + taskIndex,
          estimate_hours: task.estimate_hours,
        }))
      )

      const { error } = await supabase
        .from('tasks')
        .insert(tasks)

      if (error) throw error

      setShowPlanner(false)
      // Refresh the page to show new tasks
      window.location.reload()
    } catch (error) {
      console.error('Error creating tasks:', error)
      alert('Error creating tasks. Please try again.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">
                {project.client?.name || 'No client assigned'} • {project.status}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={archiveProject}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          </div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                )}

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.repo_url && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Repository</h3>
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Repository
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowPlanner(!showPlanner)}
                  className="w-full"
                >
                  AI Project Planner
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/invoices/new?project=${project.id}`}>
                    Create Invoice
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {project.client && (
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-medium">{project.client.name}</h3>
                    {project.client.email && (
                      <p className="text-sm text-gray-600">{project.client.email}</p>
                    )}
                    {project.client.phone && (
                      <p className="text-sm text-gray-600">{project.client.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* AI Project Planner */}
        {showPlanner && (
          <ProjectPlanner onGenerateBoard={handleGenerateBoard} />
        )}

        {/* Kanban Board */}
        <KanbanBoard projectId={project.id} />
      </div>
    </Layout>
  )
}

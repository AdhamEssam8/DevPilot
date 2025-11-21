'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Project, Task, ProjectResource, ProjectNote, ProjectChatMessage } from '@/types'
import { 
  ArrowLeft, 
  Edit, 
  FileText,
  TrendingUp,
  Kanban,
  FolderOpen,
  StickyNote
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ProjectTabs } from '@/components/projects/ProjectTabs'

export default function ProjectDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [resources, setResources] = useState<ProjectResource[]>([])
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [recentMessages, setRecentMessages] = useState<ProjectChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && projectId) {
      fetchProject()
      fetchOverviewData()
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

  const fetchOverviewData = async () => {
    try {
      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch resources
      const { data: resourcesData } = await supabase
        .from('project_resources')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch notes
      const { data: notesData } = await supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(5)

      // Fetch recent chat messages
      const { data: messagesData } = await supabase
        .from('project_chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(5)

      setTasks(tasksData || [])
      setResources(resourcesData || [])
      setNotes(notesData || [])
      setRecentMessages((messagesData || []) as ProjectChatMessage[])
    } catch (error) {
      console.error('Error fetching overview data:', error)
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
  const allTasks = tasks // We'll fetch all tasks for progress calculation
  const taskStats = {
    total: allTasks.length,
    done: allTasks.filter(t => t.status === 'done').length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    todo: allTasks.filter(t => t.status === 'todo' || t.status === 'backlog').length,
  }

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

        {/* Navigation Tabs */}
        <ProjectTabs />

        {/* Overview Content */}
        {pathname === `/projects/${projectId}` && (
          <div className="space-y-6">
            {/* Project Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Project Progress</span>
                    <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                  <p className="text-xs text-gray-500 mt-1">
                    {taskStats.done} of {taskStats.total} tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{taskStats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Kanban className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{taskStats.inProgress}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Resources</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{resources.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{notes.length}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <StickyNote className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tasks */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/projects/${projectId}/kanban`}>
                      View All
                    </Link>
                  </Button>
                </div>
                {tasks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <StatusBadge
                            variant={
                              task.status === 'done'
                                ? 'success'
                                : task.status === 'in_progress'
                                ? 'info'
                                : 'pending'
                            }
                          >
                            {task.status.replace('_', ' ')}
                          </StatusBadge>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(task.created_at), 'MMM d')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Resources */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Resources</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/projects/${projectId}/resources`}>
                      View All
                    </Link>
                  </Button>
                </div>
                {resources.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No resources yet</p>
                ) : (
                  <div className="space-y-3">
                    {resources.slice(0, 5).map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{resource.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {resource.file_type} • {format(new Date(resource.created_at), 'MMM d')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Notes */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/projects/${projectId}/notes`}>
                      View All
                    </Link>
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
                ) : (
                  <div className="space-y-3">
                    {notes.slice(0, 5).map((note) => (
                      <div
                        key={note.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <StickyNote className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{note.title}</p>
                            {note.content && (
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                {note.content}
                              </p>
                            )}
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {note.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(note.updated_at), 'MMM d')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Chat Messages */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/projects/${projectId}/chat`}>
                      View All
                    </Link>
                  </Button>
                </div>
                {recentMessages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.slice(0, 5).map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {message.user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              {message.user_id === user?.id ? 'You' : message.user?.email?.split('@')[0] || 'User'}
                            </p>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

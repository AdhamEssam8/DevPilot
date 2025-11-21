'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Project, Task } from '@/types'
import { ArrowLeft, Edit, Plus, Sparkles, FileText, MessageSquare, StickyNote, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { format } from 'date-fns'
import { ProjectPlanner } from '@/components/ai/ProjectPlanner'

export default function KanbanScreen() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  const columns: { id: string; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ]

  const mapStatusToColumn = (status: string): string => {
    if (status === 'todo' || status === 'backlog') return 'todo'
    if (status === 'in_progress' || status === 'review') return 'in_progress'
    if (status === 'done') return 'done'
    return 'todo'
  }

  const getStatusVariant = (status: string): 'pending' | 'success' | 'error' | 'info' => {
    if (status === 'done') return 'success'
    if (status === 'in_progress') return 'info'
    return 'pending'
  }

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

  const fetchTasks = useCallback(async () => {
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
  }, [projectId, user?.id])

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = mapStatusToColumn(destination.droppableId)
    const taskId = draggableId

    setTasks(prev => {
      const newTasks = [...prev]
      const taskIndex = newTasks.findIndex(task => task.id === taskId)
      
      if (taskIndex !== -1) {
        newTasks[taskIndex] = {
          ...newTasks[taskIndex],
          status: newStatus as any,
        }
      }
      
      return newTasks
    })

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      fetchTasks()
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      const mappedStatus = mapStatusToColumn(task.status)
      return mappedStatus === status
    })
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
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600 mt-1">Kanban Board</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAISuggestions(!showAISuggestions)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Planner
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                const title = prompt('Enter task title:')
                if (!title) return
                
                try {
                  const { error } = await supabase
                    .from('tasks')
                    .insert({
                      project_id: projectId,
                      user_id: user?.id,
                      title,
                      status: 'todo',
                      order_index: tasks.filter(t => t.status === 'todo').length,
                    })
                  
                  if (error) throw error
                  fetchTasks()
                  const refreshFn = (window as any)[`kanban_refresh_${projectId}`]
                  if (refreshFn) refreshFn()
                } catch (error) {
                  console.error('Error creating task:', error)
                  alert('Failed to create task')
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
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

        {/* AI Suggestions Section */}
        {showAISuggestions && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <ProjectPlanner
                onGenerateBoard={(plan) => {
                  console.log('Generated plan:', plan)
                  setShowAISuggestions(false)
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((column) => {
              const columnTasks = getTasksByStatus(column.id)
              
              return (
                <div key={column.id} className="space-y-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Droppable Column */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[400px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {columnTasks.length === 0 ? (
                          <div className="text-center py-8 text-sm text-gray-400">
                            No tasks
                          </div>
                        ) : (
                          columnTasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-3 cursor-move transition-shadow ${
                                    snapshot.isDragging
                                      ? 'shadow-lg ring-2 ring-blue-500'
                                      : 'hover:shadow-md'
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    {/* Task Title */}
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      {task.title}
                                    </h4>

                                    {/* Task Description */}
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}

                                    {/* Status Badge */}
                                    <div className="mb-3">
                                      <StatusBadge variant={getStatusVariant(task.status)}>
                                        {task.status.replace('_', ' ')}
                                      </StatusBadge>
                                    </div>

                                    {/* Progress Bar for task */}
                                    {task.estimate_hours && (
                                      <div className="mb-3">
                                        <ProgressBar value={0} />
                                        <p className="text-xs text-gray-500 mt-1">
                                          {task.estimate_hours}h estimated
                                        </p>
                                      </div>
                                    )}

                                    {/* Task Meta Info */}
                                    <div className="space-y-2 text-xs text-gray-500 mb-3">
                                      <div className="flex items-center gap-2">
                                        <span>Created {format(new Date(task.created_at), 'MMM d, yyyy')}</span>
                                      </div>
                                    </div>

                                    {/* Quick Links */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                      <Link
                                        href={`/projects/${projectId}/resources?task=${task.id}`}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                      >
                                        <FileText className="h-3 w-3" />
                                        Resources
                                      </Link>
                                      <Link
                                        href={`/projects/${projectId}/notes?task=${task.id}`}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                      >
                                        <StickyNote className="h-3 w-3" />
                                        Notes
                                      </Link>
                                      <Link
                                        href={`/projects/${projectId}/chat?task=${task.id}`}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                      >
                                        <MessageSquare className="h-3 w-3" />
                                        Chat
                                      </Link>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>
    </Layout>
  )
}


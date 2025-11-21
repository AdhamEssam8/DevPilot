'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Task, TaskStatus } from '@/types'
import { Clock, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface KanbanBoardProps {
  projectId: string
  onTasksChange?: () => void
}

// Map to 3 columns: To Do, In Progress, Done
const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

// Map other statuses to our 3 columns
const mapStatusToColumn = (status: TaskStatus): TaskStatus => {
  if (status === 'todo' || status === 'backlog') return 'todo'
  if (status === 'in_progress' || status === 'review') return 'in_progress'
  if (status === 'done') return 'done'
  return 'todo'
}

const getStatusVariant = (status: TaskStatus): 'pending' | 'success' | 'error' | 'info' => {
  if (status === 'done') return 'success'
  if (status === 'in_progress') return 'info'
  return 'pending'
}

export function KanbanBoard({ projectId, onTasksChange }: KanbanBoardProps) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }, [projectId, user?.id])

  useEffect(() => {
    if (user && projectId) {
      fetchTasks()
    }
  }, [user, projectId, fetchTasks])

  // Expose refresh function to parent
  useEffect(() => {
    if (onTasksChange) {
      const refreshKey = `kanban_refresh_${projectId}`
      ;(window as any)[refreshKey] = fetchTasks
      return () => {
        delete (window as any)[refreshKey]
      }
    }
  }, [projectId, onTasksChange, fetchTasks])

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = mapStatusToColumn(destination.droppableId as TaskStatus)
    const taskId = draggableId

    // Optimistic update
    setTasks(prev => {
      const newTasks = [...prev]
      const taskIndex = newTasks.findIndex(task => task.id === taskId)
      
      if (taskIndex !== -1) {
        newTasks[taskIndex] = {
          ...newTasks[taskIndex],
          status: newStatus,
        }
      }
      
      return newTasks
    })

    // Update in database
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error
      onTasksChange?.()
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert optimistic update
      fetchTasks()
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => {
      const mappedStatus = mapStatusToColumn(task.status)
      return mappedStatus === status
    })
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
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

                                {/* Task Meta Info */}
                                <div className="space-y-2 text-xs text-gray-500">
                                  {/* Assignee */}
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    <span>{user?.email?.split('@')[0] || 'Unassigned'}</span>
                                  </div>

                                  {/* Due Date (using created_at as placeholder) */}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      Created {format(new Date(task.created_at), 'MMM d, yyyy')}
                                    </span>
                                  </div>

                                  {/* Estimate Hours */}
                                  {task.estimate_hours && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      <span>{task.estimate_hours}h estimated</span>
                                    </div>
                                  )}
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
  )
}

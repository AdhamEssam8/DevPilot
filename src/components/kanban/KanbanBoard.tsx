'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Task, TaskStatus } from '@/types'
import { Plus, Clock, User } from 'lucide-react'

interface KanbanBoardProps {
  projectId: string
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-100' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-100' },
  { id: 'review', title: 'Review', color: 'bg-purple-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
]

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && projectId) {
      fetchTasks()
    }
  }, [user, projectId])

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
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = destination.droppableId as TaskStatus
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
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert optimistic update
      fetchTasks()
    }
  }

  const createTask = async (status: TaskStatus) => {
    const title = prompt('Enter task title:')
    if (!title) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          user_id: user?.id,
          title,
          status,
          order_index: tasks.filter(task => task.status === status).length,
        })
        .select()
        .single()

      if (error) throw error
      setTasks(prev => [...prev, data])
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Project Tasks</h2>
        <Button onClick={() => createTask('backlog')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className={`p-3 rounded-lg ${column.color}`}>
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <p className="text-sm text-gray-600">
                  {getTasksByStatus(column.id).length} tasks
                </p>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 bg-white rounded-lg shadow-sm border mb-2 transition-shadow ${
                              snapshot.isDragging
                                ? 'shadow-lg'
                                : 'hover:shadow-md'
                            }`}
                          >
                            <h4 className="font-medium text-gray-900 mb-1">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              {task.estimate_hours && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.estimate_hours}h
                                </div>
                              )}
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {user?.email?.split('@')[0]}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

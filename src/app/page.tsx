'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Project, Invoice, Task } from '@/types'
import { FolderOpen, CheckCircle2, FileText, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch all projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      // Fetch all invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      // Fetch all tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      setProjects(projectsData || [])
      setInvoices(invoicesData || [])
      setTasks(tasksData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  // Calculate KPIs
  const totalProjects = projects.length
  const activeTasks = tasks.filter(task => task.status !== 'done').length
  const pendingInvoices = invoices.filter(invoice => 
    invoice.status === 'draft' || invoice.status === 'sent'
  ).length
  const revenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0)

  // Get recent projects with progress
  const recentProjects = projects.slice(0, 5).map(project => {
    const projectTasks = tasks.filter(task => task.project_id === project.id)
    const completedTasks = projectTasks.filter(task => task.status === 'done').length
    const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0
    
    return {
      ...project,
      progress: Math.round(progress),
      taskCount: projectTasks.length,
      completedTasks
    }
  })

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'info'
      case 'completed':
      case 'done':
        return 'success'
      case 'pending':
        return 'pending'
      default:
        return 'pending'
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <FolderOpen className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{activeTasks}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Invoices</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingInvoices}</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3">
                  <FileText className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${(revenue / 1000).toFixed(1)}K</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects Table */}
        <Card className="border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No projects yet</p>
                <p className="text-sm text-gray-500">Get started by creating your first project</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Project Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Progress</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Due Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentProjects.map((project) => (
                      <tr 
                        key={project.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <Link 
                              href={`/projects/${project.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {project.name}
                            </Link>
                            {project.description && (
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge variant={getStatusVariant(project.status || 'pending')}>
                            {project.status || 'Pending'}
                          </StatusBadge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="w-40">
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                {project.completedTasks}/{project.taskCount} tasks
                              </span>
                              <span className="text-xs font-medium text-gray-900">{project.progress}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-in-out"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {project.updated_at ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(project.updated_at), 'MMM d, yyyy')}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No date</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

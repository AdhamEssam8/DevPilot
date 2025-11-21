'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Client } from '@/types'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    tech_stack: '',
    repo_url: '',
  })

  useEffect(() => {
    if (user) {
      fetchClients()
    }
  }, [user])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const techStackArray = formData.tech_stack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0)

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          name: formData.name,
          description: formData.description,
          client_id: formData.client_id || null,
          tech_stack: techStackArray,
          repo_url: formData.repo_url || null,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/projects/${data.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Project</h1>
            <p className="text-gray-600">Create a new development project</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Fill in the details for your new project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <select
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a client (optional)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No clients yet. <Link href="/clients/new" className="text-blue-600 hover:underline">Create one first</Link>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="tech_stack" className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack
                </label>
                <Input
                  id="tech_stack"
                  name="tech_stack"
                  value={formData.tech_stack}
                  onChange={handleInputChange}
                  placeholder="React, Node.js, PostgreSQL (comma-separated)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate technologies with commas
                </p>
              </div>

              <div>
                <label htmlFor="repo_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Repository URL
                </label>
                <Input
                  id="repo_url"
                  name="repo_url"
                  type="url"
                  value={formData.repo_url}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/projects')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

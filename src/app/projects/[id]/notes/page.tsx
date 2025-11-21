'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Project, ProjectNote } from '@/types'
import { ArrowLeft, Plus, Search, StickyNote, Tag, X, Edit2, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ProjectTabs } from '@/components/projects/ProjectTabs'

export default function NotesScreen() {
  const { user } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const taskId = searchParams.get('task')

  const [project, setProject] = useState<Project | null>(null)
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<ProjectNote | null>(null)
  const [showNewNote, setShowNewNote] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] as string[] })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (user && projectId) {
      fetchProject()
      fetchNotes()
    }
  }, [user, projectId, taskId])

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
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

  const fetchNotes = async () => {
    try {
      let query = supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })

      if (taskId) {
        query = query.eq('task_id', taskId)
      }

      const { data, error } = await query

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return

    try {
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          project_id: projectId,
          user_id: user?.id,
          title: newNote.title,
          content: newNote.content,
          tags: newNote.tags,
          task_id: taskId || null,
        })
        .select()
        .single()

      if (error) throw error

      setNotes([data, ...notes])
      setNewNote({ title: '', content: '', tags: [] })
      setShowNewNote(false)
    } catch (error) {
      console.error('Error creating note:', error)
      alert('Failed to create note')
    }
  }

  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.title.trim()) return

    try {
      const { data, error } = await supabase
        .from('project_notes')
        .update({
          title: editingNote.title,
          content: editingNote.content,
          tags: editingNote.tags || [],
        })
        .eq('id', editingNote.id)
        .eq('user_id', user?.id)
        .select()
        .single()

      if (error) throw error

      setNotes(notes.map(n => n.id === editingNote.id ? data : n))
      setEditingNote(null)
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Failed to update note')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user?.id)

      if (error) throw error

      setNotes(notes.filter(n => n.id !== noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note')
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return

    if (editingNote) {
      const tags = editingNote.tags || []
      if (!tags.includes(trimmedTag)) {
        setEditingNote({ ...editingNote, tags: [...tags, trimmedTag] })
      }
    } else {
      if (!newNote.tags.includes(trimmedTag)) {
        setNewNote({ ...newNote, tags: [...newNote.tags, trimmedTag] })
      }
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    if (editingNote) {
      setEditingNote({
        ...editingNote,
        tags: (editingNote.tags || []).filter(t => t !== tag),
      })
    } else {
      setNewNote({
        ...newNote,
        tags: newNote.tags.filter(t => t !== tag),
      })
    }
  }

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])))

  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag))
    return matchesSearch && matchesTag
  })

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
              <p className="text-sm text-gray-600 mt-1">Notes</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ProjectTabs />

        <div className="flex justify-end mb-4">
          <Button
            size="sm"
            onClick={() => setShowNewNote(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search and Tags */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTag === null
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* New Note Form */}
        {showNewNote && (
          <Card>
            <CardHeader>
              <CardTitle>New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <textarea
                placeholder="Note content..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {newNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(tagInput)
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tagInput)}
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateNote}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewNote(false)
                    setNewNote({ title: '', content: '', tags: [] })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notes found</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchQuery || selectedTag ? 'Try adjusting your search or filters' : 'Create your first note to get started'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                {editingNote?.id === note.id ? (
                  <CardContent className="p-4 space-y-4">
                    <Input
                      value={editingNote.title}
                      onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    />
                    <textarea
                      value={editingNote.content || ''}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                    />
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(editingNote.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-blue-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag(tagInput)
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTag(tagInput)}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateNote}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingNote(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{note.title}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNote(note)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {note.content && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-4">
                        {note.content}
                      </p>
                    )}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {format(new Date(note.updated_at), 'MMM d, yyyy')}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}


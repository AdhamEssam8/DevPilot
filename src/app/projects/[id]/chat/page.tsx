'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Project, ProjectChatMessage } from '@/types'
import { ArrowLeft, Send, Paperclip, User, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ProjectTabs } from '@/components/projects/ProjectTabs'

export default function ChatRoomScreen() {
  const { user } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const taskId = searchParams.get('task')

  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<ProjectChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && projectId) {
      fetchProject()
      fetchMessages()
      subscribeToMessages()
    }

    return () => {
      // Cleanup subscription
    }
  }, [user, projectId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('project_chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Add user email for current user's messages
      const messagesWithUsers: ProjectChatMessage[] = (data || []).map((msg: any): ProjectChatMessage => {
        const baseMessage = {
          id: msg.id,
          project_id: msg.project_id,
          user_id: msg.user_id,
          message: msg.message,
          resource_id: msg.resource_id || undefined,
          created_at: msg.created_at,
        }
        
        if (msg.user_id === user?.id && user?.email) {
          return {
            ...baseMessage,
            user: { email: user.email },
          }
        }
        
        return baseMessage
      })

      setMessages(messagesWithUsers)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`project-chat-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_chat_messages',
          filter: `project_id=eq.${projectId}`,
        },
        async         (payload) => {
          // Add the new message with user email if it's from current user
          const baseMessage = {
            id: payload.new.id,
            project_id: payload.new.project_id,
            user_id: payload.new.user_id,
            message: payload.new.message,
            resource_id: payload.new.resource_id || undefined,
            created_at: payload.new.created_at,
          }
          
          const newMessage: ProjectChatMessage = payload.new.user_id === user?.id && user?.email
            ? { ...baseMessage, user: { email: user.email } }
            : baseMessage
          
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!message.trim() || sending) return

    setSending(true)
    try {
      const { data, error } = await supabase
        .from('project_chat_messages')
        .insert({
          project_id: projectId,
          user_id: user?.id,
          message: message.trim(),
        })
        .select()
        .single()

      if (error) throw error

      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleAttachFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // In production, upload file and attach to message
    alert('File attachment feature coming soon!')
    event.target.value = ''
  }

  const getUserInitials = (email?: string) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  const getUserDisplayName = (email?: string) => {
    if (!email) return 'Unknown User'
    return email.split('@')[0]
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Team Chat</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ProjectTabs />

        {/* Chat Container */}
        <Card className="flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.user_id === user?.id
                  const userEmail = (msg as any).user?.email || user?.email
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {getUserInitials(userEmail)}
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {isOwnMessage ? 'You' : getUserDisplayName(userEmail)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-md ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          {msg.resource_id && (
                            <div className="mt-2 pt-2 border-t border-opacity-20">
                              <p className="text-xs opacity-80">📎 File attached</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-9 px-3">
                  <Paperclip className="h-4 w-4" />
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleAttachFile}
                />
              </label>
              <Input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || sending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </Layout>
  )
}


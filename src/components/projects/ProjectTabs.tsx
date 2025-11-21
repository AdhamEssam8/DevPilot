'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Kanban, FolderOpen, StickyNote, MessageSquare } from 'lucide-react'

export function ProjectTabs() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const projectId = params.id as string

  const getActiveTab = () => {
    if (pathname?.includes('/kanban')) return 'kanban'
    if (pathname?.includes('/resources')) return 'resources'
    if (pathname?.includes('/notes')) return 'notes'
    if (pathname?.includes('/chat')) return 'chat'
    return 'overview'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (tab: string) => {
    if (tab === 'overview') {
      router.push(`/projects/${projectId}`)
    } else {
      router.push(`/projects/${projectId}/${tab}`)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'resources', label: 'Resources', icon: FolderOpen },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ]

  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-0 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}


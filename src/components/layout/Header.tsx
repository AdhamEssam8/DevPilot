'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Plus, Bell } from 'lucide-react'

export function Header() {
  const { user } = useAuth()
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DP</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 hidden sm:block">DevPilot</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Link>
          </Button>
          
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium cursor-pointer hover:bg-blue-600 transition-colors">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  )
}

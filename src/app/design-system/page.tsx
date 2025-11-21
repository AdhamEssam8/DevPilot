'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Tag } from '@/components/ui/Tag'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Toggle } from '@/components/ui/Toggle'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Calendar } from '@/components/ui/Calendar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Radio, RadioGroup } from '@/components/ui/Radio'
import { DatePicker } from '@/components/ui/DatePicker'
import { TextEditor } from '@/components/ui/TextEditor'
import { Filter } from '@/components/ui/Filter'
import {
  Home,
  Users,
  Settings,
  FileText,
  Calendar as CalendarIcon,
  Search,
  Bell,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react'

export default function DesignSystemPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [tags, setTags] = useState(['Design', 'Development', 'Marketing'])
  const [isToggled, setIsToggled] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gray-900">DevPilot Design System</h1>
              <nav className="flex gap-6">
                <a href="#" className="text-sm font-medium text-blue-500">Components</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Guidelines</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Resources</a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                  <p className="mt-1 text-sm text-green-600">↑ 12% from last month</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">1,342</p>
                  <p className="mt-1 text-sm text-green-600">↑ 8% from last month</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">$45.2K</p>
                  <p className="mt-1 text-sm text-green-600">↑ 23% from last month</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Buttons & Inputs */}
          <div className="space-y-6">
            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Buttons</CardTitle>
                <CardDescription>Primary, secondary, and ghost variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                  Primary Button
                </Button>
                <Button variant="outline" className="w-full">
                  Secondary Button
                </Button>
                <Button variant="ghost" className="w-full">
                  Ghost Button
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                    Small
                  </Button>
                  <Button className="bg-blue-500 text-white hover:bg-blue-600">
                    Medium
                  </Button>
                  <Button size="lg" className="bg-blue-500 text-white hover:bg-blue-600">
                    Large
                  </Button>
                </div>
                <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                  With Icon
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Form Inputs</CardTitle>
                <CardDescription>Text inputs and selects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">
                    Email Address
                  </label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">
                    Select Option
                  </label>
                  <Select>
                    <option value="">Choose an option</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                  </Select>
                </div>
                <DatePicker label="Select Date" />
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
                <CardDescription>Removable tag components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Tag
                      key={index}
                      onRemove={() => setTags(tags.filter((_, i) => i !== index))}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Status Badges</CardTitle>
                <CardDescription>Different status indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge variant="pending">Pending</StatusBadge>
                  <StatusBadge variant="success">Success</StatusBadge>
                  <StatusBadge variant="error">Error</StatusBadge>
                  <StatusBadge variant="info">Info</StatusBadge>
                </div>
                <StatusBadge variant="pending" onClose={() => {}}>
                  With Close Button
                </StatusBadge>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Tabs, Calendar, Progress */}
          <div className="space-y-6">
            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Tabs Navigation</CardTitle>
                <CardDescription>Tabbed content interface</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview" icon={<Home className="h-4 w-4" />}>
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="analytics" icon={<Activity className="h-4 w-4" />}>
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger value="reports" icon={<FileText className="h-4 w-4" />}>
                      Reports
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <p className="text-sm text-gray-600">
                      Overview dashboard content showing key metrics and statistics.
                    </p>
                  </TabsContent>
                  <TabsContent value="analytics">
                    <p className="text-sm text-gray-600">
                      Analytics data with charts and detailed insights.
                    </p>
                  </TabsContent>
                  <TabsContent value="reports">
                    <p className="text-sm text-gray-600">
                      Generated reports and downloadable documents.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Progress Bars</CardTitle>
                <CardDescription>Track completion status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar value={75} label="Project Completion" />
                <ProgressBar value={45} label="Design Phase" />
                <ProgressBar value={90} label="Development Phase" />
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Calendar</CardTitle>
                <CardDescription>Date selection component</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar selected={selectedDate} onSelect={setSelectedDate} />
                {selectedDate && (
                  <p className="mt-3 text-sm text-gray-600">
                    Selected: {selectedDate.toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Toggle Switches</CardTitle>
                <CardDescription>Boolean settings control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle
                  label="Email Notifications"
                  checked={isToggled}
                  onChange={(e) => setIsToggled(e.target.checked)}
                />
                <Toggle label="Push Notifications" defaultChecked />
                <Toggle label="SMS Alerts" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Radio, Editor, Filters */}
          <div className="space-y-6">
            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Radio Buttons</CardTitle>
                <CardDescription>Single selection from options</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup>
                  <Radio name="plan" value="free" label="Free Plan" defaultChecked />
                  <Radio name="plan" value="pro" label="Pro Plan" />
                  <Radio name="plan" value="enterprise" label="Enterprise Plan" />
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Text Editor</CardTitle>
                <CardDescription>Rich text editing</CardDescription>
              </CardHeader>
              <CardContent>
                <TextEditor placeholder="Start typing here..." />
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Active filter chips</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Filter
                  title="Date Range"
                  subtitle="Last 30 days"
                  icon={<CalendarIcon className="h-4 w-4 text-gray-600" />}
                  onRemove={() => {}}
                />
                <Filter
                  title="Status"
                  subtitle="Active only"
                  icon={<Activity className="h-4 w-4 text-gray-600" />}
                  onRemove={() => {}}
                />
                <Filter
                  title="Team"
                  subtitle="Design Team"
                  icon={<Users className="h-4 w-4 text-gray-600" />}
                  onRemove={() => {}}
                />
              </CardContent>
            </Card>

            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'New user registered', time: '2 min ago' },
                    { title: 'Project milestone completed', time: '1 hour ago' },
                    { title: 'Invoice sent to client', time: '3 hours ago' },
                    { title: 'Team meeting scheduled', time: '5 hours ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 border-b border-gray-200 pb-3 last:border-0">
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Icons */}
        <Card className="mt-6 border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg">Icon Library</CardTitle>
            <CardDescription>Lucide icons with consistent sizing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col items-center gap-2">
                <Home className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Home</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Users</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Settings</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Files</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Calendar</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Search className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Search</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Notifications</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="text-xs text-gray-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>DevPilot Design System v1.0.0 • Built with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}


import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
}

function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const isSelected = selected && 
      date.toDateString() === selected.toDateString()
    const isToday = date.toDateString() === new Date().toDateString()

    days.push(
      <button
        key={day}
        onClick={() => onSelect?.(date)}
        className={cn(
          'rounded-md p-2 text-center text-sm hover:bg-gray-100 transition-colors',
          isSelected && 'bg-blue-500 text-white hover:bg-blue-600',
          isToday && !isSelected && 'border border-blue-500',
          'cursor-pointer'
        )}
      >
        {day}
      </button>
    )
  }

  return (
    <div className={cn('rounded-lg bg-white p-4 shadow-md', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="text-gray-600 hover:text-blue-500 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="text-gray-600 hover:text-blue-500 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(name => (
          <div key={name} className="text-center text-xs font-medium text-gray-600 p-2">
            {name}
          </div>
        ))}
        {days}
      </div>
    </div>
  )
}

export { Calendar }


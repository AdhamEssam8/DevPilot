import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, id, ...props }, ref) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <label htmlFor={toggleId} className="relative inline-block h-6 w-11 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            className="peer sr-only"
            {...props}
          />
          <div className="h-6 w-11 rounded-full bg-gray-600 transition-colors peer-checked:bg-blue-500" />
          <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </label>
        {label && (
          <label htmlFor={toggleId} className="cursor-pointer text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
      </div>
    )
  }
)
Toggle.displayName = 'Toggle'

export { Toggle }


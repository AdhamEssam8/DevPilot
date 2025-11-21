import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X, ChevronDown } from 'lucide-react'

interface FilterProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  onRemove?: () => void
  icon?: ReactNode
}

const Filter = forwardRef<HTMLDivElement, FilterProps>(
  ({ className, title, subtitle, onRemove, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-3',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="font-medium text-gray-900">{title}</div>
            {subtitle && (
              <div className="text-sm text-gray-600">{subtitle}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {children}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)
Filter.displayName = 'Filter'

export { Filter }


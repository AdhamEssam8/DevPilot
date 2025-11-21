import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface StatusBadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'pending' | 'success' | 'error' | 'info'
  onClose?: () => void
}

const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, children, variant = 'pending', onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium',
          {
            'bg-yellow-300 text-gray-900': variant === 'pending',
            'bg-green-100 text-green-800': variant === 'success',
            'bg-red-100 text-red-800': variant === 'error',
            'bg-blue-100 text-blue-800': variant === 'info',
          },
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-1 hover:opacity-70 transition-opacity"
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'

export { StatusBadge }


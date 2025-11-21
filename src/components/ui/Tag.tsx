import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface TagProps extends HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void
}

const Tag = forwardRef<HTMLDivElement, TagProps>(
  ({ className, children, onRemove, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-sm text-white',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }
)
Tag.displayName = 'Tag'

export { Tag }


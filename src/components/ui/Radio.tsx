import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={cn(
            'h-4 w-4 cursor-pointer border-2 border-gray-300 text-blue-500',
            'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className="cursor-pointer text-sm text-gray-900"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
Radio.displayName = 'Radio'

interface RadioGroupProps {
  children: React.ReactNode
  className?: string
}

function RadioGroup({ children, className }: RadioGroupProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {children}
    </div>
  )
}

export { Radio, RadioGroup }


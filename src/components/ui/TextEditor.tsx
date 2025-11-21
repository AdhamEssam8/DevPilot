import { useState, TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'

interface TextEditorProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  showToolbar?: boolean
}

const TextEditor = forwardRef<HTMLTextAreaElement, TextEditorProps>(
  ({ className, showToolbar = true, ...props }, ref) => {
    return (
      <div className={cn('w-full rounded-md border border-gray-300', className)}>
        {showToolbar && (
          <div className="flex gap-2 border-b border-gray-300 bg-gray-50 p-2">
            <button
              type="button"
              className="rounded-sm p-1.5 hover:bg-gray-200 transition-colors"
              title="Bold"
            >
              <Bold className="h-4 w-4 text-gray-700" />
            </button>
            <button
              type="button"
              className="rounded-sm p-1.5 hover:bg-gray-200 transition-colors"
              title="Italic"
            >
              <Italic className="h-4 w-4 text-gray-700" />
            </button>
            <button
              type="button"
              className="rounded-sm p-1.5 hover:bg-gray-200 transition-colors"
              title="Underline"
            >
              <Underline className="h-4 w-4 text-gray-700" />
            </button>
            <div className="mx-1 w-px bg-gray-300" />
            <button
              type="button"
              className="rounded-sm p-1.5 hover:bg-gray-200 transition-colors"
              title="Bullet List"
            >
              <List className="h-4 w-4 text-gray-700" />
            </button>
            <button
              type="button"
              className="rounded-sm p-1.5 hover:bg-gray-200 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        )}
        <textarea
          ref={ref}
          className="min-h-[100px] w-full resize-y rounded-b-md bg-white p-3 text-base text-gray-900 focus:outline-none"
          {...props}
        />
      </div>
    )
  }
)
TextEditor.displayName = 'TextEditor'

export { TextEditor }


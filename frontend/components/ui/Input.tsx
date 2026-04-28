'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export default function Input({ label, error, className, id, icon, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-white rounded-xl px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/60',
            'border border-transparent shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/30 caret-primary transition-shadow',
            error && 'ring-2 ring-error border-error/30',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-error font-body">{error}</p>}
    </div>
  )
}

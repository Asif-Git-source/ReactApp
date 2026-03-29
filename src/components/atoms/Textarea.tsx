/**
 * ATOM — Textarea
 *
 * Multiline text input. Follows the same forwardRef + memo pattern as
 * Input and Select atoms for consistent React Hook Form integration.
 *
 * resize-none: Prevents the user from resizing — use the rows prop to
 * control height declaratively instead.
 */
import { forwardRef, memo } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, rows = 3, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={!!error}
        className={cn(
          'w-full px-3 py-2 rounded-lg border text-sm resize-none',
          'bg-white dark:bg-slate-700 text-slate-900 dark:text-white',
          'placeholder-slate-400 dark:placeholder-slate-500',
          'focus:outline-none focus:ring-2 transition',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
            : 'border-slate-300 dark:border-slate-600 focus:ring-purple-500',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
export default memo(Textarea);

/**
 * ATOM — Input
 *
 * forwardRef: Allows React Hook Form to attach its internal ref to the real
 * DOM node — required for RHF's focus-on-error behavior.
 *
 * error prop: Switches border and focus ring to red when a validation
 * error message is present.
 */
import { forwardRef, memo } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={!!error}
        className={cn(
          'w-full px-3 py-2 rounded-lg border text-sm',
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

Input.displayName = 'Input';
export default memo(Input);

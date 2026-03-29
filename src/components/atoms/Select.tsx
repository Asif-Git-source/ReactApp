/**
 * ATOM — Select
 *
 * Dropdown select with an options array prop — callers pass data,
 * not JSX <option> elements.
 *
 * forwardRef: Required for React Hook Form Controller integration.
 * error prop: Matches Input atom's red-border error state.
 */
import { forwardRef, memo } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={!!error}
        className={cn(
          'w-full px-3 py-2 rounded-lg border text-sm',
          'bg-white dark:bg-slate-700 text-slate-900 dark:text-white',
          'focus:outline-none focus:ring-2 transition',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
            : 'border-slate-300 dark:border-slate-600 focus:ring-purple-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
export default memo(Select);

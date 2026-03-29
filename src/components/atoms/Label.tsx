/**
 * ATOM — Label
 *
 * Form label with optional required indicator (*).
 * Used with FormField molecule to associate labels with inputs.
 */
import { memo } from 'react';
import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = ({ required, children, className = '', ...props }: LabelProps) => (
  <label
    className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ${className}`}
    {...props}
  >
    {children}
    {required && (
      <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
    )}
  </label>
);

export default memo(Label);

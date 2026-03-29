/**
 * MOLECULE — FormField
 *
 * Composes Label + Input/Select/Textarea + error/hint text into a single
 * reusable form field. The key molecule for React Hook Form integration.
 *
 * React Hook Form integration:
 *
 *   Mode 1 — register() for simple inputs:
 *     <FormField label="Email" required error={errors.email?.message}
 *       inputProps={register('email')} />
 *
 *   Mode 2 — Controller for Select/custom inputs:
 *     <Controller control={control} name="role"
 *       render={({ field, fieldState }) => (
 *         <FormField as="select" label="Role" options={roleOptions}
 *           error={fieldState.error?.message} inputProps={field} />
 *       )} />
 *
 * Why forwardRef on atoms matters: RHF's register() and Controller field
 * both include a ref. The forwardRef atoms pass this ref to the real DOM
 * node, enabling RHF's focus-on-first-error behavior.
 */
import { memo } from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Textarea from '../atoms/Textarea';

type FormFieldAs = 'input' | 'select' | 'textarea';

interface SelectOption {
  value: string;
  label: string;
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  as?: FormFieldAs;
  options?: SelectOption[];
  inputProps?: Record<string, unknown>;
  id?: string;
  className?: string;
}

const FormField = ({
  label,
  required,
  error,
  hint,
  as = 'input',
  options = [],
  inputProps = {},
  id,
  className = '',
}: FormFieldProps) => {
  // Auto-generate id from label if not provided — links <label htmlFor> to input
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className={className}>
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>

      {as === 'select' && (
        <Select
          id={fieldId}
          options={options}
          error={error}
          {...(inputProps as Record<string, unknown>)}
        />
      )}

      {as === 'textarea' && (
        <Textarea
          id={fieldId}
          error={error}
          {...(inputProps as Record<string, unknown>)}
        />
      )}

      {as === 'input' && (
        <Input
          id={fieldId}
          error={error}
          {...(inputProps as Record<string, unknown>)}
        />
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
};

export default memo(FormField);

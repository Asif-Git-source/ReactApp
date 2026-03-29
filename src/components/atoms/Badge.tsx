/**
 * ATOM — Badge
 * Stateless display component. Pure function of props.
 */
import { memo } from 'react';

type BadgeVariant = 'todo' | 'in-progress' | 'review' | 'done' | 'low' | 'medium' | 'high';

const styles: Record<BadgeVariant, string> = {
  'todo': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'done': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'low': 'bg-slate-100 text-slate-500',
  'medium': 'bg-orange-100 text-orange-600',
  'high': 'bg-red-100 text-red-600',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const Badge = ({ variant, label }: BadgeProps) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
    {label ?? variant}
  </span>
);

export default memo(Badge);

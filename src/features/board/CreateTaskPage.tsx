/**
 * CREATE TASK PAGE
 *
 * Full-page dedicated task creation form at /board/new.
 * Demonstrates React Hook Form + Zod with ALL Task fields —
 * more complete than the quick-add modal in BoardPage.
 *
 * Additional RHF concepts shown here:
 *  - z.enum().default() — Zod sets a default without needing defaultValues
 *  - isSubmitting — disables the submit button during async work
 *  - All field types: text input, textarea, select
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { addTask } from './boardSlice';
import { useToast } from '../../components/organisms/Toast';
import FormField from '../../components/molecules/FormField';

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less'),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z
    .string()
    .min(1, 'Assignee is required'),
  tag: z.enum(['frontend', 'backend', 'devops', 'design', 'testing']),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
];

const TAG_OPTIONS = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend',  label: 'Backend'  },
  { value: 'devops',   label: 'DevOps'   },
  { value: 'design',   label: 'Design'   },
  { value: 'testing',  label: 'Testing'  },
];

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review',      label: 'In Review'   },
  { value: 'done',        label: 'Done'        },
];

const ASSIGNEE_OPTIONS = [
  { value: 'Alex J.',   label: 'Alex J.'   },
  { value: 'Sam R.',    label: 'Sam R.'    },
  { value: 'Jamie K.',  label: 'Jamie K.'  },
  { value: 'Taylor M.', label: 'Taylor M.' },
  { value: 'You',       label: 'Me'        },
];

export default function CreateTaskPage() {
  const navigate    = useNavigate();
  const dispatch    = useAppDispatch();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title:       '',
      description: '',
      status:      'todo' as const,
      priority:    'medium' as const,
      tag:         'frontend' as const,
      assignee:    'You',
    },
  });

  const onSubmit = async (data: CreateTaskFormData) => {
    await new Promise((r) => setTimeout(r, 400)); // simulate save
    dispatch(addTask({
      title:       data.title,
      description: data.description ?? '',
      status:      data.status,
      priority:    data.priority,
      assignee:    data.assignee,
      tag:         data.tag,
    }));
    showToast('Task created!', 'success');
    navigate('/board');
  };

  return (
    <div className="p-6 max-w-2xl">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/board')}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
      >
        ← Back to Board
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Task</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Full form with all fields — validated with React Hook Form + Zod
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Title — full width */}
          <FormField
            label="Title"
            required
            error={errors.title?.message}
            inputProps={{ ...register('title'), placeholder: 'e.g. Implement user authentication', autoFocus: true }}
          />

          {/* Description — full width textarea */}
          <FormField
            label="Description"
            as="textarea"
            error={errors.description?.message}
            hint="Optional — provide context or acceptance criteria"
            inputProps={{ ...register('description'), rows: 4, placeholder: 'Describe the task in detail…' }}
          />

          {/* Priority + Tag — 2 column grid */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Priority"
              required
              as="select"
              options={PRIORITY_OPTIONS}
              error={errors.priority?.message}
              inputProps={register('priority')}
            />
            <FormField
              label="Tag"
              required
              as="select"
              options={TAG_OPTIONS}
              error={errors.tag?.message}
              inputProps={register('tag')}
            />
          </div>

          {/* Status + Assignee — 2 column grid */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Status"
              required
              as="select"
              options={STATUS_OPTIONS}
              error={errors.status?.message}
              inputProps={register('status')}
            />
            <FormField
              label="Assignee"
              required
              as="select"
              options={ASSIGNEE_OPTIONS}
              error={errors.assignee?.message}
              inputProps={register('assignee')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/board')}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * INVITE MEMBER FORM
 *
 * Demonstrates React Hook Form + Zod inside a Modal.
 * The form is a focused component — it only handles the form logic.
 * The parent (TeamPage) controls the modal open/close state.
 *
 * onSuccess prop: called after a successful submit to close the modal.
 * This keeps modal state in the parent, form state in this component.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../store/hooks';
import { addMember } from './teamSlice';
import { useToast } from '../../components/organisms/Toast';
import FormField from '../../components/molecules/FormField';

const inviteSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or less'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  role: z.enum(['admin', 'developer', 'viewer']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

const ROLE_OPTIONS = [
  { value: 'viewer',    label: 'Viewer'    },
  { value: 'developer', label: 'Developer' },
  { value: 'admin',     label: 'Admin'     },
];

interface InviteMemberFormProps {
  onSuccess: () => void;
}

export default function InviteMemberForm({ onSuccess }: InviteMemberFormProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'developer' },
  });

  const onSubmit = async (data: InviteFormData) => {
    await new Promise((r) => setTimeout(r, 400)); // simulate API call
    dispatch(addMember(data));
    showToast(`Invite sent to ${data.email}!`, 'success');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Full Name"
        required
        error={errors.name?.message}
        inputProps={{ ...register('name'), placeholder: 'e.g. Jordan Lee', autoFocus: true }}
      />

      <FormField
        label="Work Email"
        required
        error={errors.email?.message}
        inputProps={{ ...register('email'), type: 'email', placeholder: 'jordan@company.io' }}
      />

      <FormField
        label="Role"
        required
        as="select"
        options={ROLE_OPTIONS}
        error={errors.role?.message}
        inputProps={register('role')}
        hint="Admins can manage members. Viewers have read-only access."
      />

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onSuccess}
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isSubmitting ? 'Sending…' : 'Send Invite'}
        </button>
      </div>
    </form>
  );
}

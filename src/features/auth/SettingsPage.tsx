/**
 * SETTINGS PAGE
 *
 * Demonstrates: React Hook Form + Zod with pre-populated defaultValues.
 *
 * Migration note — previously this page used:
 *   useRef (uncontrolled input) for the display name field, reading
 *   the value only on submit via displayNameRef.current?.value.
 *
 * Now it uses useForm with defaultValues populated from the auth context.
 * This is the more common real-world pattern: load initial data into the
 * form, let RHF manage it, validate with Zod on submit.
 *
 * Key RHF concept used here: defaultValues
 *   The form is pre-filled with the current user's name and email.
 *   RHF tracks changes from these defaults — isDirty becomes true
 *   only when the user actually changes a value.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useToast } from '../../components/organisms/Toast';
import { useNavigate } from 'react-router-dom';
import FormField from '../../components/molecules/FormField';

const settingsSchema = z.object({
  name: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Name must be 50 characters or less'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    // defaultValues pre-fills the form with the current user data
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    await new Promise((r) => setTimeout(r, 400)); // simulate save
    showToast(`Profile updated to "${data.name}"!`, 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
            {user?.avatar}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            label="Display Name"
            required
            error={errors.name?.message}
            hint="This name is shown throughout the app"
            inputProps={register('name')}
          />

          <FormField
            label="Email"
            required
            error={errors.email?.message}
            inputProps={{ ...register('email'), type: 'email' }}
          />

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
          {isDirty && (
            <p className="text-xs text-slate-400 ml-2">You have unsaved changes</p>
          )}
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Managed via <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">ThemeContext</code> — persisted to localStorage
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-purple-600' : 'bg-slate-300'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-800">
        <h2 className="font-semibold text-red-600 dark:text-red-400 mb-3">Sign Out</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

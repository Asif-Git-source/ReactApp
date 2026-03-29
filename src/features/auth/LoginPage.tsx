/**
 * LOGIN PAGE
 *
 * Demonstrates: React Hook Form + Zod for type-safe form validation.
 *
 * Before this migration the form used:
 *   - useState for each field (email, password, error, loading)
 *   - useRef + useEffect for auto-focus
 *   - Manual validation inside the submit handler
 *
 * After migration:
 *   - useForm with zodResolver — schema defines ALL validation rules
 *   - Field errors auto-populated from Zod messages
 *   - autoFocus replaces useRef/useEffect
 *   - isSubmitting from formState replaces loading useState
 *   - setError('root') for server-level errors (wrong credentials)
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import FormField from '../../components/molecules/FormField';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    const success = login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    } else {
      // setError('root') stores a non-field error — displayed below the form
      setError('root', { message: 'Invalid credentials. Try alex@devboard.io' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto px-10 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600 rounded-xl mb-5">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">DevBoard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sign in to your workspace</p>
        </div>

        {/* Demo credentials hint */}
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-4 py-3 mb-8 text-sm text-purple-700 dark:text-purple-300">
          <strong>Demo:</strong> alex@devboard.io / anypassword (6+ chars)
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/*
           * FormField + register():
           * register('email') returns { name, ref, onChange, onBlur }
           * These spread onto the Input atom via inputProps.
           * The forwardRef on Input passes RHF's ref to the real DOM node.
           */}
          <FormField
            label="Email"
            required
            error={errors.email?.message}
            inputProps={{ ...register('email'), type: 'email', placeholder: 'you@devboard.io', autoFocus: true }}
          />

          <FormField
            label="Password"
            required
            error={errors.password?.message}
            inputProps={{ ...register('password'), type: 'password', placeholder: '••••••••' }}
          />

          {/* Root-level error (wrong credentials — not a field validation error) */}
          {errors.root && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';

const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
});

type OtpForm = z.infer<typeof otpSchema>;

const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { login } = useAuth();

  const [serverError, setServerError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function onSubmit(data: OtpForm) {
    setServerError('');
    try {
      const result = await api<{ token: string; user: { id: string; email: string; name: string } }>(
        '/auth/verify-otp',
        {
          method: 'POST',
          body: { email, code: data.code },
        },
      );
      login(result.token, result.user);
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid or expired code. Please try again.';
      setServerError(message);
    }
  }

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setServerError('');
    setResendSuccess(false);
    try {
      await api('/auth/resend-otp', { method: 'POST', body: { email } });
      setResendSuccess(true);
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not resend code. Please try again.';
      setServerError(message);
    } finally {
      setIsResending(false);
    }
  }, [email, resendCooldown, isResending]);

  if (!email) return null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="mt-2 text-sm text-slate-600">
            We sent a 6-digit verification code to{' '}
            <span className="font-medium text-slate-900">{email}</span>
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              )}

              {resendSuccess && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-sm text-emerald-700">
                    A new code has been sent to your email.
                  </p>
                </div>
              )}

              <Input
                id="code"
                label="Verification code"
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                error={errors.code?.message}
                {...register('code')}
              />

              <Button type="submit" className="w-full" loading={isSubmitting}>
                Verify
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Didn&apos;t receive a code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="font-medium text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : isResending
                      ? 'Sending...'
                      : 'Resend code'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

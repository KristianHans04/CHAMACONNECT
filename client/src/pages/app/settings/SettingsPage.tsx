import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { api } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone ?? '' });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api('/auth/me', { method: 'PATCH', body: values }),
    onSuccess: () => {
      setSuccess(true);
      refresh();
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account details.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">Profile</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="phone"
              label="Phone Number"
              placeholder="+254 7XX XXX XXX"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              id="email"
              label="Email"
              value={user?.email ?? ''}
              disabled
              readOnly
            />

            {mutation.isError && (
              <p className="text-sm text-red-600">
                {(mutation.error as Error).message || 'Something went wrong'}
              </p>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <Check className="h-4 w-4" />
                Profile updated successfully.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={mutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

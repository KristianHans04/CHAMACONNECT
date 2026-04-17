import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';

interface Plan {
  id: string;
  name: string;
}

interface Member {
  id: string;
  user: { id: string; name: string };
}

const schema = z.object({
  planId: z.string().min(1, 'Select a plan'),
  membershipId: z.string().min(1, 'Select a member'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  expectedAmount: z.coerce.number().min(0, 'Expected amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.string().min(1, 'Select a status'),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ContributionCreatePage() {
  const { chamaId } = useParams<{ chamaId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['plans', chamaId],
    queryFn: () => api<{ plans: Plan[] }>(`/chamas/${chamaId}/plans`),
    enabled: !!chamaId,
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members', chamaId],
    queryFn: () => api<{ members: Member[] }>(`/chamas/${chamaId}/members`),
    enabled: !!chamaId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      planId: '',
      membershipId: '',
      amount: 0,
      expectedAmount: 0,
      dueDate: '',
      status: 'PENDING',
      note: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api(`/chamas/${chamaId}/contributions`, { method: 'POST', body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions', chamaId] });
      navigate(`/app/chamas/${chamaId}/contributions`);
    },
  });

  if (plansLoading || membersLoading) return <PageLoader />;

  const plans = plansData?.plans ?? [];
  const members = membersData?.members ?? [];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-slate-900">Add Contribution</h1>
          <p className="mt-1 text-sm text-slate-500">
            Record a new contribution for a member.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <Select
              id="planId"
              label="Contribution Plan"
              options={[
                { value: '', label: 'Select a plan' },
                ...plans.map((p) => ({ value: p.id, label: p.name })),
              ]}
              error={errors.planId?.message}
              {...register('planId')}
            />

            <Select
              id="membershipId"
              label="Member"
              options={[
                { value: '', label: 'Select a member' },
                ...members.map((m) => ({ value: m.id, label: m.user.name })),
              ]}
              error={errors.membershipId?.message}
              {...register('membershipId')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="amount"
                label="Amount (KES)"
                type="number"
                min={0}
                error={errors.amount?.message}
                {...register('amount')}
              />
              <Input
                id="expectedAmount"
                label="Expected Amount (KES)"
                type="number"
                min={0}
                error={errors.expectedAmount?.message}
                {...register('expectedAmount')}
              />
            </div>

            <Input
              id="dueDate"
              label="Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />

            <Select
              id="status"
              label="Status"
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'PAID', label: 'Paid' },
                { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
                { value: 'OVERDUE', label: 'Overdue' },
              ]}
              error={errors.status?.message}
              {...register('status')}
            />

            <Textarea
              id="note"
              label="Note (optional)"
              placeholder="Additional details..."
              error={errors.note?.message}
              {...register('note')}
            />

            {mutation.isError && (
              <p className="text-sm text-red-600">
                {(mutation.error as Error).message || 'Something went wrong'}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                Save Contribution
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

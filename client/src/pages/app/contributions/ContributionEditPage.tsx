import { useEffect } from 'react';
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

interface ContributionRecord {
  id: string;
  amount: number;
  expectedAmount: number;
  status: string;
  dueDate: string;
  note?: string;
  plan?: { id: string; name: string };
  member?: { id: string; user: { name: string } };
}

const schema = z.object({
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  expectedAmount: z.coerce.number().min(0, 'Expected amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.string().min(1, 'Select a status'),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ContributionEditPage() {
  const { chamaId, contributionId } = useParams<{
    chamaId: string;
    contributionId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contribution', chamaId, contributionId],
    queryFn: () =>
      api<{ contribution: ContributionRecord }>(
        `/chamas/${chamaId}/contributions/${contributionId}`,
      ),
    enabled: !!chamaId && !!contributionId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (data?.contribution) {
      const c = data.contribution;
      reset({
        amount: c.amount,
        expectedAmount: c.expectedAmount,
        dueDate: c.dueDate ? c.dueDate.slice(0, 10) : '',
        status: c.status,
        note: c.note ?? '',
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api(`/chamas/${chamaId}/contributions/${contributionId}`, {
        method: 'PATCH',
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions', chamaId] });
      queryClient.invalidateQueries({
        queryKey: ['contribution', chamaId, contributionId],
      });
      navigate(`/app/chamas/${chamaId}/contributions/${contributionId}`);
    },
  });

  if (isLoading) return <PageLoader />;

  const record = data?.contribution;
  if (!record) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Contribution not found.
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-slate-900">Edit Contribution</h1>
          <p className="mt-1 text-sm text-slate-500">
            {record.member?.user.name ?? 'Member'} &mdash; {record.plan?.name ?? 'Plan'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
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
                label="Expected (KES)"
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
                { value: 'UPCOMING', label: 'Upcoming' },
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
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

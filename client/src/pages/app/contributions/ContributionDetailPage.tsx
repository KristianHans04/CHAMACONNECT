import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';

interface ContributionRecord {
  id: string;
  amount: number;
  expectedAmount: number;
  status: string;
  dueDate: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
  plan?: { id: string; name: string };
  member?: { id: string; user: { name: string; email: string } };
}

export default function ContributionDetailPage() {
  const { chamaId, contributionId } = useParams<{
    chamaId: string;
    contributionId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contribution', chamaId, contributionId],
    queryFn: () =>
      api<{ contribution: ContributionRecord }>(
        `/chamas/${chamaId}/contributions/${contributionId}`,
      ),
    enabled: !!chamaId && !!contributionId,
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      api(`/chamas/${chamaId}/contributions/${contributionId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions', chamaId] });
      navigate(`/app/chamas/${chamaId}/contributions`);
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

  const fields = [
    { label: 'Member', value: record.member?.user.name ?? '-' },
    { label: 'Plan', value: record.plan?.name ?? '-' },
    { label: 'Amount Paid', value: formatCurrency(record.amount) },
    { label: 'Expected Amount', value: formatCurrency(record.expectedAmount) },
    { label: 'Due Date', value: formatDate(record.dueDate) },
    { label: 'Created', value: formatDate(record.createdAt) },
    ...(record.updatedAt
      ? [{ label: 'Last Updated', value: formatDate(record.updatedAt) }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => navigate(`/app/chamas/${chamaId}/contributions`)}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Contributions
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Contribution Detail</h1>
            <Badge variant={record.status}>{record.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-medium uppercase text-slate-500">
                  {f.label}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">{f.value}</dd>
              </div>
            ))}
          </dl>

          {record.note && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Note</p>
              <p className="mt-1 text-sm text-slate-700">{record.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link to={`/app/chamas/${chamaId}/contributions/${contributionId}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </Link>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Contribution"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this contribution record? This action cannot be
          undone.
        </p>
        {deleteMutation.isError && (
          <p className="mt-2 text-sm text-red-600">
            {(deleteMutation.error as Error).message || 'Failed to delete'}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

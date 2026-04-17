import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface Contribution {
  id: string;
  amount: number;
  expectedAmount: number;
  status: string;
  dueDate: string;
  note?: string;
  plan?: { id: string; name: string };
  member?: { id: string; user: { name: string } };
}

interface Plan {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

interface Member {
  id: string;
  user: { id: string; name: string };
}

export default function ContributionListPage() {
  const { chamaId } = useParams<{ chamaId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [memberFilter, setMemberFilter] = useState(searchParams.get('memberId') ?? '');
  const page = Number(searchParams.get('page') ?? '1');
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['contributions', chamaId, statusFilter, memberFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (memberFilter) params.set('memberId', memberFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));
      return api<{ contributions: Contribution[]; total: number }>(
        `/chamas/${chamaId}/contributions?${params}`,
      );
    },
    enabled: !!chamaId,
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans', chamaId],
    queryFn: () => api<{ plans: Plan[] }>(`/chamas/${chamaId}/plans`),
    enabled: !!chamaId,
  });

  const { data: membersData } = useQuery({
    queryKey: ['members', chamaId],
    queryFn: () => api<{ members: Member[] }>(`/chamas/${chamaId}/members`),
    enabled: !!chamaId,
  });

  if (isLoading) return <PageLoader />;

  const contributions = data?.contributions ?? [];
  const total = data?.total ?? 0;
  const plans = plansData?.plans ?? [];
  const members = membersData?.members ?? [];
  const totalPages = Math.ceil(total / limit) || 1;

  function updatePage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contributions</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} {total === 1 ? 'record' : 'records'}
          </p>
        </div>
        <Link to={`/app/chamas/${chamaId}/contributions/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contribution
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-40">
          <Select
            id="status-filter"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PAID', label: 'Paid' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'OVERDUE', label: 'Overdue' },
              { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              const params = new URLSearchParams(searchParams);
              if (e.target.value) params.set('status', e.target.value);
              else params.delete('status');
              params.set('page', '1');
              setSearchParams(params);
            }}
          />
        </div>
        <div className="w-48">
          <Select
            id="member-filter"
            options={[
              { value: '', label: 'All Members' },
              ...members.map((m) => ({ value: m.id, label: m.user.name })),
            ]}
            value={memberFilter}
            onChange={(e) => {
              setMemberFilter(e.target.value);
              const params = new URLSearchParams(searchParams);
              if (e.target.value) params.set('memberId', e.target.value);
              else params.delete('memberId');
              params.set('page', '1');
              setSearchParams(params);
            }}
          />
        </div>
      </div>

      {contributions.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No contributions found"
          description="Record your first contribution or adjust your filters."
          action={
            <Link to={`/app/chamas/${chamaId}/contributions/new`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Contribution
              </Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase text-slate-500">
                  <th className="pb-2 pr-4">Member</th>
                  <th className="pb-2 pr-4">Plan</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Expected</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contributions.map((c) => (
                  <tr key={c.id} className="group">
                    <td className="py-2.5 pr-4">
                      <Link
                        to={`/app/chamas/${chamaId}/contributions/${c.id}`}
                        className="font-medium text-slate-900 hover:text-brand-700"
                      >
                        {c.member?.user.name ?? '-'}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">
                      {c.plan?.name ?? '-'}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {formatCurrency(c.expectedAmount)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={c.status}>{c.status}</Badge>
                    </td>
                    <td className="py-2.5 text-slate-500">{formatDate(c.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updatePage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updatePage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {plans.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Contribution Plans</h2>
            <Link to={`/app/chamas/${chamaId}/plans/new`}>
              <Button variant="outline" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Plan
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardContent>
                  <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(plan.amount)} / {plan.frequency.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

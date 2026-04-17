import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock } from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface OverdueRecord {
  id: string;
  amount: number;
  expectedAmount: number;
  dueDate: string;
  daysOverdue?: number;
  member?: { id: string; user: { name: string } };
  plan?: { id: string; name: string };
}

interface UpcomingDue {
  id: string;
  amount: number;
  expectedAmount: number;
  dueDate: string;
  member?: { id: string; user: { name: string } };
  plan?: { id: string; name: string };
}

interface OverdueSummary {
  totalExpected: number;
  totalPaid: number;
  totalOverdue: number;
}

export default function OverduePage() {
  const { chamaId } = useParams<{ chamaId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['overdue', chamaId],
    queryFn: () =>
      api<{
        overdueRecords: OverdueRecord[];
        upcomingDues: UpcomingDue[];
        summary: OverdueSummary;
      }>(`/chamas/${chamaId}/overdue`),
    enabled: !!chamaId,
  });

  if (isLoading) return <PageLoader />;

  const overdueRecords = data?.overdueRecords ?? [];
  const upcomingDues = data?.upcomingDues ?? [];
  const summary = data?.summary ?? { totalExpected: 0, totalPaid: 0, totalOverdue: 0 };

  const paidPercent =
    summary.totalExpected > 0
      ? Math.round((summary.totalPaid / summary.totalExpected) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overdue &amp; Upcoming</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track overdue contributions and upcoming dues.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Expected
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(summary.totalExpected)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs font-medium uppercase text-slate-500">Total Paid</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">
              {formatCurrency(summary.totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs font-medium uppercase text-slate-500">Total Overdue</p>
            <p className="mt-1 text-xl font-bold text-red-700">
              {formatCurrency(summary.totalOverdue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Collection Progress</span>
            <span className="text-slate-500">{paidPercent}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-700 transition-all"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Overdue Records</h2>
        {overdueRecords.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="h-10 w-10" />}
            title="No overdue contributions"
            description="All members are up to date with their payments."
          />
        ) : (
          <Card>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase text-slate-500">
                    <th className="pb-2 pr-4">Member</th>
                    <th className="pb-2 pr-4">Plan</th>
                    <th className="pb-2 pr-4">Amount Owed</th>
                    <th className="pb-2 pr-4">Due Date</th>
                    <th className="pb-2">Days Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {overdueRecords.map((r) => {
                    const owed = r.expectedAmount - r.amount;
                    const days =
                      r.daysOverdue ??
                      Math.max(
                        0,
                        Math.floor(
                          (Date.now() - new Date(r.dueDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ),
                      );
                    return (
                      <tr key={r.id}>
                        <td className="py-2.5 pr-4 font-medium text-slate-900">
                          {r.member?.user.name ?? '-'}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-600">
                          {r.plan?.name ?? '-'}
                        </td>
                        <td className="py-2.5 pr-4 font-medium text-red-700">
                          {formatCurrency(owed > 0 ? owed : r.expectedAmount)}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500">
                          {formatDate(r.dueDate)}
                        </td>
                        <td className="py-2.5">
                          <Badge variant="OVERDUE">
                            {days} {days === 1 ? 'day' : 'days'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      {upcomingDues.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Upcoming Dues</h2>
          <Card>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase text-slate-500">
                    <th className="pb-2 pr-4">Member</th>
                    <th className="pb-2 pr-4">Plan</th>
                    <th className="pb-2 pr-4">Expected</th>
                    <th className="pb-2">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {upcomingDues.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2.5 pr-4 font-medium text-slate-900">
                        {d.member?.user.name ?? '-'}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {d.plan?.name ?? '-'}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-900">
                        {formatCurrency(d.expectedAmount)}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(d.dueDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

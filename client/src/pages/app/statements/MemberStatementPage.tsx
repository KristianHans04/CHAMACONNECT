import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';

interface Transaction {
  id: string;
  amount: number;
  expectedAmount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  planName?: string;
  note?: string;
}

interface StatementDetail {
  memberId: string;
  memberName: string;
  totalExpected: number;
  totalPaid: number;
  totalOverdue: number;
  balance: number;
  transactions: Transaction[];
}

export default function MemberStatementPage() {
  const { chamaId, memberId } = useParams<{ chamaId: string; memberId: string }>();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['statement', chamaId, memberId],
    queryFn: () =>
      api<{ statement: StatementDetail }>(
        `/chamas/${chamaId}/statements/${memberId}`,
      ),
    enabled: !!chamaId && !!memberId,
  });

  if (isLoading) return <PageLoader />;

  const statement = data?.statement;
  if (!statement) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Statement not found.
      </div>
    );
  }

  const transactions = statement.transactions ?? [];
  const filtered = transactions.filter((t) => {
    const due = new Date(t.dueDate);
    if (startDate && due < new Date(startDate)) return false;
    if (endDate && due > new Date(endDate)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between">
        <button
          onClick={() => navigate(`/app/chamas/${chamaId}/statements`)}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All Statements
        </button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          Print Statement
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{statement.memberName}</h1>
        <p className="mt-1 text-sm text-slate-500">Contribution Statement</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Expected
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatCurrency(statement.totalExpected)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs font-medium uppercase text-slate-500">Total Paid</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">
              {formatCurrency(statement.totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs font-medium uppercase text-slate-500">Overdue</p>
            <p className="mt-1 text-lg font-bold text-red-700">
              {formatCurrency(statement.totalOverdue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs font-medium uppercase text-slate-500">Balance</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatCurrency(statement.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="no-print flex flex-wrap items-end gap-3">
        <Input
          id="start-date"
          label="From"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          id="end-date"
          label="To"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {(startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">
            Transaction History
          </h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              No transactions in this period.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase text-slate-500">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Plan</th>
                  <th className="pb-2 pr-4">Expected</th>
                  <th className="pb-2 pr-4">Paid</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2.5 pr-4 text-slate-700">
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">
                      {t.planName ?? '-'}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-900">
                      {formatCurrency(t.expectedAmount)}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={t.status}>{t.status}</Badge>
                    </td>
                    <td className="max-w-[120px] truncate py-2.5 text-slate-400">
                      {t.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search } from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency, getInitials } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface StatementSummary {
  memberId: string;
  memberName: string;
  totalExpected: number;
  totalPaid: number;
  totalOverdue: number;
}

export default function StatementsListPage() {
  const { chamaId } = useParams<{ chamaId: string }>();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['statements', chamaId],
    queryFn: () =>
      api<{ statements: StatementSummary[] }>(`/chamas/${chamaId}/statements`),
    enabled: !!chamaId,
  });

  if (isLoading) return <PageLoader />;

  const statements = data?.statements ?? [];
  const filtered = search
    ? statements.filter((s) =>
        s.memberName.toLowerCase().includes(search.toLowerCase()),
      )
    : statements;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statements</h1>
        <p className="mt-1 text-sm text-slate-500">
          View contribution summaries for each member.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by member name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="No statements found"
          description={search ? 'Try adjusting your search.' : 'No member statements available yet.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link key={s.memberId} to={`/app/chamas/${chamaId}/statements/${s.memberId}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                      {getInitials(s.memberName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {s.memberName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Expected</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatCurrency(s.totalExpected)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="text-sm font-medium text-emerald-700">
                        {formatCurrency(s.totalPaid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Overdue</p>
                      <p className="text-sm font-medium text-red-700">
                        {formatCurrency(s.totalOverdue)}
                      </p>
                    </div>
                  </div>

                  {s.totalOverdue > 0 && (
                    <div className="mt-3">
                      <Badge variant="OVERDUE">Overdue</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

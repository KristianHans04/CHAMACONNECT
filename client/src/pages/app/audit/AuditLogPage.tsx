import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/api/client';
import { formatDateTime } from '@/lib/utils';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  userId: string;
  userName?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export default function AuditLogPage() {
  const { chamaId } = useParams<{ chamaId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const actionFilter = searchParams.get('action') ?? '';
  const entityFilter = searchParams.get('entity') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['audit', chamaId, actionFilter, entityFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      if (entityFilter) params.set('entity', entityFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));
      return api<{ logs: AuditLog[]; total: number }>(
        `/chamas/${chamaId}/audit?${params}`,
      );
    },
    enabled: !!chamaId,
  });

  if (isLoading) return <PageLoader />;

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  }

  function updatePage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all actions performed in this chama.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-44">
          <Select
            id="action-filter"
            options={[
              { value: '', label: 'All Actions' },
              { value: 'CHAMA_CREATED', label: 'Chama Created' },
              { value: 'CHAMA_UPDATED', label: 'Chama Updated' },
              { value: 'PLAN_CREATED', label: 'Plan Created' },
              { value: 'PLAN_UPDATED', label: 'Plan Updated' },
              { value: 'CONTRIBUTION_CREATED', label: 'Contribution Created' },
              { value: 'CONTRIBUTION_UPDATED', label: 'Contribution Updated' },
              { value: 'MEMBER_INVITED', label: 'Member Invited' },
              { value: 'INVITE_ACCEPTED', label: 'Invite Accepted' },
              { value: 'ROLE_CHANGED', label: 'Role Changed' },
              { value: 'MEMBER_REMOVED', label: 'Member Removed' },
              { value: 'LOGIN', label: 'Login' },
            ]}
            value={actionFilter}
            onChange={(e) => updateFilter('action', e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            id="entity-filter"
            options={[
              { value: '', label: 'All Entities' },
              { value: 'chama', label: 'Chama' },
              { value: 'membership', label: 'Membership' },
              { value: 'contribution_plan', label: 'Contribution Plan' },
              { value: 'contribution_record', label: 'Contribution Record' },
              { value: 'invite', label: 'Invite' },
              { value: 'CHAMA', label: 'Chama (legacy)' },
            ]}
            value={entityFilter}
            onChange={(e) => updateFilter('entity', e.target.value)}
          />
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-10 w-10" />}
          title="No audit logs found"
          description="No activity has been recorded yet, or adjust your filters."
        />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <Card key={log.id}>
                <CardContent className="py-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{log.action}</Badge>
                        <Badge variant={log.entity}>{log.entity}</Badge>
                        <span className="text-sm font-medium text-slate-900">
                          {log.userName ?? log.userId}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                    {log.details && (
                      <span className="text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </button>
                  {isExpanded && log.details && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                      <pre className="whitespace-pre-wrap text-xs text-slate-600">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
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
    </div>
  );
}

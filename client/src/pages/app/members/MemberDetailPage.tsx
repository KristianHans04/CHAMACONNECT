import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UserMinus } from 'lucide-react';
import { api } from '@/api/client';
import { formatDate, formatCurrency, getInitials, statusColor } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';

interface Contribution {
  id: string;
  amount: number;
  expectedAmount: number;
  status: string;
  dueDate: string;
  planName?: string;
}

interface MemberDetail {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
  contributions?: Contribution[];
}

export default function MemberDetailPage() {
  const { chamaId, memberId } = useParams<{ chamaId: string; memberId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['member', chamaId, memberId],
    queryFn: () =>
      api<{ member: MemberDetail }>(`/chamas/${chamaId}/members/${memberId}`),
    enabled: !!chamaId && !!memberId,
  });

  const roleMutation = useMutation({
    mutationFn: (role: string) =>
      api(`/chamas/${chamaId}/members/${memberId}/role`, {
        method: 'PATCH',
        body: { role },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', chamaId, memberId] });
      queryClient.invalidateQueries({ queryKey: ['members', chamaId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      api(`/chamas/${chamaId}/members/${memberId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', chamaId] });
      navigate(`/app/chamas/${chamaId}/members`);
    },
  });

  if (isLoading) return <PageLoader />;

  const member = data?.member;
  if (!member) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">Member not found.</div>
    );
  }

  const contributions = member.contributions ?? [];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(`/app/chamas/${chamaId}/members`)}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Members
      </button>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                {getInitials(member.user.name)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{member.user.name}</h1>
                <p className="text-sm text-slate-500">{member.user.email}</p>
                {member.user.phone && (
                  <p className="text-sm text-slate-400">{member.user.phone}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge>{member.role}</Badge>
              <span className="text-xs text-slate-400">
                Joined {formatDate(member.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">Change Role</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Select
                id="role"
                label="Role"
                options={[
                  { value: 'MEMBER', label: 'Member' },
                  { value: 'TREASURER', label: 'Treasurer' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
                value={selectedRole || member.role}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              disabled={!selectedRole || selectedRole === member.role}
              loading={roleMutation.isPending}
              onClick={() => roleMutation.mutate(selectedRole)}
            >
              Update Role
            </Button>
          </div>
          {roleMutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              {(roleMutation.error as Error).message || 'Failed to update role'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">
            Contribution History
          </h2>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              No contributions recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase text-slate-500">
                    <th className="pb-2 pr-4">Plan</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2 pr-4">Expected</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {contributions.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 pr-4 text-slate-700">{c.planName ?? '-'}</td>
                      <td className="py-2 pr-4 font-medium text-slate-900">
                        {formatCurrency(c.amount)}
                      </td>
                      <td className="py-2 pr-4 text-slate-500">
                        {formatCurrency(c.expectedAmount)}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(c.status)}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2 text-slate-500">{formatDate(c.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="danger" size="sm" onClick={() => setRemoveOpen(true)}>
          <UserMinus className="mr-1.5 h-3.5 w-3.5" />
          Remove Member
        </Button>
      </div>

      <Modal
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        title="Remove Member"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to remove <strong>{member.user.name}</strong> from this
          chama? They will lose access to all chama data.
        </p>
        {removeMutation.isError && (
          <p className="mt-2 text-sm text-red-600">
            {(removeMutation.error as Error).message || 'Failed to remove member'}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setRemoveOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={removeMutation.isPending}
            onClick={() => removeMutation.mutate()}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}

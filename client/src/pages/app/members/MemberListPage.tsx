import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Mail, Clock } from 'lucide-react';
import { api } from '@/api/client';
import { formatDate, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface Member {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email'),
  role: z.string().min(1, 'Select a role'),
});

type InviteForm = z.infer<typeof inviteSchema>;

export default function MemberListPage() {
  const { chamaId } = useParams<{ chamaId: string }>();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members', chamaId],
    queryFn: () => api<{ members: Member[] }>(`/chamas/${chamaId}/members`),
    enabled: !!chamaId,
  });

  const { data: invitesData, isLoading: invitesLoading } = useQuery({
    queryKey: ['invites', chamaId],
    queryFn: () => api<{ invites: Invite[] }>(`/chamas/${chamaId}/invites`),
    enabled: !!chamaId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'MEMBER' },
  });

  const inviteMutation = useMutation({
    mutationFn: (values: InviteForm) =>
      api(`/chamas/${chamaId}/invites`, { method: 'POST', body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', chamaId] });
      reset();
      setInviteOpen(false);
    },
  });

  if (membersLoading || invitesLoading) return <PageLoader />;

  const members = membersData?.members ?? [];
  const invites = invitesData?.invites ?? [];
  const pendingInvites = invites.filter((i) => i.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="mt-1 text-sm text-slate-500">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="h-10 w-10" />}
          title="No members yet"
          description="Invite people to join this chama."
          action={
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-slate-100">
            {members.map((member) => (
              <Link
                key={member.id}
                to={`/app/chamas/${chamaId}/members/${member.id}`}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {getInitials(member.user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{member.user.name}</p>
                  <p className="truncate text-sm text-slate-500">{member.user.email}</p>
                </div>
                <Badge>{member.role}</Badge>
                <span className="hidden text-xs text-slate-400 sm:inline">
                  Joined {formatDate(member.createdAt)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {pendingInvites.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Pending Invites</h2>
          <Card>
            <CardContent className="divide-y divide-slate-100">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{invite.email}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      Sent {formatDate(invite.createdAt)}
                    </div>
                  </div>
                  <Badge variant="PENDING">{invite.role}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Member">
        <form onSubmit={handleSubmit((v) => inviteMutation.mutate(v))} className="space-y-4">
          <Input
            id="invite-email"
            label="Email Address"
            type="email"
            placeholder="member@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            id="invite-role"
            label="Role"
            options={[
              { value: 'MEMBER', label: 'Member' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />

          {inviteMutation.isError && (
            <p className="text-sm text-red-600">
              {(inviteMutation.error as Error).message || 'Failed to send invite'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={inviteMutation.isPending}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

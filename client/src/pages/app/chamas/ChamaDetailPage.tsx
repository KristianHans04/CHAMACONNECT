import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users,
  ClipboardList,
  AlertTriangle,
  FileText,
  Shield,
  Settings,
  Pencil,
  Trash2,
} from 'lucide-react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';

interface ChamaDetail {
  id: string;
  name: string;
  description: string;
  role: string;
  memberCount: number;
  planCount?: number;
  createdAt: string;
}

export default function ChamaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['chama', id],
    queryFn: () => api<{ chama: ChamaDetail }>(`/chamas/${id}`),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api(`/chamas/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chamas'] });
      navigate('/app/chamas');
    },
  });

  if (isLoading) return <PageLoader />;

  const chama = data?.chama;
  if (!chama) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">Chama not found.</div>
    );
  }

  const isAdmin = chama.role === 'ADMIN' || chama.role === 'OWNER';

  const navLinks = [
    { to: `/app/chamas/${id}/members`, label: 'Members', icon: Users },
    { to: `/app/chamas/${id}/contributions`, label: 'Contributions', icon: ClipboardList },
    { to: `/app/chamas/${id}/overdue`, label: 'Overdue', icon: AlertTriangle },
    { to: `/app/chamas/${id}/statements`, label: 'Statements', icon: FileText },
    { to: `/app/chamas/${id}/audit`, label: 'Audit Log', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/app/chamas')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Chamas
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{chama.name}</h1>
            <Badge>{chama.role}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {chama.description || 'No description'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Link to={`/app/chamas/${id}/edit`}>
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
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Members</p>
              <p className="text-lg font-bold text-slate-900">{chama.memberCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Active Plans</p>
              <p className="text-lg font-bold text-slate-900">{chama.planCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Your Role</p>
              <p className="text-lg font-bold text-slate-900">{chama.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Navigation</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                {label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Chama">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{chama.name}</strong>? This action
          cannot be undone and will remove all associated data.
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

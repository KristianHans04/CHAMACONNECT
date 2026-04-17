import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Users, ArrowRight } from 'lucide-react';
import { api } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface Chama {
  id: string;
  name: string;
  description: string;
  role: string;
  memberCount: number;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['chamas'],
    queryFn: () => api<{ chamas: Chama[] }>('/chamas'),
  });

  if (isLoading) return <PageLoader />;

  const chamas = data?.chamas ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here is an overview of your chama activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Chamas</p>
              <p className="text-2xl font-bold text-slate-900">{chamas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Members</p>
              <p className="text-2xl font-bold text-slate-900">
                {chamas.reduce((sum, c) => sum + (c.memberCount ?? 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/app/chamas/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Chama
          </Button>
        </Link>
        <Link to="/app/chamas">
          <Button variant="outline">
            View Chamas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {chamas.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No chamas yet"
          description="Create your first chama to start managing group contributions."
          action={
            <Link to="/app/chamas/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Chama
              </Button>
            </Link>
          }
        />
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Chamas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chamas.map((chama) => (
              <Link key={chama.id} to={`/app/chamas/${chama.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-slate-900">{chama.name}</h3>
                      <Badge>{chama.role}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {chama.description || 'No description'}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      {chama.memberCount} {chama.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

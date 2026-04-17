import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { api } from '@/api/client';
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

export default function ChamaListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['chamas'],
    queryFn: () => api<{ chamas: Chama[] }>('/chamas'),
  });

  if (isLoading) return <PageLoader />;

  const chamas = data?.chamas ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chamas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your savings groups
          </p>
        </div>
        <Link to="/app/chamas/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Chama
          </Button>
        </Link>
      </div>

      {chamas.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No chamas yet"
          description="Get started by creating your first savings group."
          action={
            <Link to="/app/chamas/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Chama
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chamas.map((chama) => (
            <Link key={chama.id} to={`/app/chamas/${chama.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{chama.name}</h3>
                    <Badge>{chama.role}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {chama.description || 'No description'}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {chama.memberCount} {chama.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

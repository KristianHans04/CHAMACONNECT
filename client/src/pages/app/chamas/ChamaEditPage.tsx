import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ChamaDetail {
  id: string;
  name: string;
  description: string;
}

export default function ChamaEditPage() {
  const { chamaId } = useParams<{ chamaId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['chama', chamaId],
    queryFn: () => api<{ chama: ChamaDetail }>(`/chamas/${chamaId}`),
    enabled: !!chamaId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (data?.chama) {
      reset({
        name: data.chama.name,
        description: data.chama.description ?? '',
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api(`/chamas/${chamaId}`, { method: 'PATCH', body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chamas'] });
      queryClient.invalidateQueries({ queryKey: ['chama', chamaId] });
      navigate(`/app/chamas/${chamaId}`);
    },
  });

  if (isLoading) return <PageLoader />;

  if (!data?.chama) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">Chama not found.</div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-slate-900">Edit Chama</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <Input
              id="name"
              label="Chama Name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Textarea
              id="description"
              label="Description"
              error={errors.description?.message}
              {...register('description')}
            />

            {mutation.isError && (
              <p className="text-sm text-red-600">
                {(mutation.error as Error).message || 'Something went wrong'}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

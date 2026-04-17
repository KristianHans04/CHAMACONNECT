import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ChamaCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api<{ chama: { id: string } }>('/chamas', {
        method: 'POST',
        body: values,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chamas'] });
      navigate(`/app/chamas/${data.chama.id}`);
    },
  });

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
          <h1 className="text-xl font-bold text-slate-900">Create a Chama</h1>
          <p className="mt-1 text-sm text-slate-500">
            Set up a new savings group for your community.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <Input
              id="name"
              label="Chama Name"
              placeholder="e.g. Umoja Savings"
              error={errors.name?.message}
              {...register('name')}
            />
            <Textarea
              id="description"
              label="Description"
              placeholder="What is this chama about?"
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
                Create Chama
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

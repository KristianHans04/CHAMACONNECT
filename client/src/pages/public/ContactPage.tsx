import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/api/client';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactForm) {
    setServerError('');
    try {
      await api('/contact', { method: 'POST', body: data });
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setServerError(message);
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Contact us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Have a question, suggestion, or need help with your account? Reach
            out and we will get back to you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="border-t border-slate-100 bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-12 md:grid-cols-3">
            {/* Sidebar info */}
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <Mail className="h-5 w-5 text-brand-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Email</h3>
                  <a
                    href="mailto:support@chamaconnect.co.ke"
                    className="mt-1 block text-sm text-brand-700 hover:underline"
                  >
                    support@chamaconnect.co.ke
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <Clock className="h-5 w-5 text-brand-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Response Time</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              {submitted ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-brand-700" />
                    <h2 className="mt-4 text-xl font-semibold text-slate-900">
                      Message sent
                    </h2>
                    <p className="mt-2 max-w-sm text-slate-600">
                      Thank you for reaching out. We will review your message and
                      respond to your email within 24 hours.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      {serverError && (
                        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                          <p className="text-sm text-red-700">{serverError}</p>
                        </div>
                      )}

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                          id="name"
                          label="Name"
                          placeholder="Your name"
                          error={errors.name?.message}
                          {...register('name')}
                        />
                        <Input
                          id="email"
                          label="Email"
                          type="email"
                          placeholder="you@example.com"
                          error={errors.email?.message}
                          {...register('email')}
                        />
                      </div>

                      <Input
                        id="subject"
                        label="Subject"
                        placeholder="What is this about?"
                        error={errors.subject?.message}
                        {...register('subject')}
                      />

                      <Textarea
                        id="message"
                        label="Message"
                        placeholder="Tell us more..."
                        error={errors.message?.message}
                        {...register('message')}
                      />

                      <Button type="submit" loading={isSubmitting}>
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

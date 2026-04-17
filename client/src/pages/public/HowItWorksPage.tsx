import { Link } from 'react-router-dom';
import { UserPlus, Building2, Send, Settings, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Create your account',
    description:
      'Sign up with your email address. We use a passwordless login system — you will receive a one-time code via email each time you sign in. No passwords to remember or manage.',
  },
  {
    number: 2,
    icon: Building2,
    title: 'Set up your chama',
    description:
      'Create your chama group by entering a name and basic details. You become the group admin automatically. You can manage multiple chamas from the same account.',
  },
  {
    number: 3,
    icon: Send,
    title: 'Invite members',
    description:
      'Add members to your chama by sending email invitations. Each member creates their own account and joins the group. Assign roles like treasurer or member as needed.',
  },
  {
    number: 4,
    icon: Settings,
    title: 'Configure contribution plans',
    description:
      'Define how much each member contributes and how often — weekly, monthly, or on a custom schedule. Set due dates so the system can track compliance automatically.',
  },
  {
    number: 5,
    icon: BarChart3,
    title: 'Track and manage',
    description:
      'Record contributions as they come in. Members view their own statements. Admins and treasurers get a full picture of group finances with a complete audit trail of every action taken.',
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            How ChamaConnect works
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Get your chama set up and running in five straightforward steps.
            From account creation to full financial tracking.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-slate-100 bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 hidden h-full w-px bg-slate-200 md:left-8 md:block" />

            <div className="space-y-12">
              {steps.map((step) => (
                <div key={step.number} className="relative flex gap-6 md:gap-8">
                  {/* Step number */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white md:h-16 md:w-16 md:text-lg">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="pb-2 pt-1 md:pt-3">
                    <div className="flex items-center gap-3">
                      <step.icon className="h-5 w-5 text-slate-500" />
                      <h3 className="text-lg font-semibold text-slate-900 md:text-xl">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-slate-600">
            Create your account and have your chama set up in under five
            minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/signup">
              <Button size="lg">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg">
                View All Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

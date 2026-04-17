import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  EyeOff,
  FileText,
  ShieldCheck,
  Users,
  CreditCard,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
}

const features: Feature[] = [
  {
    icon: ClipboardCheck,
    title: 'Contribution Tracking',
    description:
      'Record and manage every member contribution with full details including amount, date, payment method, and notes. Treasurers enter data once and the entire group has access to accurate, consistent records.',
    benefits: [
      'Record contributions with amount, date, and payment method',
      'View contribution history per member or per period',
      'Track partial payments and carry-over balances',
      'Export records for external reporting',
    ],
  },
  {
    icon: EyeOff,
    title: 'Missed Payment Visibility',
    description:
      'No more manual follow-ups or awkward phone calls. ChamaConnect automatically identifies missed and overdue contributions based on your group\'s schedule, giving treasurers and admins a clear view of outstanding payments.',
    benefits: [
      'Automatic detection of missed contributions',
      'Overdue payment summaries for each cycle',
      'Clear visibility for admins and treasurers',
      'Reduce disputes with verifiable records',
    ],
  },
  {
    icon: FileText,
    title: 'Member Statements',
    description:
      'Every member can access their own contribution statement at any time. Statements show payment history, current balance, and upcoming obligations, giving each member confidence in the group\'s records.',
    benefits: [
      'Individual contribution history and balance',
      'Period-by-period breakdown of payments',
      'Accessible to each member for their own account',
      'Transparent and verifiable records',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Audit Trail',
    description:
      'Every action taken in ChamaConnect is recorded with a timestamp, the user who performed it, and a description of the change. This creates an immutable log that provides full accountability for financial decisions.',
    benefits: [
      'Timestamped log of all transactions and changes',
      'User attribution for every action',
      'Immutable history that cannot be altered retroactively',
      'Supports internal and external auditing',
    ],
  },
  {
    icon: Users,
    title: 'Role-Based Management',
    description:
      'Assign roles to group members to control access to sensitive operations. Admins manage group settings, treasurers handle financial records, and members view their own data. Each role has clearly defined permissions.',
    benefits: [
      'Admin, Treasurer, and Member roles',
      'Granular control over who can record payments',
      'Invite new members with predefined roles',
      'Change roles as your group evolves',
    ],
  },
  {
    icon: CreditCard,
    title: 'Paystack Integration',
    description:
      'Accept contributions directly through ChamaConnect using Paystack\'s secure payment infrastructure. Members can pay via M-Pesa, bank transfer, or card, and payments are automatically recorded against their account.',
    benefits: [
      'M-Pesa, bank transfer, and card payments',
      'Automatic reconciliation with member accounts',
      'Secure, PCI-compliant payment processing',
      'Real-time payment confirmation',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Features built for chama accountability
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Every feature in ChamaConnect is designed to replace manual processes
            with structured, transparent financial management.
          </p>
        </div>
      </section>

      {/* Feature Sections — alternating layouts */}
      <div className="border-t border-slate-100">
        {features.map((feature, index) => {
          const isEven = index % 2 === 0;
          return (
            <section
              key={feature.title}
              className={`border-b border-slate-100 py-16 md:py-20 ${
                isEven ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              <div className="mx-auto max-w-6xl px-4">
                <div
                  className={`grid items-start gap-12 md:grid-cols-2 ${
                    !isEven ? 'md:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  {/* Text content */}
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                      <feature.icon className="h-6 w-6 text-brand-700" />
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-slate-900 md:text-3xl">
                      {feature.title}
                    </h2>
                    <p className="mt-4 leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>

                  {/* Benefits card */}
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Key Benefits
                      </p>
                      <ul className="mt-4 space-y-3">
                        {feature.benefits.map((benefit) => (
                          <li
                            key={benefit}
                            className="flex items-start gap-3 text-sm text-slate-700"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <section className="bg-brand-700 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            See these features in action
          </h2>
          <p className="mt-4 text-brand-100">
            Create a free account and set up your chama in minutes.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-brand-700 hover:bg-brand-50"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

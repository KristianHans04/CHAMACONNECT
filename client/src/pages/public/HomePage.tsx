import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  FileText,
  BellRing,
  ShieldCheck,
  Users,
  CreditCard,
  ArrowRight,
  AlertTriangle,
  Eye,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const features = [
  {
    icon: ClipboardCheck,
    title: 'Contribution Tracking',
    description:
      'Record every contribution with date, amount, and member details. No more lost receipts or disputed records.',
  },
  {
    icon: FileText,
    title: 'Member Statements',
    description:
      'Each member gets a clear statement of their contributions, balances, and payment history on demand.',
  },
  {
    icon: BellRing,
    title: 'Missed Payment Alerts',
    description:
      'Automatic visibility into missed and overdue payments so nothing falls through the cracks.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit Trail',
    description:
      'Every action is logged with timestamps and user attribution. Full accountability for all transactions.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description:
      'Assign roles like admin, treasurer, and member. Control who can record payments and manage the group.',
  },
  {
    icon: CreditCard,
    title: 'Payment Integration',
    description:
      'Integrated with Paystack for secure mobile money and card payments directly within the platform.',
  },
];

const problems = [
  {
    icon: AlertTriangle,
    title: 'Missing Records',
    description:
      'Paper receipts get lost. WhatsApp messages get buried. Spreadsheets get corrupted. When records disappear, trust breaks down.',
  },
  {
    icon: Eye,
    title: 'Lack of Transparency',
    description:
      'Members have no way to independently verify their contribution history or see how group funds are managed.',
  },
  {
    icon: BookOpen,
    title: 'Manual Tracking',
    description:
      'Treasurers spend hours updating spreadsheets, chasing payments, and reconciling records across multiple sources.',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Financial transparency
            <br />
            for every chama
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            ChamaConnect gives your group a single source of truth for
            contributions, payments, and member records. No more disputes. No
            more guesswork.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/signup">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              The Problem
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Chamas run on trust, but trust needs records
            </h2>
            <p className="mt-4 text-slate-600">
              Most chamas in Kenya rely on manual processes that make
              accountability difficult and disputes inevitable.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {problems.map((problem) => (
              <div key={problem.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200">
                  <problem.icon className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {problem.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {problem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="border-t border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                The Solution
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                One platform for complete financial accountability
              </h2>
              <p className="mt-4 text-slate-600">
                ChamaConnect replaces scattered spreadsheets and informal
                record-keeping with a structured system that every member can
                access. Treasurers record contributions in seconds. Members view
                their own statements at any time. Admins see the full picture
                with a complete audit trail.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Contributions recorded once, visible to everyone',
                  'Automatic tracking of missed and overdue payments',
                  'Immutable audit log for every transaction',
                  'Secure payment processing through Paystack',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Contribution Recorded
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    Jane Muthoni &mdash; KES 2,000 &mdash; March 2025
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Payment Alert
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    2 members have overdue payments for February
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Audit Log
                  </p>
                  <p className="mt-1 text-sm text-slate-900">
                    Treasurer updated contribution plan &mdash; 14 Mar 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Everything your chama needs
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <feature.icon className="h-5 w-5 text-brand-700" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

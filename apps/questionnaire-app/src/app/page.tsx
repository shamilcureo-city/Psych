import Link from 'next/link';
import {
  Brain,
  Shield,
  Activity,
  Clock,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Moon,
  Gauge,
  Sparkles,
  BookOpen,
  TrendingUp,
  Lock,
  FileCheck,
} from 'lucide-react';

const assessmentTools = [
  {
    name: 'PHQ-9',
    domain: 'Depression',
    description: 'Gold-standard depression screening based on DSM-5 criteria',
    items: 9,
    icon: HeartPulse,
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  {
    name: 'GAD-7',
    domain: 'Anxiety',
    description: 'Clinically validated generalized anxiety disorder assessment',
    items: 7,
    icon: Activity,
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  {
    name: 'DASS-21',
    domain: 'Depression + Anxiety + Stress',
    description: 'Comprehensive 3-subscale measure across emotional domains',
    items: 21,
    icon: Brain,
    color: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  {
    name: 'WHO-5',
    domain: 'Wellbeing',
    description: 'WHO-endorsed subjective wellbeing index on a 0-100 scale',
    items: 5,
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    name: 'PSS-10',
    domain: 'Perceived Stress',
    description: 'Measures the degree to which life situations are appraised as stressful',
    items: 10,
    icon: Gauge,
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-700',
  },
  {
    name: 'ISI',
    domain: 'Sleep',
    description: 'Assesses insomnia severity and its impact on daily functioning',
    items: 7,
    icon: Moon,
    color: 'from-sky-500 to-cyan-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-700',
  },
];

const steps = [
  {
    step: '01',
    title: 'Choose an Assessment',
    description: 'Select from 7 clinically validated tools covering depression, anxiety, stress, wellbeing, and sleep.',
    icon: BookOpen,
  },
  {
    step: '02',
    title: 'Answer Honestly',
    description: 'Respond to evidence-based questions at your own pace. Your answers are private and secure.',
    icon: FileCheck,
  },
  {
    step: '03',
    title: 'Get Your Results',
    description: 'Receive instant scoring with clinical interpretation, severity bands, and personalized recommendations.',
    icon: TrendingUp,
  },
];

const trustPoints = [
  {
    icon: Shield,
    title: 'Clinically Validated',
    description: 'Every tool uses peer-reviewed scoring algorithms from published research (Kroenke, Spitzer, Lovibond, WHO, Cohen, Morin).',
  },
  {
    icon: Lock,
    title: 'Private & Secure',
    description: 'Your data stays yours. We follow strict privacy protocols with informed consent at every step.',
  },
  {
    icon: HeartPulse,
    title: 'Crisis-Ready',
    description: 'Built-in crisis detection with immediate access to helpline resources when it matters most.',
  },
  {
    icon: TrendingUp,
    title: 'Track Over Time',
    description: 'Longitudinal mood and score tracking so you can visualize your mental health journey.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Brain className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">PsychAssess</span>
          </div>
          <Link
            href="/psych"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-all hover:bg-foreground/90 hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Shield className="h-3.5 w-3.5" />
              Scientifically Validated Assessments
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Understand your
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"> mental health</span>
              <br />with clarity
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Take clinically validated psychological assessments used by healthcare professionals worldwide.
              Get instant, science-backed insights into your depression, anxiety, stress, wellbeing, and sleep.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/psych"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
              >
                Start Free Assessment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/psych/consent"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Learn How It Works
              </Link>
            </div>

            {/* Quick stats */}
            <div className="mt-16 flex items-center justify-center gap-8 border-t border-border pt-8 sm:gap-16">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground sm:text-3xl">7</div>
                <div className="mt-1 text-sm text-muted-foreground">Assessment Tools</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground sm:text-3xl">61</div>
                <div className="mt-1 text-sm text-muted-foreground">Validated Questions</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground sm:text-3xl">6</div>
                <div className="mt-1 text-sm text-muted-foreground">Clinical Domains</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Tools Grid */}
      <section className="border-t border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Comprehensive Assessment Suite
            </h2>
            <p className="text-lg text-muted-foreground">
              Each tool is based on peer-reviewed research and used in clinical practice worldwide.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assessmentTools.map((tool) => (
              <div
                key={tool.name}
                className="group relative rounded-xl border border-border bg-white p-6 transition-all hover:border-border/80 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.bgLight}`}>
                    <tool.icon className={`h-5 w-5 ${tool.textColor}`} />
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {tool.items} items
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">{tool.name}</h3>
                <p className="mb-2 text-sm font-medium text-muted-foreground">{tool.domain}</p>
                <p className="text-sm leading-relaxed text-muted-foreground/80">{tool.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Plus <strong>PHQ-2</strong> quick depression screening with adaptive pathway to PHQ-9
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get meaningful insights in just a few minutes.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((item, i) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-10 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-border to-transparent sm:block" />
                )}
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-100">
                  <item.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                  Step {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="border-t border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built on Science. Designed with Care.
            </h2>
            <p className="text-lg text-muted-foreground">
              Every aspect of PsychAssess is grounded in clinical research and built with your safety in mind.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {trustPoints.map((point) => (
              <div key={point.title} className="flex gap-4 rounded-xl border border-border bg-white p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <point.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research References */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Backed by Published Research
            </h2>
            <p className="mb-12 text-lg text-muted-foreground">
              Our scoring algorithms are implemented directly from these landmark publications.
            </p>

            <div className="space-y-3 text-left">
              {[
                'Kroenke, Spitzer & Williams (2001) — PHQ-9, Journal of General Internal Medicine',
                'Spitzer, Kroenke, Williams & Lowe (2006) — GAD-7, Archives of Internal Medicine',
                'Lovibond & Lovibond (1995) — DASS-21, Behaviour Research and Therapy',
                'WHO / Bech et al. (1998) — WHO-5 Well-Being Index',
                'Cohen, Kamarck & Mermelstein (1983) — PSS-10, Journal of Health and Social Behavior',
                'Morin (1993) — ISI, Guilford Press',
              ].map((ref) => (
                <div key={ref} className="flex items-start gap-3 rounded-lg border border-border bg-white px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">{ref}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-8 py-16 text-center shadow-2xl sm:px-16">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            </div>

            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Ready to understand yourself better?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-blue-100">
                Take your first assessment today. It only takes a few minutes, and the insights can last a lifetime.
              </p>
              <Link
                href="/psych"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
              >
                Begin Your Assessment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600">
                <Brain className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-foreground">PsychAssess</span>
              <span className="text-sm text-muted-foreground">by Cureocity</span>
            </div>
            <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground sm:text-right">
              PsychAssess is a screening tool, not a diagnostic instrument. Results do not constitute a clinical
              diagnosis. If you are in crisis, please contact a mental health professional or call a crisis helpline
              immediately.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">PsychAssess</h1>
        <p className="text-lg text-muted-foreground">
          Scientifically validated psychological assessments to help you
          understand and track your mental health.
        </p>
        <Link
          href="/psych"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}

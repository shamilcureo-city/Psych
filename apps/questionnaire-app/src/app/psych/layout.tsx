import Link from 'next/link';

export default function PsychLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/psych" className="font-semibold text-lg">
            PsychAssess
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/psych" className="hover:text-foreground transition-colors">
              Assessments
            </Link>
            <Link href="/psych/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        PsychAssess is a screening tool and does NOT provide clinical diagnoses.
        Results are intended to support — not replace — qualified mental health professionals.
      </footer>
    </div>
  );
}

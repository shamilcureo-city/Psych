'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/psych', label: 'Assessments', exact: true },
  { href: '/psych/dashboard', label: 'Dashboard', exact: false },
  { href: '/psych/mood', label: 'Mood', exact: false },
  { href: '/psych/history', label: 'History', exact: false },
];

export default function PsychLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/psych" className="font-semibold text-lg">
            PsychAssess
          </Link>
          <nav className="flex gap-4 text-sm" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive(item.href, item.exact)
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
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

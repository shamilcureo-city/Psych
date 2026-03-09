'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredSession, clearStoredSession, type AuthSession } from '@/lib/auth';
import { LogOut, Crown } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/psych', label: 'Assessments', exact: true },
  { href: '/psych/dashboard', label: 'Dashboard', exact: false },
  { href: '/psych/mood', label: 'Mood', exact: false },
  { href: '/psych/history', label: 'History', exact: false },
];

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  WELLNESS: 'Wellness',
  CLINICAL: 'Clinical',
};

export default function PsychLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
    router.push('/');
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
          <div className="flex items-center gap-3">
            {session ? (
              <>
                {session.user.plan && session.user.plan !== 'FREE' && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    <Crown className="h-3 w-3" />
                    {PLAN_LABELS[session.user.plan] || session.user.plan}
                  </span>
                )}
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-all hover:bg-foreground/90"
              >
                Sign In
              </Link>
            )}
          </div>
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

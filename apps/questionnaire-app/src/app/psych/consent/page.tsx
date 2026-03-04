'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { INFORMED_CONSENT_TEXT } from '@psychassess/shared';

export default function ConsentPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('psychassess_consent', 'true');
    localStorage.setItem('psychassess_consent_date', new Date().toISOString());
    router.push('/psych');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{INFORMED_CONSENT_TEXT.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {INFORMED_CONSENT_TEXT.sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="font-semibold text-sm">{section.heading}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}

          <Alert variant="warning">
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              If you are currently in crisis or experiencing thoughts of
              self-harm, please contact a crisis helpline immediately:
              <br />
              <strong>iCall: 9152987821</strong> &middot;{' '}
              <strong>Vandrevala Foundation: 1860-2662-345 (24/7)</strong>
            </AlertDescription>
          </Alert>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 focus-visible:ring-2 focus-visible:ring-primary"
              aria-describedby="consent-description"
            />
            <span id="consent-description" className="text-sm">
              I have read and understood the above information. I understand that
              this is a screening tool and not a diagnostic service. I consent to
              my responses being stored securely for generating results and
              tracking progress.
            </span>
          </label>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={handleAccept} disabled={!accepted}>
            I Agree — Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import { CrisisResource } from '../types/assessment.types';

/**
 * India-specific crisis resources per PRD Appendix B.
 * These are displayed immediately when a crisis flag is triggered.
 */
export const CRISIS_RESOURCES_INDIA: CrisisResource[] = [
  {
    name: 'iCall (TISS)',
    phone: '9152987821',
    availability: 'Mon–Sat, 8am–10pm',
    whatsapp: '+91 9152987821',
    region: 'India',
  },
  {
    name: 'Vandrevala Foundation',
    phone: '1860-2662-345',
    availability: '24/7',
    region: 'India',
  },
  {
    name: 'NIMHANS Helpline',
    phone: '080-46110007',
    availability: '24/7',
    region: 'India',
  },
  {
    name: 'Snehi',
    phone: '044-24640050',
    availability: 'Daily, 8am–10pm',
    region: 'India',
  },
  {
    name: 'AASRA',
    phone: '9820466627',
    availability: '24/7',
    region: 'India',
  },
];

/**
 * Crisis detection thresholds — used by CrisisService.
 */
export const CRISIS_THRESHOLDS = {
  PHQ9_Q9_QUESTION_ID: 'phq9_9',
  PHQ9_Q9_THRESHOLD: 1, // Score >= 1 triggers crisis protocol
  CLINICIAN_ALERT_SLA_MINUTES: 30,
} as const;

/**
 * Non-diagnostic disclaimer — displayed on all results screens and PDFs.
 * Per PRD Section 7.1 — P0 Blocker.
 */
export const NON_DIAGNOSTIC_DISCLAIMER =
  'This assessment is a screening tool and does NOT provide a clinical diagnosis. ' +
  'Results are intended to support — not replace — evaluation by a qualified mental health professional. ' +
  'If you are in crisis or experiencing thoughts of self-harm, please contact a crisis helpline immediately.';

export const INFORMED_CONSENT_TEXT = {
  title: 'Informed Consent — PsychAssess',
  sections: [
    {
      heading: 'Purpose',
      body: 'PsychAssess provides scientifically validated psychological screening assessments to help you understand your mental health. These tools are used worldwide in clinical and research settings.',
    },
    {
      heading: 'Important Limitations',
      body: 'This is a screening tool, not a diagnostic instrument. Results do not constitute a clinical diagnosis and should not replace professional evaluation. Always consult a qualified mental health professional for clinical concerns.',
    },
    {
      heading: 'Crisis Support',
      body: 'If any of your responses indicate you may be in distress or at risk, we will immediately provide crisis helpline information. Your safety is our highest priority.',
    },
    {
      heading: 'Privacy & Data',
      body: 'Your responses are encrypted at rest and in transit. You can delete your assessment history at any time. Data is stored securely and used only to provide your results and track your progress over time.',
    },
    {
      heading: 'Consent',
      body: 'By proceeding, you confirm that you understand this is a screening tool, not a diagnostic service, and that you consent to your responses being stored securely for the purpose of generating your results and tracking your progress.',
    },
  ],
};

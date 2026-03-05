'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface IntakeData {
  age: string;
  gender: string;
  occupation: string;
  referralSource: string;
  primaryConcern: string;
  previousCounseling: string;
  currentMedication: string;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const REFERRAL_OPTIONS = ['Self', 'Healthcare provider', 'Employer/HR', 'Family/Friend', 'Online search', 'Other'];
const COUNSELING_OPTIONS = ['Never', 'Currently in counseling', 'Previously (within 1 year)', 'Previously (over 1 year ago)'];
const CONCERN_OPTIONS = [
  'Anxiety or worry',
  'Low mood or depression',
  'Stress management',
  'Sleep difficulties',
  'Relationship issues',
  'Work/academic pressure',
  'Grief or loss',
  'General wellbeing check',
  'Other',
];

export default function IntakePage() {
  const router = useRouter();
  const [data, setData] = useState<IntakeData>({
    age: '',
    gender: '',
    occupation: '',
    referralSource: '',
    primaryConcern: '',
    previousCounseling: '',
    currentMedication: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeData, string>>>({});

  const updateField = (field: keyof IntakeData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof IntakeData, string>> = {};
    if (!data.age || isNaN(Number(data.age)) || Number(data.age) < 13 || Number(data.age) > 120) {
      newErrors.age = 'Please enter a valid age (13-120)';
    }
    if (!data.gender) newErrors.gender = 'Please select a gender';
    if (!data.primaryConcern) newErrors.primaryConcern = 'Please select a primary concern';
    if (!data.previousCounseling) newErrors.previousCounseling = 'Please select an option';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // Store intake data locally for now
    localStorage.setItem('psychassess_intake', JSON.stringify(data));
    router.push('/psych');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Intake Questionnaire</h1>
        <p className="text-muted-foreground">
          Please provide some background information. This helps us recommend the most appropriate assessments.
        </p>
      </div>

      <Alert variant="info">
        <AlertTitle>Privacy Notice</AlertTitle>
        <AlertDescription>
          Your responses are stored locally and are not shared with anyone.
          This information is used solely to personalize your assessment experience.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About You</CardTitle>
          <CardDescription>Basic demographic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Age */}
          <div>
            <label htmlFor="intake-age" className="text-sm font-medium block mb-1">
              Age <span className="text-destructive">*</span>
            </label>
            <input
              id="intake-age"
              type="number"
              min={13}
              max={120}
              value={data.age}
              onChange={(e) => updateField('age', e.target.value)}
              className="w-full rounded-lg border border-border p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
              placeholder="Enter your age"
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? 'age-error' : undefined}
            />
            {errors.age && <p id="age-error" className="text-xs text-destructive mt-1">{errors.age}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Gender <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Gender">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => updateField('gender', option)}
                  role="radio"
                  aria-checked={data.gender === option}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    data.gender === option
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
          </div>

          {/* Occupation */}
          <div>
            <label htmlFor="intake-occupation" className="text-sm font-medium block mb-1">
              Occupation (optional)
            </label>
            <input
              id="intake-occupation"
              type="text"
              value={data.occupation}
              onChange={(e) => updateField('occupation', e.target.value)}
              className="w-full rounded-lg border border-border p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
              placeholder="e.g., Student, Software Engineer, Homemaker"
              maxLength={100}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clinical Background</CardTitle>
          <CardDescription>Helps us tailor your assessment experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Concern */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Primary Concern <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Primary concern">
              {CONCERN_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => updateField('primaryConcern', option)}
                  role="radio"
                  aria-checked={data.primaryConcern === option}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    data.primaryConcern === option
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.primaryConcern && <p className="text-xs text-destructive mt-1">{errors.primaryConcern}</p>}
          </div>

          {/* Previous Counseling */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Previous Counseling Experience <span className="text-destructive">*</span>
            </label>
            <div className="space-y-2" role="radiogroup" aria-label="Previous counseling">
              {COUNSELING_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => updateField('previousCounseling', option)}
                  role="radio"
                  aria-checked={data.previousCounseling === option}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    data.previousCounseling === option
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.previousCounseling && <p className="text-xs text-destructive mt-1">{errors.previousCounseling}</p>}
          </div>

          {/* Referral Source */}
          <div>
            <label htmlFor="intake-referral" className="text-sm font-medium block mb-1">
              How did you hear about us? (optional)
            </label>
            <select
              id="intake-referral"
              value={data.referralSource}
              onChange={(e) => updateField('referralSource', e.target.value)}
              className="w-full rounded-lg border border-border p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
            >
              <option value="">Select an option</option>
              {REFERRAL_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Current Medication */}
          <div>
            <label htmlFor="intake-medication" className="text-sm font-medium block mb-1">
              Current Medications (optional)
            </label>
            <textarea
              id="intake-medication"
              value={data.currentMedication}
              onChange={(e) => updateField('currentMedication', e.target.value)}
              className="w-full rounded-lg border border-border p-2.5 text-sm bg-background resize-none h-20 focus:ring-2 focus:ring-primary/40 focus:outline-none"
              placeholder="List any medications you are currently taking"
              maxLength={500}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            Continue to Assessments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

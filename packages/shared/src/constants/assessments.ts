import {
  AssessmentToolDefinition,
  AssessmentToolType,
  SeverityBand,
} from '../types/assessment.types';

// ─── Standard Likert options reused across tools ──────────────
const PHQ_GAD_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

const DASS_OPTIONS = [
  { value: 0, label: 'Did not apply to me at all' },
  { value: 1, label: 'Applied to me to some degree, or some of the time' },
  { value: 2, label: 'Applied to me to a considerable degree or a good part of time' },
  { value: 3, label: 'Applied to me very much or most of the time' },
];

const WHO5_OPTIONS = [
  { value: 5, label: 'All of the time' },
  { value: 4, label: 'Most of the time' },
  { value: 3, label: 'More than half of the time' },
  { value: 2, label: 'Less than half of the time' },
  { value: 1, label: 'Some of the time' },
  { value: 0, label: 'At no time' },
];

const PSS_FREQUENCY_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Fairly often' },
  { value: 4, label: 'Very often' },
];

const PSS_REVERSE_OPTIONS = [
  { value: 4, label: 'Never' },
  { value: 3, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 1, label: 'Fairly often' },
  { value: 0, label: 'Very often' },
];

const ISI_OPTIONS_SEVERITY = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Mild' },
  { value: 2, label: 'Moderate' },
  { value: 3, label: 'Severe' },
  { value: 4, label: 'Very severe' },
];

const ISI_OPTIONS_SATISFACTION = [
  { value: 0, label: 'Very satisfied' },
  { value: 1, label: 'Satisfied' },
  { value: 2, label: 'Moderately satisfied' },
  { value: 3, label: 'Dissatisfied' },
  { value: 4, label: 'Very dissatisfied' },
];

const ISI_OPTIONS_NOTICEABLE = [
  { value: 0, label: 'Not at all noticeable' },
  { value: 1, label: 'A little' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Much' },
  { value: 4, label: 'Very much noticeable' },
];

const ISI_OPTIONS_WORRIED = [
  { value: 0, label: 'Not at all worried' },
  { value: 1, label: 'A little' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Much' },
  { value: 4, label: 'Very much worried' },
];

const ISI_OPTIONS_INTERFERE = [
  { value: 0, label: 'Not at all interfering' },
  { value: 1, label: 'A little' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Much' },
  { value: 4, label: 'Very much interfering' },
];

// ═══════════════════════════════════════════════════════════════
//  PHQ-2  —  Patient Health Questionnaire-2
// ═══════════════════════════════════════════════════════════════
export const PHQ2_DEFINITION: AssessmentToolDefinition = {
  type: AssessmentToolType.PHQ2,
  name: 'PHQ-2',
  fullName: 'Patient Health Questionnaire-2',
  domain: 'Depression Quick Screen',
  description:
    'A brief 2-item screening tool for depression. A score of 3 or greater indicates a positive screen and warrants administration of the full PHQ-9.',
  itemCount: 2,
  scoreRange: { min: 0, max: 6 },
  guideline: 'USPSTF',
  reference: 'Kroenke, Spitzer & Williams (2003), Medical Care',
  license: 'Free — Pfizer public domain',
  questions: [
    {
      id: 'phq2_1',
      index: 0,
      text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq2_2',
      index: 1,
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      options: PHQ_GAD_OPTIONS,
    },
  ],
  severityThresholds: [
    {
      min: 0,
      max: 2,
      band: SeverityBand.NEGATIVE_SCREEN,
      label: 'Negative Screen',
      clinicalInterpretation:
        'Score below the clinical cutoff. Depression screening is negative.',
      recommendation:
        'No further depression screening required at this time. Consider reassessment if symptoms develop.',
    },
    {
      min: 3,
      max: 6,
      band: SeverityBand.POSITIVE_SCREEN,
      label: 'Positive Screen',
      clinicalInterpretation:
        'Score meets or exceeds the clinical cutoff of 3. Positive screen for possible depressive disorder.',
      recommendation:
        'Administer the full PHQ-9 for comprehensive depression assessment.',
    },
  ],
  adaptiveTriggers: [
    {
      condition: 'totalScore >= 3',
      triggeredTool: AssessmentToolType.PHQ9,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  PHQ-9  —  Patient Health Questionnaire-9
// ═══════════════════════════════════════════════════════════════
export const PHQ9_DEFINITION: AssessmentToolDefinition = {
  type: AssessmentToolType.PHQ9,
  name: 'PHQ-9',
  fullName: 'Patient Health Questionnaire-9',
  domain: 'Depression',
  description:
    'A 9-item self-report measure for screening and monitoring depression severity. Based on DSM-5 criteria for Major Depressive Disorder.',
  itemCount: 9,
  scoreRange: { min: 0, max: 27 },
  guideline: 'APA / DSM-5',
  reference: 'Kroenke, Spitzer & Williams (2001), Journal of General Internal Medicine',
  license: 'Free — Pfizer public domain',
  questions: [
    {
      id: 'phq9_1',
      index: 0,
      text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq9_2',
      index: 1,
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq9_3',
      index: 2,
      text: 'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq9_4',
      index: 3,
      text: 'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq9_5',
      index: 4,
      text: 'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq9_6',
      index: 5,
      text: 'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq9_7',
      index: 6,
      text: 'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq9_8',
      index: 7,
      text: 'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'phq9_9',
      index: 8,
      text: 'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself in some way?',
      options: PHQ_GAD_OPTIONS,
    },
  ],
  severityThresholds: [
    {
      min: 0,
      max: 4,
      band: SeverityBand.MINIMAL,
      label: 'Minimal Depression',
      clinicalInterpretation:
        'Symptom severity is below the clinical threshold. No significant depressive symptoms endorsed.',
      recommendation:
        'No treatment indicated. Consider periodic reassessment.',
    },
    {
      min: 5,
      max: 9,
      band: SeverityBand.MILD,
      label: 'Mild Depression',
      clinicalInterpretation:
        'Mild depressive symptoms present. May reflect subsyndromal depression or adjustment difficulties.',
      recommendation:
        'Watchful waiting. Consider self-help strategies, psychoeducation, and reassessment in 2–4 weeks.',
    },
    {
      min: 10,
      max: 14,
      band: SeverityBand.MODERATE,
      label: 'Moderate Depression',
      clinicalInterpretation:
        'Moderate depressive symptoms consistent with potential clinical significance. Functional impairment likely.',
      recommendation:
        'Consider counseling or psychotherapy. Discuss treatment options with a mental health professional.',
    },
    {
      min: 15,
      max: 19,
      band: SeverityBand.MODERATELY_SEVERE,
      label: 'Moderately Severe Depression',
      clinicalInterpretation:
        'Moderately severe symptoms suggesting Major Depressive Episode. Significant functional impairment expected.',
      recommendation:
        'Active treatment with psychotherapy and/or pharmacotherapy recommended. Referral to mental health specialist advised.',
    },
    {
      min: 20,
      max: 27,
      band: SeverityBand.SEVERE,
      label: 'Severe Depression',
      clinicalInterpretation:
        'Severe depressive symptoms. High likelihood of Major Depressive Disorder with significant functional impairment.',
      recommendation:
        'Urgent referral to psychiatrist or mental health specialist. Combined psychotherapy and pharmacotherapy strongly recommended.',
    },
  ],
  crisisItems: [
    {
      questionId: 'phq9_9',
      threshold: 1,
      action: 'CRISIS_PROTOCOL: Display crisis resources immediately. Flag for clinician review within 30 minutes.',
    },
  ],
  adaptiveTriggers: [
    {
      condition: 'question.phq9_3.score >= 2',
      triggeredTool: AssessmentToolType.ISI,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  GAD-7  —  Generalized Anxiety Disorder-7
// ═══════════════════════════════════════════════════════════════
export const GAD7_DEFINITION: AssessmentToolDefinition = {
  type: AssessmentToolType.GAD7,
  name: 'GAD-7',
  fullName: 'Generalized Anxiety Disorder-7',
  domain: 'Anxiety',
  description:
    'A 7-item self-report measure for screening and monitoring generalized anxiety disorder severity. Aligned with DSM-5 criteria.',
  itemCount: 7,
  scoreRange: { min: 0, max: 21 },
  guideline: 'NICE / DSM-5',
  reference: 'Spitzer, Kroenke, Williams & Löwe (2006), Archives of Internal Medicine',
  license: 'Free — Pfizer public domain',
  questions: [
    {
      id: 'gad7_1',
      index: 0,
      text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'gad7_2',
      index: 1,
      text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'gad7_3',
      index: 2,
      text: 'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'gad7_4',
      index: 3,
      text: 'Over the last 2 weeks, how often have you been bothered by trouble relaxing?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'gad7_5',
      index: 4,
      text: 'Over the last 2 weeks, how often have you been bothered by being so restless that it is hard to sit still?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'gad7_6',
      index: 5,
      text: 'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?',
      options: PHQ_GAD_OPTIONS,
    },
    {
      id: 'gad7_7',
      index: 6,
      text: 'Over the last 2 weeks, how often have you been bothered by feeling afraid, as if something awful might happen?',
      options: PHQ_GAD_OPTIONS,
    },
  ],
  severityThresholds: [
    {
      min: 0,
      max: 4,
      band: SeverityBand.MINIMAL,
      label: 'Minimal Anxiety',
      clinicalInterpretation: 'Anxiety symptoms are below the clinical threshold.',
      recommendation: 'No treatment indicated. Reassess if symptoms develop.',
    },
    {
      min: 5,
      max: 9,
      band: SeverityBand.MILD,
      label: 'Mild Anxiety',
      clinicalInterpretation: 'Mild anxiety symptoms present. May reflect normal stress response or subclinical anxiety.',
      recommendation: 'Self-help strategies and psychoeducation. Reassess in 2–4 weeks.',
    },
    {
      min: 10,
      max: 14,
      band: SeverityBand.MODERATE,
      label: 'Moderate Anxiety',
      clinicalInterpretation: 'Moderate anxiety symptoms with likely functional impairment. Consider clinical evaluation.',
      recommendation: 'Counseling or psychotherapy recommended. Discuss options with a mental health professional.',
    },
    {
      min: 15,
      max: 21,
      band: SeverityBand.SEVERE,
      label: 'Severe Anxiety',
      clinicalInterpretation: 'Severe anxiety symptoms consistent with Generalized Anxiety Disorder. Significant functional impairment.',
      recommendation: 'Referral to mental health specialist. Psychotherapy and/or pharmacotherapy recommended.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  DASS-21  —  Depression Anxiety Stress Scales
// ═══════════════════════════════════════════════════════════════
const DASS21_DEPRESSION_THRESHOLDS = [
  { min: 0, max: 9, band: SeverityBand.NORMAL as SeverityBand, label: 'Normal', clinicalInterpretation: 'Depression subscale score is within the normal range.', recommendation: 'No intervention needed for depression symptoms.' },
  { min: 10, max: 13, band: SeverityBand.MILD as SeverityBand, label: 'Mild', clinicalInterpretation: 'Mild depressive symptoms on the DASS-21 depression subscale.', recommendation: 'Monitor and consider self-help strategies.' },
  { min: 14, max: 20, band: SeverityBand.MODERATE as SeverityBand, label: 'Moderate', clinicalInterpretation: 'Moderate depressive symptoms requiring attention.', recommendation: 'Consider counseling or psychotherapy.' },
  { min: 21, max: 27, band: SeverityBand.SEVERE as SeverityBand, label: 'Severe', clinicalInterpretation: 'Severe depressive symptoms on the DASS-21.', recommendation: 'Referral to mental health professional recommended.' },
  { min: 28, max: 42, band: SeverityBand.EXTREMELY_SEVERE as SeverityBand, label: 'Extremely Severe', clinicalInterpretation: 'Extremely severe depressive symptoms.', recommendation: 'Urgent referral to psychiatrist or mental health specialist.' },
];

const DASS21_ANXIETY_THRESHOLDS = [
  { min: 0, max: 7, band: SeverityBand.NORMAL as SeverityBand, label: 'Normal', clinicalInterpretation: 'Anxiety subscale score is within the normal range.', recommendation: 'No intervention needed for anxiety symptoms.' },
  { min: 8, max: 9, band: SeverityBand.MILD as SeverityBand, label: 'Mild', clinicalInterpretation: 'Mild anxiety symptoms on the DASS-21 anxiety subscale.', recommendation: 'Monitor and consider relaxation techniques.' },
  { min: 10, max: 14, band: SeverityBand.MODERATE as SeverityBand, label: 'Moderate', clinicalInterpretation: 'Moderate anxiety symptoms requiring attention.', recommendation: 'Consider counseling or psychotherapy.' },
  { min: 15, max: 19, band: SeverityBand.SEVERE as SeverityBand, label: 'Severe', clinicalInterpretation: 'Severe anxiety symptoms on the DASS-21.', recommendation: 'Referral to mental health professional recommended.' },
  { min: 20, max: 42, band: SeverityBand.EXTREMELY_SEVERE as SeverityBand, label: 'Extremely Severe', clinicalInterpretation: 'Extremely severe anxiety symptoms.', recommendation: 'Urgent referral to psychiatrist or mental health specialist.' },
];

const DASS21_STRESS_THRESHOLDS = [
  { min: 0, max: 14, band: SeverityBand.NORMAL as SeverityBand, label: 'Normal', clinicalInterpretation: 'Stress subscale score is within the normal range.', recommendation: 'No intervention needed for stress symptoms.' },
  { min: 15, max: 18, band: SeverityBand.MILD as SeverityBand, label: 'Mild', clinicalInterpretation: 'Mild stress symptoms on the DASS-21 stress subscale.', recommendation: 'Consider stress management techniques.' },
  { min: 19, max: 25, band: SeverityBand.MODERATE as SeverityBand, label: 'Moderate', clinicalInterpretation: 'Moderate stress symptoms requiring attention.', recommendation: 'Stress management strategies and possible counseling.' },
  { min: 26, max: 33, band: SeverityBand.SEVERE as SeverityBand, label: 'Severe', clinicalInterpretation: 'Severe stress symptoms on the DASS-21.', recommendation: 'Professional support recommended.' },
  { min: 34, max: 42, band: SeverityBand.EXTREMELY_SEVERE as SeverityBand, label: 'Extremely Severe', clinicalInterpretation: 'Extremely severe stress symptoms.', recommendation: 'Urgent professional support recommended.' },
];

export const DASS21_DEFINITION: AssessmentToolDefinition = {
  type: AssessmentToolType.DASS21,
  name: 'DASS-21',
  fullName: 'Depression Anxiety Stress Scales-21',
  domain: 'Depression + Anxiety + Stress',
  description:
    'A 21-item self-report measure yielding three subscales: Depression (7 items), Anxiety (7 items), and Stress (7 items). Scores are doubled to match the full DASS-42 norms.',
  itemCount: 21,
  scoreRange: { min: 0, max: 126 },
  guideline: 'Lovibond & Lovibond (1995)',
  reference: 'Lovibond & Lovibond (1995), Behaviour Research and Therapy',
  license: 'Free — UNSW Australia',
  questions: [
    // Depression items: 3, 5, 10, 13, 16, 17, 21 (0-indexed: 2,4,9,12,15,16,20)
    // Anxiety items: 2, 4, 7, 9, 15, 19, 20 (0-indexed: 1,3,6,8,14,18,19)
    // Stress items: 1, 6, 8, 11, 12, 14, 18 (0-indexed: 0,5,7,10,11,13,17)
    { id: 'dass21_1', index: 0, text: 'I found it hard to wind down.', options: DASS_OPTIONS, subscale: 'stress' },
    { id: 'dass21_2', index: 1, text: 'I was aware of dryness of my mouth.', options: DASS_OPTIONS, subscale: 'anxiety' },
    { id: 'dass21_3', index: 2, text: 'I couldn\'t seem to experience any positive feeling at all.', options: DASS_OPTIONS, subscale: 'depression' },
    { id: 'dass21_4', index: 3, text: 'I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion).', options: DASS_OPTIONS, subscale: 'anxiety' },
    { id: 'dass21_5', index: 4, text: 'I found it difficult to work up the initiative to do things.', options: DASS_OPTIONS, subscale: 'depression' },
    { id: 'dass21_6', index: 5, text: 'I tended to over-react to situations.', options: DASS_OPTIONS, subscale: 'stress' },
    { id: 'dass21_7', index: 6, text: 'I experienced trembling (e.g., in the hands).', options: DASS_OPTIONS, subscale: 'anxiety' },
    { id: 'dass21_8', index: 7, text: 'I felt that I was using a lot of nervous energy.', options: DASS_OPTIONS, subscale: 'stress' },
    { id: 'dass21_9', index: 8, text: 'I was worried about situations in which I might panic and make a fool of myself.', options: DASS_OPTIONS, subscale: 'anxiety' },
    { id: 'dass21_10', index: 9, text: 'I felt that I had nothing to look forward to.', options: DASS_OPTIONS, subscale: 'depression' },
    { id: 'dass21_11', index: 10, text: 'I found myself getting agitated.', options: DASS_OPTIONS, subscale: 'stress' },
    { id: 'dass21_12', index: 11, text: 'I found it difficult to relax.', options: DASS_OPTIONS, subscale: 'stress' },
    { id: 'dass21_13', index: 12, text: 'I felt down-hearted and blue.', options: DASS_OPTIONS, subscale: 'depression' },
    { id: 'dass21_14', index: 13, text: 'I was intolerant of anything that kept me from getting on with what I was doing.', options: DASS_OPTIONS, subscale: 'stress' },
    { id: 'dass21_15', index: 14, text: 'I felt I was close to panic.', options: DASS_OPTIONS, subscale: 'anxiety' },
    { id: 'dass21_16', index: 15, text: 'I was unable to become enthusiastic about anything.', options: DASS_OPTIONS, subscale: 'depression' },
    { id: 'dass21_17', index: 16, text: 'I felt I wasn\'t worth much as a person.', options: DASS_OPTIONS, subscale: 'depression' },
    { id: 'dass21_18', index: 17, text: 'I felt that I was rather touchy.', options: DASS_OPTIONS, subscale: 'stress' },
    { id: 'dass21_19', index: 18, text: 'I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat).', options: DASS_OPTIONS, subscale: 'anxiety' },
    { id: 'dass21_20', index: 19, text: 'I felt scared without any good reason.', options: DASS_OPTIONS, subscale: 'anxiety' },
    { id: 'dass21_21', index: 20, text: 'I felt that life was meaningless.', options: DASS_OPTIONS, subscale: 'depression' },
  ],
  severityThresholds: [
    // Overall thresholds are not standard for DASS-21; subscale thresholds are used
    { min: 0, max: 30, band: SeverityBand.NORMAL, label: 'Normal Range', clinicalInterpretation: 'Overall DASS-21 scores are within the normal range across subscales.', recommendation: 'Review individual subscale scores for specific concerns.' },
    { min: 31, max: 63, band: SeverityBand.MILD, label: 'Mild to Moderate', clinicalInterpretation: 'Elevated scores on one or more subscales.', recommendation: 'Review individual subscale scores and consider targeted intervention.' },
    { min: 64, max: 126, band: SeverityBand.SEVERE, label: 'Severe', clinicalInterpretation: 'High overall distress across multiple domains.', recommendation: 'Comprehensive mental health evaluation recommended.' },
  ],
  subscales: [
    {
      name: 'Depression',
      questionIds: ['dass21_3', 'dass21_5', 'dass21_10', 'dass21_13', 'dass21_16', 'dass21_17', 'dass21_21'],
      multiplier: 2,
      severityThresholds: DASS21_DEPRESSION_THRESHOLDS,
    },
    {
      name: 'Anxiety',
      questionIds: ['dass21_2', 'dass21_4', 'dass21_7', 'dass21_9', 'dass21_15', 'dass21_19', 'dass21_20'],
      multiplier: 2,
      severityThresholds: DASS21_ANXIETY_THRESHOLDS,
    },
    {
      name: 'Stress',
      questionIds: ['dass21_1', 'dass21_6', 'dass21_8', 'dass21_11', 'dass21_12', 'dass21_14', 'dass21_18'],
      multiplier: 2,
      severityThresholds: DASS21_STRESS_THRESHOLDS,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  WHO-5  —  WHO Well-Being Index
// ═══════════════════════════════════════════════════════════════
export const WHO5_DEFINITION: AssessmentToolDefinition = {
  type: AssessmentToolType.WHO5,
  name: 'WHO-5',
  fullName: 'WHO Well-Being Index',
  domain: 'General Wellbeing',
  description:
    'A 5-item self-report measure of subjective well-being. Raw score (0–25) is multiplied by 4 to get a percentage scale (0–100). Scores below 52 suggest poor wellbeing warranting further assessment.',
  itemCount: 5,
  scoreRange: { min: 0, max: 100 },
  guideline: 'WHO',
  reference: 'WHO (1998), Bech et al.',
  license: 'Free — WHO',
  questions: [
    { id: 'who5_1', index: 0, text: 'Over the last 2 weeks, I have felt cheerful and in good spirits.', options: WHO5_OPTIONS },
    { id: 'who5_2', index: 1, text: 'Over the last 2 weeks, I have felt calm and relaxed.', options: WHO5_OPTIONS },
    { id: 'who5_3', index: 2, text: 'Over the last 2 weeks, I have felt active and vigorous.', options: WHO5_OPTIONS },
    { id: 'who5_4', index: 3, text: 'Over the last 2 weeks, I woke up feeling fresh and rested.', options: WHO5_OPTIONS },
    { id: 'who5_5', index: 4, text: 'Over the last 2 weeks, my daily life has been filled with things that interest me.', options: WHO5_OPTIONS },
  ],
  severityThresholds: [
    { min: 0, max: 28, band: SeverityBand.POOR, label: 'Poor Wellbeing — Possible Depression', clinicalInterpretation: 'Score indicates significantly poor wellbeing. Screen for depression using PHQ-9 is recommended.', recommendation: 'Administer PHQ-9 for depression screening. Consider referral for further evaluation.' },
    { min: 29, max: 51, band: SeverityBand.LOW, label: 'Low Wellbeing', clinicalInterpretation: 'Score below the clinical cutoff of 52, indicating suboptimal wellbeing.', recommendation: 'Monitor wellbeing. Consider lifestyle modifications and psychoeducation. Reassess in 2–4 weeks.' },
    { min: 52, max: 100, band: SeverityBand.NORMAL, label: 'Adequate Wellbeing', clinicalInterpretation: 'Wellbeing score is within the adequate range.', recommendation: 'No intervention needed. Continue current lifestyle and wellbeing practices.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  PSS-10  —  Perceived Stress Scale
// ═══════════════════════════════════════════════════════════════
export const PSS10_DEFINITION: AssessmentToolDefinition = {
  type: AssessmentToolType.PSS10,
  name: 'PSS-10',
  fullName: 'Perceived Stress Scale-10',
  domain: 'Perceived Stress',
  description:
    'A 10-item self-report measure of the degree to which situations in life are appraised as stressful. Items 4, 5, 7, and 8 are reverse-scored.',
  itemCount: 10,
  scoreRange: { min: 0, max: 40 },
  guideline: 'Cohen et al. (1983)',
  reference: 'Cohen, Kamarck & Mermelstein (1983), Journal of Health and Social Behavior',
  license: 'Free — academic use',
  questions: [
    { id: 'pss10_1', index: 0, text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', options: PSS_FREQUENCY_OPTIONS },
    { id: 'pss10_2', index: 1, text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', options: PSS_FREQUENCY_OPTIONS },
    { id: 'pss10_3', index: 2, text: 'In the last month, how often have you felt nervous and stressed?', options: PSS_FREQUENCY_OPTIONS },
    { id: 'pss10_4', index: 3, text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', options: PSS_REVERSE_OPTIONS },
    { id: 'pss10_5', index: 4, text: 'In the last month, how often have you felt that things were going your way?', options: PSS_REVERSE_OPTIONS },
    { id: 'pss10_6', index: 5, text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', options: PSS_FREQUENCY_OPTIONS },
    { id: 'pss10_7', index: 6, text: 'In the last month, how often have you been able to control irritations in your life?', options: PSS_REVERSE_OPTIONS },
    { id: 'pss10_8', index: 7, text: 'In the last month, how often have you felt that you were on top of things?', options: PSS_REVERSE_OPTIONS },
    { id: 'pss10_9', index: 8, text: 'In the last month, how often have you been angered because of things that were outside of your control?', options: PSS_FREQUENCY_OPTIONS },
    { id: 'pss10_10', index: 9, text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', options: PSS_FREQUENCY_OPTIONS },
  ],
  severityThresholds: [
    { min: 0, max: 13, band: SeverityBand.LOW, label: 'Low Perceived Stress', clinicalInterpretation: 'Perceived stress levels are low. Good coping resources indicated.', recommendation: 'No intervention needed. Maintain current stress management practices.' },
    { min: 14, max: 26, band: SeverityBand.MODERATE, label: 'Moderate Perceived Stress', clinicalInterpretation: 'Moderate levels of perceived stress. May benefit from stress reduction strategies.', recommendation: 'Consider stress management techniques, mindfulness, or counseling.' },
    { min: 27, max: 40, band: SeverityBand.HIGH, label: 'High Perceived Stress', clinicalInterpretation: 'High levels of perceived stress indicating significant burden. Risk for stress-related health issues.', recommendation: 'Professional support recommended. Consider counseling, lifestyle modifications, and stress reduction interventions.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  ISI  —  Insomnia Severity Index
// ═══════════════════════════════════════════════════════════════
export const ISI_DEFINITION: AssessmentToolDefinition = {
  type: AssessmentToolType.ISI,
  name: 'ISI',
  fullName: 'Insomnia Severity Index',
  domain: 'Sleep',
  description:
    'A 7-item self-report measure assessing the nature, severity, and impact of insomnia over the last 2 weeks.',
  itemCount: 7,
  scoreRange: { min: 0, max: 28 },
  guideline: 'Morin (1993)',
  reference: 'Morin (1993), Insomnia: Psychological Assessment and Management, Guilford Press',
  license: 'Free — non-commercial',
  questions: [
    { id: 'isi_1', index: 0, text: 'Please rate the current (i.e., last 2 weeks) severity of your difficulty falling asleep.', options: ISI_OPTIONS_SEVERITY },
    { id: 'isi_2', index: 1, text: 'Please rate the current severity of your difficulty staying asleep.', options: ISI_OPTIONS_SEVERITY },
    { id: 'isi_3', index: 2, text: 'Please rate the current severity of your problem with waking up too early.', options: ISI_OPTIONS_SEVERITY },
    { id: 'isi_4', index: 3, text: 'How satisfied/dissatisfied are you with your current sleep pattern?', options: ISI_OPTIONS_SATISFACTION },
    { id: 'isi_5', index: 4, text: 'To what extent do you consider your sleep problem to be noticeable to others in terms of impairing the quality of your life?', options: ISI_OPTIONS_NOTICEABLE },
    { id: 'isi_6', index: 5, text: 'How worried/distressed are you about your current sleep problem?', options: ISI_OPTIONS_WORRIED },
    { id: 'isi_7', index: 6, text: 'To what extent do you consider your sleep problem to interfere with your daily functioning (e.g., daytime fatigue, mood, ability to function at work/daily chores, concentration, memory, mood, etc.) currently?', options: ISI_OPTIONS_INTERFERE },
  ],
  severityThresholds: [
    { min: 0, max: 7, band: SeverityBand.MINIMAL, label: 'No Clinically Significant Insomnia', clinicalInterpretation: 'Sleep difficulties are within normal range.', recommendation: 'No treatment needed. Maintain good sleep hygiene.' },
    { min: 8, max: 14, band: SeverityBand.SUBTHRESHOLD, label: 'Subthreshold Insomnia', clinicalInterpretation: 'Mild sleep difficulties present. May be situational or emerging.', recommendation: 'Sleep hygiene education. Monitor and reassess in 2–4 weeks.' },
    { min: 15, max: 21, band: SeverityBand.MODERATE, label: 'Moderate Clinical Insomnia', clinicalInterpretation: 'Clinical insomnia present with functional impact.', recommendation: 'CBT for Insomnia (CBT-I) recommended. Consider referral to sleep specialist.' },
    { min: 22, max: 28, band: SeverityBand.SEVERE, label: 'Severe Clinical Insomnia', clinicalInterpretation: 'Severe insomnia with significant functional impairment.', recommendation: 'Urgent referral for CBT-I and/or pharmacological evaluation. Sleep study may be indicated.' },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  Registry — All Phase 1 tools
// ═══════════════════════════════════════════════════════════════
export const ASSESSMENT_TOOLS: Record<AssessmentToolType, AssessmentToolDefinition> = {
  [AssessmentToolType.PHQ2]: PHQ2_DEFINITION,
  [AssessmentToolType.PHQ9]: PHQ9_DEFINITION,
  [AssessmentToolType.GAD7]: GAD7_DEFINITION,
  [AssessmentToolType.DASS21]: DASS21_DEFINITION,
  [AssessmentToolType.WHO5]: WHO5_DEFINITION,
  [AssessmentToolType.PSS10]: PSS10_DEFINITION,
  [AssessmentToolType.ISI]: ISI_DEFINITION,
};

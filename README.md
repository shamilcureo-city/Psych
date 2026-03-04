# PsychAssess — AI-Powered Psychological Assessment & Counseling Platform

Part of the **Cureocity Ecosystem**. PsychAssess delivers scientifically validated psychological assessments, AI-powered counseling, and longitudinal mental health tracking.

## Architecture

```
Psych/
├── packages/
│   ├── shared/           # Types, assessment definitions, crisis constants
│   └── proto-common/     # gRPC proto definitions
├── services/
│   └── psychassess-service/  # NestJS + Fastify + Prisma (service #29)
└── apps/
    └── questionnaire-app/    # Next.js 14 frontend (port 3004)
```

## Phase 1 MVP — Assessment Battery

| Tool | Domain | Items | Score Range |
|------|--------|-------|-------------|
| PHQ-2 | Depression Quick Screen | 2 | 0-6 |
| PHQ-9 | Depression | 9 | 0-27 |
| GAD-7 | Anxiety | 7 | 0-21 |
| DASS-21 | Depression + Anxiety + Stress | 21 | 3 subscales |
| WHO-5 | General Wellbeing | 5 | 0-100 |
| PSS-10 | Perceived Stress | 10 | 0-40 |
| ISI | Sleep / Insomnia | 7 | 0-28 |

All scoring algorithms follow original validated publications (Kroenke 2001, Spitzer 2006, Lovibond 1995, WHO, Cohen 1983, Morin 1993).

## Quick Start

```bash
# Start infrastructure
docker compose up -d

# Install dependencies
npm install

# Generate Prisma client
cd services/psychassess-service && npx prisma generate && npx prisma db push && cd ../..

# Run backend
cd services/psychassess-service && npm run dev

# Run frontend (separate terminal)
cd apps/questionnaire-app && npm run dev
```

- Backend API: http://localhost:3029
- Swagger docs: http://localhost:3029/api/docs
- Frontend: http://localhost:3004

## API Endpoints

### Assessments
- `GET /assessments/tools` - List available assessment tools
- `POST /assessments/start` - Start new assessment session
- `POST /assessments/:sessionId/respond` - Submit question response
- `POST /assessments/:sessionId/complete` - Complete and score
- `GET /assessments/:sessionId/result` - Get scored result
- `GET /assessments/client/:clientId/history` - Longitudinal history

### Crisis
- `GET /crisis/resources` - Crisis helpline resources
- `GET /crisis/client/:clientId/active` - Active crisis events

### Mood
- `POST /mood/:clientId` - Log daily mood (1-5)
- `GET /mood/:clientId` - Mood history

### History
- `GET /history/:clientId/timeline` - Score timeline
- `GET /history/:clientId/summary` - Client summary

## Safety

- PHQ-9 Q9 >= 1 triggers immediate crisis protocol
- India-specific crisis resources: iCall, Vandrevala Foundation, NIMHANS, Snehi, AASRA
- Non-diagnostic disclaimer on all results
- Informed consent required before assessments

## Medical Disclaimer

PsychAssess is a clinical screening tool. It does **NOT** provide clinical diagnoses. All results support - not replace - qualified mental health professionals.

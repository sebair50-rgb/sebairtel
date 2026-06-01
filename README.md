# SebairTel AI Communicator

SebairTel AI Communicator is a Next.js application for real-time communication, social posting, profile management, and AI-assisted tools powered by Firebase and Genkit.

## Tech Stack

- Next.js 15 App Router
- React 18
- TypeScript
- Firebase Authentication, Firestore, and Storage
- Genkit with Google AI / Gemini models
- Tailwind CSS and Radix UI

## Required Environment Variables

Set these variables locally and in Vercel before running the app in production.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
GEMINI_API_KEY=
```

## Local Development

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

The development server runs on port `9002`.

## Genkit Development

```bash
npm run genkit:dev
```

Use `GEMINI_API_KEY` for AI flows that call Gemini models.

## Vercel Deployment

1. Create or select a Firebase project.
2. Enable Firebase Authentication providers required by the product.
3. Create Firestore and Storage resources.
4. Add all required environment variables to the Vercel project.
5. Deploy with the default Vercel Next.js build command:

```bash
npm run build
```

## Production Readiness

The active production-readiness work is tracked in [`docs/production-readiness-plan.md`](docs/production-readiness-plan.md).

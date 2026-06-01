# Production Readiness Plan

This plan defines the four repair priorities required to move SebairTel from prototype status to a real Vercel-deployable application. The project implementation and source code use English; Arabic is only used for direct owner communication.

## Priority 1: Build Integrity and Type Safety

Goal: the application must fail fast during CI when TypeScript or framework checks fail.

Tasks:
- Fix all current `npm run typecheck` errors.
- Keep generated data and app state strongly typed instead of relying on `any`.
- Remove build settings that hide TypeScript or lint failures after the checks are clean.
- Add an ESLint configuration compatible with the current Next.js version.

Acceptance criteria:
- `npm run typecheck` exits successfully.
- `npm run build` succeeds without relying on ignored TypeScript or lint errors.
- CI/Vercel can use the same commands without local-only assumptions.

## Priority 2: Real Firebase and Security Rules

Goal: Firebase must be configured from deployment environment variables and protected by server-side rules, not only UI logic.

Tasks:
- Move Firebase web configuration to `NEXT_PUBLIC_FIREBASE_*` environment variables.
- Document the required Vercel environment variables.
- Tighten Firestore writes for social, chat, notifications, and settings flows.
- Tighten Storage writes so chat attachments are restricted by chat membership.

Acceptance criteria:
- No Firebase project configuration is hard-coded in source files.
- A fresh Vercel deployment can be configured entirely through environment variables.
- Security rules validate ownership and membership for sensitive writes.

## Priority 3: AI Flow Reliability

Goal: Genkit flows must use current APIs and production-safe model names.

Tasks:
- Replace deprecated Gemini 1.5 model defaults with Gemini 2.5 model defaults.
- Fix the agentic app creator request/response contract.
- Keep all AI server actions typed and serializable across the Next.js client/server boundary.
- Ensure Genkit development registration includes all app flows.

Acceptance criteria:
- AI flows typecheck with the installed Genkit version.
- User-facing AI errors are surfaced clearly.
- Required AI environment variables are documented for Vercel.

## Priority 4: Product Completion Without Dummy Features

Goal: visible UI should either perform real work or be removed until implemented.

Tasks:
- Remove or disable non-functional “coming soon” actions from production paths.
- Remove duplicate or unused static data files.
- Replace starter documentation with real project setup and deployment instructions.
- Add a minimal test/checklist for auth, profile, chat, posts, and AI tools.

Acceptance criteria:
- Users do not see fake controls that imply working production features.
- Repository documentation is sufficient for setup, deployment, and operations.
- Duplicate static assets are consolidated.

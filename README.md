# Gatherly AI — Every Celebration, Thoughtfully Planned

AI-powered event planning for weddings, birthdays, college fests, cultural festivals, corporate events, and community celebrations.

**Built for:** PromptWars Virtual — Challenge 5: Celebration & Event Planner

[![Live Demo](https://img.shields.io/badge/Live_Demo-Play_Now-success?style=for-the-badge)](https://gatherlyai.vercel.app/)
[![Demo Video](https://img.shields.io/badge/Demo_Video-Watch_Walkthrough-red?style=for-the-badge)](https://youtu.be/HRa175pfWVE)

Gatherly AI turns an event brief into an actionable planning workspace with a budget, checklist, timeline, vendor tracker, curated ideas, and an event-readiness score. It is designed to remain useful even when AI is unavailable, with offline planning and browser-local storage.

## Table of Contents

- [Why Gatherly AI?](#why-gatherly-ai)
- [Features](#features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing and Verification](#testing-and-verification)
- [Privacy and Limitations](#privacy-and-limitations)
- [Future Scope](#future-scope)
- [Built For](#built-for)

## Why Gatherly AI?

Event planning often involves scattered notes, uncertain costs, vendor quotes, deadlines, and many small decisions. Generic AI chat responses can be difficult to turn into a plan that can be tracked and updated.

Gatherly AI combines AI-assisted ideas with a structured workspace. Users can edit their plan, track spending and tasks, manage vendors, and export a backup rather than relying on a long chat response.

## Features

- **AI-assisted event plans:** Generate structured plans using Google's Gemini API when an API key is configured.
- **Flexible event types:** Plan weddings, milestone birthdays, anniversaries, college fests, cultural events, corporate galas, baby showers, housewarmings, hackathons, and community gatherings.
- **Budget tracking in INR:** Track the overall budget, planned and committed spending, remaining buffer, category allocations, and payments.
- **Task checklist and timeline:** Turn relative task deadlines into calendar dates, monitor overdue tasks, and track dependencies.
- **Vendor tracker:** Organize venue, catering, décor, photography, entertainment, transport, and rental vendors; track booking status, quotes, and questions.
- **Themes and contingency ideas:** Explore event concepts, color palettes, activities, and practical backup plans.
- **Event readiness score:** View a 0–100 score based on checklist progress, vendor readiness, budget discipline, and contingency planning.
- **Offline-friendly planning:** Continue using the workspace and its offline generator when the Gemini API is not configured or available.
- **Browser-local persistence:** Event plans are saved in the browser's local storage.
- **JSON backup and restore:** Export plans and import supported JSON backups.
- **Print-friendly agenda:** Print an event plan or save it as a PDF using your browser's print dialog.
- **Demo plan:** Explore the workspace using the built-in sample event when available.

## How It Works

1. Enter the event details and requirements.
2. Gatherly AI requests a structured plan from the server-side API route when Gemini is configured.
3. The app validates and normalizes the generated plan before displaying it.
4. Review and edit the budget, tasks, vendors, ideas, and deadlines.
5. Track readiness as planning progresses.
6. Keep a local copy of your plan and export a JSON backup when needed.

## Technology Stack

- **Framework:** Next.js App Router
- **UI:** React and TypeScript
- **Styling:** Tailwind CSS
- **Forms and validation:** React Hook Form and Zod
- **Date utilities:** date-fns
- **AI integration:** Google Gemini API through `@google/genai`
- **Testing:** Vitest, jsdom, and Testing Library
- **Icons and UI polish:** lucide-react and canvas-confetti

## Getting Started

### Prerequisites

Install a compatible Node.js version and npm. The project was documented as tested with Node.js 24 and npm 11; your installed versions can be checked with:

```bash
node --version
npm --version
```

### 1. Clone the repository

```bash
git clone https://github.com/Deepcode2021/Gatherly-AI.git
cd Gatherly-AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root (the same directory as `package.json`) and add your own Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=your_supported_gemini_model_name
```

Get a key from [Google AI Studio](https://aistudio.google.com/apikey). Use a model name supported by your API key and configured in the project.

**Never commit your real API key.** Keep `.env.local` out of Git and do not expose the key in client-side code or public screenshots.

If the project supports offline/demo mode, you can still explore its non-AI features without configuring a key.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: Verify the Gemini API

If the repository includes the verification script, run:

```bash
npm run verify:api
```

## Testing and Verification

Run the checks supported by the project:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Only report a test count or successful result after running the current version of the corresponding command.

## Deployment on Vercel

1. Import the GitHub repository into [Vercel](https://vercel.com/).
2. In the Vercel project, open **Settings → Environment Variables**.
3. Add `GEMINI_API_KEY` with your secret key.
4. Add `GEMINI_MODEL` with the supported model name used by your project, if the code reads this variable.
5. Redeploy the project after saving environment-variable changes.
6. Open the deployed site and test both AI generation and the offline/demo path.

Keep `GEMINI_API_KEY` server-side. Do not prefix it with `NEXT_PUBLIC_`.

## Privacy and Limitations

- **Local storage:** Plans are stored in the current browser's local storage. They do not automatically sync across devices or browsers. Clearing browser data may remove locally stored plans, so export backups when needed.
- **AI requests:** When AI generation is used, event details submitted for generation are sent to the application's server API and may be processed by Google Gemini. Do not describe AI-generated planning as entirely client-side or fully private.
- **Offline behavior:** Offline/demo capabilities depend on the local generator and features included in the current build. AI generation requires a working API configuration and network access.
- **Rate limiting:** If the current API route uses in-memory rate limiting, limits may not be shared reliably across multiple serverless instances.
- **Vendor information:** Any sample or placeholder vendor entries should be verified by the user before making bookings.

## Future Scope

- Optional secure cloud backup and cross-device synchronization.
- Shared planning and collaboration for families, friends, and event teams.
- Integration with verified vendor directories and booking workflows.
- More regional event templates and localization.
- Distributed rate limiting and monitoring for production deployments.

## Built For

**PromptWars Virtual — Challenge 5: Celebration & Event Planner**

Gatherly AI is a project submission focused on turning AI-generated event ideas into an editable, trackable planning workflow.

---

If you find a bug or have a suggestion, open an issue in the GitHub repository.

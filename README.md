# NutriNote Daily

**Reflect today. Eat better tomorrow.**

NutriNote Daily is a small, privacy-first wellness app that turns a five-minute food and supplement check-in into a clear reflection and three realistic priorities for tomorrow.

## What it does

- Collects breakfast, lunch, dinner, snacks, water, energy, and supplements
- Recognizes common food words and maps them to broad food groups
- Shows which daily building blocks were mentioned
- Suggests up to three simple improvements for tomorrow
- Creates repeating calendar reminders for morning, afternoon, and evening
- Saves the current check-in only in the user's browser

## What it does not do

NutriNote does not guess calories, diagnose deficiencies, prescribe supplements, or replace a doctor or dietitian. Its results are general wellness reflections based only on the words a user enters.

## Technology

- Next.js / React
- TypeScript and JavaScript
- Tailwind CSS
- Browser local storage
- Standard `.ics` calendar reminders
- Node's built-in test runner

## Run and test

```bash
npm run install:ci
npm run dev
npm test
```

## Easy interview explanation

> I built NutriNote Daily, a privacy-first nutrition reflection app. A user records meals, water, energy, and supplements in about five minutes. The app uses lightweight natural-language matching to identify broad food groups, highlights what was covered, and gives three practical ideas for tomorrow. I intentionally avoided false calorie or medical claims, stored data only on the user's device, and added repeating calendar reminders to support consistency.

## Responsible design

The app uses transparent rules rather than pretending to be a medical AI. Common food keywords are stored in `lib/nutrition.mjs`, making the analysis easy to inspect, explain, and improve.

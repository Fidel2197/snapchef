# SnapChef

SnapChef is a food image assistant that turns a food photo or screenshot into a likely dish name, ingredient list, recipe steps, nutrition notes, safety notes, substitutions, and YouTube search links.

## What It Does

- Upload a JPG, PNG, or WebP food image
- Add servings and optional preferences
- Analyze the image through a server-side OpenAI route
- Show recipe, ingredients, and video-search views
- Fall back to demo mode when `OPENAI_API_KEY` is not configured

## Tech Stack

- Next.js App Router
- React and TypeScript
- CSS Modules
- OpenAI Responses API through `src/app/api/analyze/route.ts`
- Supabase schema prepared for saved scan history in `supabase/schema.sql`

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
copy .env.example .env.local
```

Add your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.5
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## OpenAI Account Note

The app can run in demo mode with no key, but real image analysis requires:

- an OpenAI API key
- available API credits
- access to the configured model

If the OpenAI dashboard shows `$0.00` credit remaining, the app UI will still run, but real analysis calls will fail until credits are added.

## Supabase Next Phase

Supabase is not required for the first MVP. When ready, use `supabase/schema.sql` to create saved scan history, then add:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Planned Supabase features:

- user login
- saved scans
- favorite recipes
- uploaded image storage

## Deployment

For Vercel:

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.

Keep `.env.local` out of GitHub. It is already ignored by `.gitignore`.

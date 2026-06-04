# SnapChef

SnapChef is a food image assistant that turns a food photo or screenshot into a likely dish name, ingredient list, recipe steps, nutrition notes, safety notes, substitutions, and YouTube search links.

## What It Does

- Upload a JPG, PNG, or WebP food image
- Add servings, custom notes, and multiple preference chips
- Analyze the image through a server-side Gemini or OpenAI route
- Show recipe, ingredients, shopping estimates, confidence guidance, and video-search views
- Estimate rough grocery price ranges and where to find ingredients
- Show an example response when no AI provider key is configured

## Tech Stack

- Next.js App Router
- React and TypeScript
- CSS Modules
- Gemini API or OpenAI Responses API through `src/app/api/analyze/route.ts`
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

For the no-billing-first path, add a Gemini API key:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

OpenAI is optional if you later add API credits:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.5
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI Provider Notes

The app can show an example response with no key, but real image analysis requires an API key from one provider.

Recommended MVP provider:

- Gemini API with `AI_PROVIDER=gemini`
- Google offers a free tier for testing, but it has quota/rate limits
- Use `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-2.5-flash`

Optional provider:

- OpenAI with `AI_PROVIDER=openai`
- OpenAI image analysis requires an OpenAI API key and available API credits
- If the OpenAI dashboard shows `$0.00` credit remaining, the app UI will still run, but real OpenAI analysis calls will fail until credits are added

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

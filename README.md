# SnapChef

SnapChef is a food image assistant that turns a food photo or screenshot into a likely dish name, ingredient list, recipe steps, nutrition notes, safety notes, substitutions, and YouTube search links.

## What It Does

- Upload a JPG, PNG, or WebP food image
- Add servings, custom notes, and multiple preference chips
- Analyze the image through a server-side Gemini or OpenAI route
- Show recipe, ingredients, shopping estimates, nutrition estimates, confidence guidance, recipe variants, and video-search views
- Estimate rough grocery price ranges and where to find ingredients
- Sign in with Supabase, save recipe scans, reopen scan history, and delete saved scans
- Copy grocery lists, download/share recipes, edit the detected dish name, and check off shopping items
- Show an example response when no AI provider key is configured

## Tech Stack

- Next.js App Router
- React and TypeScript
- CSS Modules
- Gemini API or OpenAI Responses API through `src/app/api/analyze/route.ts`
- Supabase Auth and `snapchef_scans` table for saved scan history

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor. Rerun it after updates to create the optional scan-image storage bucket and policies.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`.
4. Restart the Next.js dev server.
5. Create an account in the app, analyze a food image, then save the recipe.

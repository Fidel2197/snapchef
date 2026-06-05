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

# AllGreeceWeather — Next.js + Supabase migration

This project replaces Hugo with a Next.js App Router application backed by Supabase. The public site keeps the current AllGreeceWeather visual language (dark header, hero, three-column post cards, Greek dates, article pages) while adding a protected admin panel.

## What is included

- Next.js App Router application for Vercel.
- Supabase Auth using cookie-based SSR sessions.
- PostgreSQL `posts` table with draft/published state, tags, dates and views.
- `admin_users` allow-list so logging into Supabase is not enough to gain admin access.
- Row Level Security (RLS) policies for public reads and admin-only writes.
- Public `post-images` Storage bucket with admin-only upload/update/delete.
- Browser-side image compression to WebP before Storage upload (8 MB input limit, roughly 800 KB output target).
- Markdown editor using `react-markdown`, GFM and `rehype-sanitize`; raw HTML is not enabled.
- Legacy Hugo migration script that reads `content/posts/*.md` and preserves existing article Markdown and image paths.
- A simple one-day-per-browser view counter used only for the site's “popular” data; it is not treated as security-sensitive data.

## 1. Install locally

Use Node.js 22 LTS or another currently supported Node release.

```powershell
cd C:\Users\Zac\OneDrive\Desktop
# create/replace the project directory with this project
cd allgreeceweather-next
npm install
```

Create `.env.local` from `.env.example` and fill in the Supabase values.

## 2. Create Supabase

1. Open the Supabase Dashboard and create a new project.
2. Open SQL Editor.
3. Run **all** of `supabase/schema.sql`.
4. Go to Authentication → Providers and keep Email enabled.
5. Disable public sign-up. The site is intended to have one private admin account.
6. In Authentication → Users, create the admin user with your email/password.
7. Copy that user's UUID.
8. In SQL Editor, run:

```sql
insert into public.admin_users (user_id)
values ('PASTE-THE-AUTH-USER-UUID-HERE')
on conflict do nothing;
```

Do not add a public signup form. `admin_users` is deliberately not writable through the web application.

## 3. Supabase keys

In Supabase Project Settings → API, copy:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do **not** put a Supabase secret/service-role key in `.env.local`, client code, GitHub, or Vercel. This project does not need one.

## 4. Run locally

```powershell
npm run dev
```

Open `http://localhost:3000`.

Admin: `http://localhost:3000/admin/login`

After login, `/admin` should show the article list.

## 5. Move the existing Hugo posts

Keep the current Hugo `content/posts` folder in this repository while migrating. The migration script reads it directly.

From the project root:

```powershell
npm run migrate:legacy
```

The script:

- skips `draft: true` posts;
- derives a safe slug from the filename unless `slug` exists;
- preserves the Markdown body;
- copies title, description, image, tags and date;
- converts legacy relative image front-matter paths such as `images/stormcell.jpg` to `/images/stormcell.jpg`;
- fixes common old article links from `/allgreeceweather/posts/...` to `/posts/...`;
- does **not** upload your existing 3 MB images to Supabase, so the initial migration does not consume your Storage quota with duplicate files.

To keep existing images working, copy your current Hugo `static/images` directory to this application's `public/images` directory. The old image URLs will then continue to work.

## 6. Using the admin

1. Sign in at `/admin/login`.
2. Choose **Νέο άρθρο**.
3. Fill in title, slug, description and Markdown.
4. Either paste an image URL or upload an image.
5. Uploaded images are compressed in the browser to WebP before upload.
6. Add comma-separated tags.
7. Leave “Δημοσιευμένο” unchecked for a draft.
8. Check it to publish immediately, or choose a future date/time and publish it when appropriate.

The public site only queries rows whose `published` flag is true and whose `published_at` is not in the future.

## 7. Put the site on Vercel

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Framework preset: Next.js.
4. Build command: `next build` (default is fine).
5. Add these Vercel Environment Variables:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-SUBDOMAIN.vercel.app
```

6. Deploy.
7. In Supabase Authentication → URL Configuration, set the Site URL to your Vercel URL.
8. Add the Vercel URL to any redirect URLs required by your Supabase Auth configuration.

The login page in this project uses password sign-in, so no third-party OAuth setup is required.

## 8. Security model

- No service-role/secret key is required by the application.
- Supabase sessions use secure SSR cookies via `@supabase/ssr`.
- The server checks the current Auth user and then `is_admin()` before every admin read/write operation.
- RLS is enabled on the posts table.
- Anonymous clients can only read already-published posts.
- Anonymous clients cannot insert/update/delete posts.
- `admin_users` is not writable from the app.
- Storage is public-read because article images are public, but only admins can write to the bucket.
- Markdown HTML is not enabled and is sanitized before rendering.
- Slugs, lengths, tags and publication values are validated server-side with Zod; browser validation is only a convenience.
- Uploaded image files are restricted to JPEG/PNG/WebP and compressed before Storage upload.

No web application can honestly be called “bug free” or “guaranteed secure”. This project deliberately avoids the highest-risk shortcuts (service-role keys in the browser, open admin signup, unrestricted database writes, raw HTML rendering, and server-side trust in browser validation), but you should still keep dependencies updated and test before switching the live site.

## 9. Current map/radar code

The database/admin system is isolated from the weather-map code. Move the current Hugo map scripts and assets into `public/` after the site itself is verified. This lets you migrate the CMS without coupling its security model to third-party map data.

## 10. Recommended migration order

Do not delete the working Hugo site first.

1. Create Supabase project and run the SQL.
2. Create the admin user and add its UUID to `admin_users`.
3. Run the new app locally.
4. Copy the old `static/images` to `public/images`.
5. Run the Hugo post migration.
6. Check every article, image and link locally.
7. Deploy to a Vercel preview URL.
8. Test admin login, draft, publish, edit, delete and image upload.
9. Move the maps/radar code.
10. Only after all of that, switch users to the new site.

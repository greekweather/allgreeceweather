# Moving the current repository to this app

The current public repository is still the Hugo site. Do this migration on a new branch first.

## Before changing anything

Create a backup/branch of the working Hugo site.

```powershell
git checkout -b nextjs-supabase-migration
```

Keep the old Hugo `content/posts`, `static/images`, map assets, and `data/top-posts.json` until the Next.js version has been checked.

## Copy into the repository

The files in this package are intended for the repository root. After copying them into the repo:

- keep `content/posts/` temporarily for `npm run migrate:legacy`;
- copy `static/images/` -> `public/images/`;
- copy any map scripts/assets you still need into `public/`;
- do not copy `.env.local` to GitHub;
- do not delete the old Hugo files until the Next.js deployment is verified.

After the first successful Vercel deployment, the Hugo-only directories/files can be removed in a separate commit, including `layouts/`, `hugo.toml`, the old Hugo workflow and no-longer-used Hugo server scripts.

## Old -> new routes

- `/` -> `/`
- `/posts/` -> `/posts`
- `/posts/<slug>/` -> `/posts/<slug>`
- `/maps/` -> `/maps`
- Admin -> `/admin/login` and `/admin`

The article slugs are intentionally preserved from the existing filenames by the migration script, so existing article URLs can be kept consistent where the filename was already the slug.

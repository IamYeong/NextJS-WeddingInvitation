<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project workflow

- Do not run `git commit` or `git push` unless the user explicitly asks for it.

## Project structure

- Keep route pages under route groups. The home page lives under `app/(home)/`; add related page files such as `page.tsx` and `page.module.css` there instead of placing them directly under `app/`.
- Keep reusable UI pieces under `components/`.
- When adding a new component, create a feature directory under `components/` first, then place the component and its colocated files inside it. For example, map-related components belong under `components/map/`.
- Keep component-specific styles next to the component as CSS Modules, such as `ComponentName.module.css`.
- Keep page-specific styles next to the page as CSS Modules, such as `app/(home)/page.module.css`.
- Keep `app/layout.tsx` at the app root as the Root Layout.
- Keep `app/globals.css` at the app root for global styles only. Do not put page-specific or component-specific styles there.
- Keep static assets such as `favicon.ico` under `public/` unless a Next.js app metadata file convention is specifically needed.

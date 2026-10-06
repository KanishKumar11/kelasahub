# KelasaHub — website + admin panel

Next.js 16 (App Router) · MongoDB (Mongoose) · Tailwind CSS 4 · react-pdf

- **Public site** – `/` landing page, `/jobs/[slug]` job pages (with Google for Jobs structured data), `/status` candidate tracker.
- **Admin panel** – `/admin` dashboard, candidates pipeline, jobs, partners, business leads and team.
- **PDFs** – per-candidate application forms (branded with the partner's name, like the Nex-Gen form) and landscape shortlists for partners.
- **Excel** – export uses the same columns and dropdowns as the old *KelasaHub - Applications.xlsx*; import accepts that file too.

## Setup

```bash
cp .env.example .env.local        # then fill in MONGODB_URI, AUTH_SECRET, ADMIN_*
npm install
npm run seed                      # partners, current job openings, first admin user
npm run import:xlsx -- "../KelasaHub - Applications.xlsx"   # optional: bring over the existing sheet
npm run dev                       # http://localhost:3000  ·  admin at /admin
```

No MongoDB installed? `npm run db:dev` starts a local one at `mongodb://127.0.0.1:27027/kelasahub` (data kept in `.devdb/`).

For production use a free **MongoDB Atlas** cluster and set `MONGODB_URI` to its connection string.

## Deploying

Works on Vercel or Netlify (set the base directory to `web/`). Required environment variables:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Database connection string |
| `AUTH_SECRET` | 32+ random characters for signing admin sessions |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin login (created by `npm run seed`, or on first sign-in to an empty database) |
| `NEXT_PUBLIC_SITE_URL` | `https://kelasahub.in` |
| `SMTP_*` (optional) | Enables “Send selection email”; without it the button opens your mail app |

## Where things live

| Path | What |
| --- | --- |
| `src/lib/constants.ts` | Contact details, office/map link, every dropdown list |
| `src/lib/models.ts` | Candidate, Job, Partner, Lead, User schemas |
| `src/app/(site)` | Public pages · `src/components/site` for sections |
| `src/app/admin` | Admin pages and server actions (`actions.ts`) |
| `src/lib/pdf` | PDF templates |
| `src/lib/sheet.ts` | Excel import/export column mapping |

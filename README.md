# C-FPFX Aircraft Manager

Operations, cost tracking, trip logging, and Canadian regulatory compliance
(CARS 604 duty days, CAR 401.05(2) pilot currency) for a single business
aircraft. Built to replace a spreadsheet workbook that had broken formulas and
at least one cost value silently dropped from totals because it was stored as
text.

The aircraft is a settings record, not a hardcoded constant — a second tail
number could be added later without a schema change, but this build is scoped
to one aircraft.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Hand-built shadcn/ui-style components (Radix primitives + `class-variance-authority`) —
  the `shadcn` CLI itself isn't used at build time, only its component patterns
- Postgres via Prisma ORM (driver adapter: `@prisma/adapter-pg`)
- NextAuth (Auth.js) v5 Credentials provider — single-user email/passphrase login
- Vercel Blob for receipt attachments
- `@react-pdf/renderer` for compliance/report PDF export

## Environment variables

Copy `.env.example` to `.env` and fill these in:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string (Vercel Postgres, Neon, or local) |
| `AUTH_SECRET` | Yes | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `ADMIN_EMAIL` | Yes | The email you'll sign in with |
| `ADMIN_PASSWORD_HASH` | Yes | bcrypt hash of your passphrase — see below |
| `BLOB_READ_WRITE_TOKEN` | For receipt uploads | Created automatically when you add a Blob store to the Vercel project; without it the app works fine, uploads just return an error |

Generate the password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" "your-passphrase-here"
```

**Local `.env` gotcha:** Next.js expands `$VAR` references inside `.env`
files. A bcrypt hash is full of literal `$` characters, so escape every `$` as
`\$` in your local `.env` file (e.g. `ADMIN_PASSWORD_HASH="\$2b\$10\$..."`) or
the hash gets silently mangled and login fails with no useful error. This only
applies to `.env` files parsed locally — paste the hash **unescaped** into
Vercel's environment variable UI, which does no expansion.

## Local setup

```bash
npm install
npx prisma migrate dev      # creates the schema against DATABASE_URL
npm run db:seed-base        # seeds the Aircraft record, cost categories, and regulatory defaults
npm run dev
```

Sign in at `/login` with `ADMIN_EMAIL` / your chosen passphrase.

### Importing the historical 2026 records (optional)

If `PFX-trips-2026.csv` and `seed_data/*.csv` are present at the repo root,
`npm run db:import` parses them into real Trip/Passenger/CostEntry records —
see [Data migration](#data-migration) below. This is a one-time historical
backfill, separate from `db:seed-base` (which only creates reference data:
the aircraft, cost categories, and default regulatory thresholds).

## Database provisioning

Any Postgres works. For Vercel:

1. Vercel dashboard → your project → Storage → create a **Postgres** database
   (or bring your own, e.g. [Neon](https://neon.tech)) and connect it —
   Vercel injects `DATABASE_URL` automatically.
2. Add the remaining env vars (`AUTH_SECRET`, `ADMIN_EMAIL`,
   `ADMIN_PASSWORD_HASH`, and `BLOB_READ_WRITE_TOKEN` if using Blob) in
   Project Settings → Environment Variables.
3. After the first deploy, run migrations and the base seed against the
   production database from your machine (point `DATABASE_URL` at it locally,
   or use `vercel env pull`):
   ```bash
   npx prisma migrate deploy
   npm run db:seed-base
   npm run db:import   # optional, only if you have the historical CSVs to import
   ```

`npm run build` runs `prisma generate` first (also wired into `postinstall`),
so `vercel deploy` / a Vercel Git-connected deploy works without extra config
beyond the environment variables above.

## Data migration

`prisma/import-seed-data.ts` (run via `npm run db:import`) imports:

- `PFX-trips-2026.csv` → `Trip`, `Passenger`, `TripPassenger`
- `seed_data/{Nav_Canada,Fuel,Maint,WAA,Fast_Air,RRCC,Gogo}.csv` → itemized
  `CostEntry` rows, one per invoice, coercing every amount to a real decimal
  (including the source bug where at least one amount was stored as text with
  a leading backtick)
- `seed_data/Summary.csv` → monthly aggregate `CostEntry` rows for the five
  Fixed categories (Hangar, Pilot Salary, Insurance, Training, Publications),
  since no itemized ledger exists for those in the source data

It then cross-checks its own computed monthly totals against `Summary.csv`'s
declared totals and writes `import-report.md` (gitignored) with everything
imported, every row skipped or flagged, and every discrepancy found. Rows
that are fully blank are skipped silently; rows with a present-but-unparseable
cost value are flagged, never silently dropped.

Re-running against a database that already has trips or cost entries refuses
by default — pass `--reset` to wipe prior Trip/Passenger/CostEntry data and
re-import (this never touches Pilots, Duty Day logs, or Settings).

Running it against this repo's included historical data surfaces several
pre-existing discrepancies between the vendor invoice ledgers and the
original spreadsheet's Summary sheet (the Summary sheet's own monthly figures
drift from its itemized source data in a few categories) — this is expected
and is exactly what the cross-check is for. See `import-report.md` after
running it.

## Regulatory disclaimers

The Duty Days and Currency modules encode CARS Subpart 604 and CAR 401.05(2)
thresholds as **configurable values** (Settings → Regulatory thresholds), not
hardcoded constants, because these figures are amended from time to time.
Both modules show an in-app note to this effect. This tool is an operational
aid, not a substitute for checking the current regulatory text.

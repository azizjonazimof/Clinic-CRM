# Clinic CRM

Fullstack medical CRM platform with role-based portals for Super Admin, Clinic Admin, and Doctor users.

Start with [INSTRUCTIONS.md](INSTRUCTIONS.md). The prompt groups live in [docs/prompts](docs/prompts).

## Implementation Order

The project was started in the requested order:

1. Database design: `prisma/schema.prisma`
2. Frontend pages and role layouts: `src/app`
3. Backend/API contracts and handlers: `src/app/api`, `src/lib`, `src/server`

## Local Setup

Install Node.js, then run:

```bash
npm install
docker compose up -d postgres
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Production Setup

Set environment variables from `.env.production.example`, then run:

```bash
npm ci
npm run db:generate
npx prisma migrate deploy
npm run build
npm run start
```

For first-time demo data after migrations:

```bash
npm run db:seed
```

Seeded accounts:

- `super@medcrm.local` / `Password123`
- `admin@medcrm.local` / `Password123`
- `doctor@medcrm.local` / `Password123`

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

# Production Deployment

## Required Environment

Set these variables in the hosting provider:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/medical_crm?schema=public"
JWT_SECRET="replace-with-at-least-32-random-characters"
NODE_ENV="production"
```

## Release Commands

```bash
npm ci
npm run env:check
npm run db:generate
npm run db:deploy
npm run build
npm run start
```

## Health Checks

Use `/api/health` for process health and `/api/ready` for database readiness.

## First Admin User

For a fresh installation, run the seed script once:

```bash
npm run db:seed
```

Then replace the seeded passwords immediately from the database or a future admin password screen.

## Security Notes

- Keep `JWT_SECRET` private and rotate it if it is exposed.
- Never commit `.env`.
- Use HTTPS in production.
- Use managed Postgres backups before applying migrations.

# API Contracts

All APIs return:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Errors return:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": []
  }
}
```

The current implementation exposes role API handlers backed by Prisma. They preserve the URL contract from `INSTRUCTIONS.md`, enforce JWT authentication, apply role permissions, apply clinic/branch scope checks, validate request payloads, and write audit logs for mutations.

## Role APIs

- `/api/super-admin/*`
- `/api/clinic-admin/*`
- `/api/doctor/*`

## Shared APIs

- `/api/me`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/refresh`
- `/api/auth/forgot-password`
- `/api/auth/reset-password`
- `/api/lookups/branches`
- `/api/lookups/doctors`
- `/api/lookups/services`
- `/api/lookups/products`
- `/api/lookups/sources`

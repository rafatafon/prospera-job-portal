# Row Level Security Policies

## Access Tiers

1. **anon** - unauthenticated public users
2. **company** - authenticated users with role='company' and a company_id
3. **admin** - authenticated users with role='admin'

## Policy Matrix

### profiles

| Operation | anon | company | admin |
|-----------|------|---------|-------|
| SELECT | all | all | all |
| INSERT | - | own id (via trigger) | - |
| UPDATE | - | own (no role change) | any |
| DELETE | - | - | any |

### companies

| Operation | anon | company | admin |
|-----------|------|---------|-------|
| SELECT | active only | active + own | all |
| INSERT | - | - | yes |
| UPDATE | - | own company | any |
| DELETE | - | - | any |

### jobs

| Operation | anon | company | admin |
|-----------|------|---------|-------|
| SELECT | published + active co. | published + own co. drafts | all |
| INSERT | - | own company | any |
| UPDATE | - | own company | any |
| DELETE | - | own company | any |

## Performance Patterns

All policy checks wrap helper functions in `(select ...)` for initPlan optimization:
- `(select public.is_admin())`
- `(select public.get_my_company_id())`
- `(select auth.uid())`

Security definer helpers bypass RLS to avoid infinite recursion when policies on other tables check user role from profiles.

## Known Advisories

- **Multiple permissive policies**: Several tables have separate company + admin policies for the same operation. This is a readability trade-off accepted for MVP. Can be consolidated into single policies with OR conditions later.
- **Company creation**: Admin-only for MVP. Self-service company registration is a V2 feature.

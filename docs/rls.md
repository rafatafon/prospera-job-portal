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

### applications

| Operation | anon | user (role='user') | company | admin |
|-----------|------|--------------------|---------|-------|
| SELECT | - | - | own company's jobs only (app-level filter) | all |
| INSERT | yes (public form) | yes | - | - |
| UPDATE | - | - | - | any |
| DELETE | - | - | - | any |

**Note:** Application-level filtering (`jobs.company_id = profile.company_id`) is enforced in the dashboard query. RLS policies should be added as defense-in-depth in a future migration.

### candidates

| Operation | anon | user (role='user') | company | admin |
|-----------|------|--------------------|---------|-------|
| SELECT | - | own record | visible only (`is_visible = true`) | all |
| INSERT | - | own record | - | - |
| UPDATE | - | own record | - | - |
| DELETE | - | own record | - | any |

**Policies:**
- `candidates_select_own` -- SELECT for authenticated where `user_id = auth.uid()`
- `candidates_select_company` -- SELECT for authenticated where `get_my_role() = 'company' AND is_visible = true`
- `candidates_select_admin` -- SELECT for authenticated where `is_admin()`
- `candidates_insert_own` -- INSERT for authenticated where `user_id = auth.uid() AND get_my_role() = 'user'`
- `candidates_update_own` -- UPDATE for authenticated where `user_id = auth.uid()` (USING + WITH CHECK)
- `candidates_delete_own` -- DELETE for authenticated where `user_id = auth.uid()`
- `candidates_delete_admin` -- DELETE for authenticated where `is_admin()`

**Test Scenarios:**

| Scenario | Expected | Policy That Governs |
|----------|----------|---------------------|
| Anon reads any candidate | DENY | (no policy grants) |
| User reads own candidate profile | ALLOW | candidates_select_own |
| User reads another user's profile | DENY | (policy filters by user_id) |
| Company reads visible candidate | ALLOW | candidates_select_company |
| Company reads hidden candidate (is_visible=false) | DENY | (policy requires is_visible=true) |
| Admin reads any candidate | ALLOW | candidates_select_admin |
| User inserts own profile | ALLOW | candidates_insert_own |
| User inserts profile for another user_id | DENY | (WITH CHECK filters by auth.uid()) |
| Company user tries to insert candidate | DENY | (WITH CHECK requires role='user') |
| User updates own profile | ALLOW | candidates_update_own |
| User updates another user's profile | DENY | (USING filters by user_id) |
| User deletes own profile | ALLOW | candidates_delete_own |
| User deletes another user's profile | DENY | (USING filters by user_id) |
| Admin deletes any profile | ALLOW | candidates_delete_admin |

### storage.objects (company-logos bucket)

| Operation | anon | company | admin |
|-----------|------|---------|-------|
| SELECT | yes (public bucket) | yes (public bucket) | yes |
| INSERT | - | - | yes (`is_admin()`) |
| UPDATE | - | - | yes (`is_admin()`) |
| DELETE | - | - | yes (`is_admin()`) |

**Policies:**
- `Public can read company logos` -- SELECT for anyone where `bucket_id = 'company-logos'`
- `Admins can manage company logos` -- ALL for admins where `bucket_id = 'company-logos' AND is_admin()`

### storage.objects (candidate-photos bucket)

| Operation | anon | authenticated (own files) | admin |
|-----------|------|---------------------------|-------|
| SELECT | yes (public bucket) | yes (public bucket) | yes |
| INSERT | - | own path (`{user_id}/*`) | own path |
| UPDATE | - | own path (`{user_id}/*`) | own path |
| DELETE | - | own path (`{user_id}/*`) | own path |

**Policies:**
- `Public can read candidate photos` -- SELECT for anon + authenticated where `bucket_id = 'candidate-photos'`
- `Users can upload own candidate photos` -- INSERT where path starts with own user_id
- `Users can update own candidate photos` -- UPDATE where path starts with own user_id
- `Users can delete own candidate photos` -- DELETE where path starts with own user_id

### storage.objects (candidate-cvs bucket)

| Operation | anon | user (own files) | company | admin |
|-----------|------|------------------|---------|-------|
| SELECT | - | own path | all CVs | all CVs |
| INSERT | - | own path (`{user_id}/*`) | - | - |
| UPDATE | - | own path (`{user_id}/*`) | - | - |
| DELETE | - | own path (`{user_id}/*`) | - | - |

**Policies:**
- `Companies and admins can read candidate CVs` -- SELECT where `get_my_role() = 'company' OR is_admin()`
- `Users can read own candidate CVs` -- SELECT where path starts with own user_id
- `Users can upload own candidate CVs` -- INSERT where path starts with own user_id
- `Users can update own candidate CVs` -- UPDATE where path starts with own user_id
- `Users can delete own candidate CVs` -- DELETE where path starts with own user_id

## Performance Patterns

All policy checks wrap helper functions in `(select ...)` for initPlan optimization:
- `(select public.is_admin())`
- `(select public.get_my_company_id())`
- `(select auth.uid())`

Security definer helpers bypass RLS to avoid infinite recursion when policies on other tables check user role from profiles.

## Known Advisories

- **Multiple permissive policies**: Several tables have separate company + admin policies for the same operation. This is a readability trade-off accepted for MVP. Can be consolidated into single policies with OR conditions later.
- **Company creation**: Admin-only for MVP. Self-service company registration is a V2 feature.

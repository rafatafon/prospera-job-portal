# Database Schema

Supabase project: `pqmcymetprozeqrpmjud` (us-east-1)

## Enums

| Enum | Values |
|------|--------|
| `user_role` | user, company, admin |
| `employment_type` | full_time, part_time, contract |
| `job_status` | draft, published, archived |
| `candidate_availability` | actively_looking, open_to_offers, not_available |

## Tables

### profiles
Extends `auth.users`. Auto-created via `handle_new_user` trigger.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | FK -> auth.users ON DELETE CASCADE |
| role | user_role | default 'user' |
| company_id | uuid nullable | FK -> companies ON DELETE SET NULL |
| full_name | text | from user_metadata at signup |
| email | text nullable | copied from auth.users on signup |
| avatar_url | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-updated via trigger |

### companies

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| name | text NOT NULL | min 2 chars |
| slug | text UNIQUE | lowercase-hyphen format, regex validated |
| logo_url | text | |
| website | text | |
| description | text | |
| rpn | text nullable | Registro Patronal Nacional — unique business identifier for RPN verification |
| prospera_entity_id | text nullable | Prospera platform entity ID linked during verification |
| registered_by | uuid nullable | FK -> auth.users ON DELETE SET NULL — user who registered this company |
| is_active | boolean | default true, admin moderation toggle |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-updated via trigger |

### jobs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| company_id | uuid NOT NULL | FK -> companies ON DELETE CASCADE |
| title | text NOT NULL | min 3 chars |
| description | text NOT NULL | min 10 chars |
| location | text | city name |
| employment_type | employment_type | default 'full_time' |
| status | job_status | default 'draft' |
| published_at | timestamptz | set when status -> published |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-updated via trigger |

### candidates
Open Talent profiles -- users who want to be discovered by companies.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid NOT NULL UNIQUE | FK -> auth.users ON DELETE CASCADE |
| full_name | text NOT NULL | |
| headline | text | short professional tagline |
| bio | text | longer description |
| location | text | city/region |
| photo_url | text | public URL from candidate-photos bucket |
| cv_path | text | storage path in candidate-cvs bucket ({user_id}/filename) |
| skills | text[] | default '{}', free-text skill tags |
| years_of_experience | integer | |
| availability | candidate_availability | default 'actively_looking' |
| linkedin_url | text | |
| is_visible | boolean NOT NULL | default true, hides profile from company search when false |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-updated via trigger |

## Indexes

| Index | Table | Columns |
|-------|-------|---------|
| idx_jobs_status | jobs | status |
| idx_jobs_company_id | jobs | company_id |
| idx_jobs_published_at | jobs | published_at DESC NULLS LAST |
| idx_jobs_location | jobs | location |
| idx_jobs_status_published_at | jobs | (status, published_at DESC NULLS LAST) |
| idx_profiles_company_id | profiles | company_id |
| idx_candidates_user_id | candidates | user_id |
| idx_candidates_availability | candidates | availability |
| idx_candidates_is_visible | candidates | is_visible |
| idx_companies_rpn_unique | companies | rpn (UNIQUE, partial WHERE rpn IS NOT NULL) |
| idx_companies_prospera_entity_id | companies | prospera_entity_id (partial WHERE IS NOT NULL) |

## Helper Functions (security definer)

| Function | Returns | Purpose |
|----------|---------|---------|
| `get_my_role()` | user_role | Current user's role from profiles |
| `is_admin()` | boolean | Whether current user is admin |
| `get_my_company_id()` | uuid | Current user's company_id from profiles |
| `set_updated_at()` | trigger | Auto-sets updated_at on UPDATE |
| `handle_new_user()` | trigger | Auto-creates profile on auth.users INSERT (copies id, full_name, email) |
| `register_company(p_user_id, p_name, p_slug, p_rpn, p_entity_id)` | uuid | Atomically creates company from RPN verification, resolves slug conflicts, links user as company owner |

## Storage Buckets

| Bucket | Public | Read Policy | Write Policy |
|--------|--------|-------------|--------------|
| `application-documents` | false | Admins + company owners of the related job | Anon (via public form) |
| `company-logos` | true | Anyone (public bucket) | Admins only (`is_admin()`) |
| `candidate-photos` | true | Anyone (public bucket) | Own files only (`{user_id}/*`) |
| `candidate-cvs` | false | Company users + admins + own files | Own files only (`{user_id}/*`) |

## Migrations Applied

1. `create_enums_and_helpers` - enums + trigger fn + security definer helpers
2. `create_tables` - all 3 tables + indexes + triggers
3. `create_rls_policies` - RLS enabled + all policies
4. `fix_set_updated_at_search_path` - set search_path on set_updated_at
5. `create_applications_table` - applications table for job submissions
6. `create_applications_storage_bucket` - storage bucket for application documents
7. `fix_applications_storage_rls_policy` - fix RLS on application documents
8. `add_work_mode_to_jobs` - work_mode enum (on_site, remote, hybrid) on jobs
9. `add_email_to_profiles` - email column on profiles, backfill from auth.users, updated trigger
10. `create_company_logos_bucket` - public storage bucket for company logos with admin-only writes
11. `create_candidates_table_and_storage` - candidates table, candidate_availability enum, indexes, RLS, candidate-photos + candidate-cvs storage buckets
12. `add_company_self_registration` - rpn, prospera_entity_id, registered_by columns on companies + indexes + register_company() function

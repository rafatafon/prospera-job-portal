# Database Schema

Supabase project: `pqmcymetprozeqrpmjud` (us-east-1)

## Enums

| Enum | Values |
|------|--------|
| `user_role` | user, company, admin |
| `employment_type` | full_time, part_time, contract |
| `job_status` | draft, published, archived |

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

## Indexes

| Index | Table | Columns |
|-------|-------|---------|
| idx_jobs_status | jobs | status |
| idx_jobs_company_id | jobs | company_id |
| idx_jobs_published_at | jobs | published_at DESC NULLS LAST |
| idx_jobs_location | jobs | location |
| idx_jobs_status_published_at | jobs | (status, published_at DESC NULLS LAST) |
| idx_profiles_company_id | profiles | company_id |

## Helper Functions (security definer)

| Function | Returns | Purpose |
|----------|---------|---------|
| `get_my_role()` | user_role | Current user's role from profiles |
| `is_admin()` | boolean | Whether current user is admin |
| `get_my_company_id()` | uuid | Current user's company_id from profiles |
| `set_updated_at()` | trigger | Auto-sets updated_at on UPDATE |
| `handle_new_user()` | trigger | Auto-creates profile on auth.users INSERT (copies id, full_name, email) |

## Storage Buckets

| Bucket | Public | Read Policy | Write Policy |
|--------|--------|-------------|--------------|
| `application-documents` | false | Admins + company owners of the related job | Anon (via public form) |
| `company-logos` | true | Anyone (public bucket) | Admins only (`is_admin()`) |

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

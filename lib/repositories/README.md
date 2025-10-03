# Repository Layer

This folder centralizes data-access helpers that wrap Supabase PostgREST queries and Storage operations. Modules are grouped by domain (`company`, `user`, `documents`, `events`, `notifications`, `paychecks`) with storage-specific helpers co-located for upload/download flows.

- `companyRepository`, `userRepository`, `documentsRepository`, `eventsRepository`, `notificationsRepository`, `paychecksRepository` expose CRUD functions that return typed entities from `types/db`.
- `documentStorageRepository`, `paychecksStorageRepository`, `avatarStorageRepository` provide canonical path builders plus helper functions for uploads, signed URLs, and cleanup across Storage buckets (`documents`, `paychecks`, `avatars`).
- Shared adapters (`supabaseAdapter`, `supabaseStorage`) normalize Supabase responses and surface errors through `RepositoryError` so consumers can handle failures consistently.

When wiring screens or hooks, prefer these helpers over inline Supabase calls to keep tenant-scoping (`ensureCompanyScope`) and error handling consistent.

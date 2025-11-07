# Schema Index

Create one subdirectory per domain schema (e.g., `documents/`, `payroll/`). Inside each directory, document the schema in an uppercase `<SCHEMA>.md` file (e.g., `DOCUMENTS.md`, `PAYROLL.md`) that:

- Summarize the domain purpose and scope.
- Provide a Mermaid diagram showing relationships to other schemas and shared tables.
- Describe database tables with column metadata, constraints, defaults, and indexes.
- Capture RLS policies, triggers, and edge functions.
- Outline lifecycle flows plus open questions or follow-up tasks.

Use `user/USER.md` as the reference pattern for depth and formatting.

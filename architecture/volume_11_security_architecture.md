# Volume 11: Security Architecture

This document defines the security boundaries, data protection controls, authentication standards, threat vectors, and compliance parameters for Tiptop Virtual Academy 2.0.

## 1. Security Architecture Boundary Model

TVA implements a Zero-Trust security approach. No client is trusted by default. All data requests must validate session signatures, resource access parameters, and Row-Level Security parameters.

```mermaid
graph TD
    User_Session["User Client Session (JWT Token)"] --> API_Route["API Route Gate"]

    subgraph Security_Perimeter [Security Perimeter Layers]
        API_Route -->|Check Session Signature| JWT_Validator["JWT Signature Validator"]
        JWT_Validator -->|Pass| RBAC_Check["Role-Based Access Checker"]
        RBAC_Check -->|Pass| DB_Connection["Database Connection Gate"]
        DB_Connection -->|Apply RLS Filters (auth.uid)| PostgreSQL_RLS["PostgreSQL RLS Gate"]
    end

    PostgreSQL_RLS -->|Filtered Rows| Query_Result["Authorized Data Output"]
    JWT_Validator -->|Failed Token| Reject_401["Return 401 Unauthorized"]
    RBAC_Check -->|Failed Permission| Reject_403["Return 403 Forbidden"]
    PostgreSQL_RLS -->|Zero Rows Match| Empty_404["Return 404 Not Found"]
```

---

## 2. Authentication & Session Management

- **Provider**: Supabase Auth (JWT).
- **Session Duration**: Access tokens expire after `1 hour`. Refresh tokens are processed using secure, HTTP-only, SameSite cookies to mitigate Cross-Site Scripting (XSS).
- **Session Rotation**: The system enforces automatic refresh token rotation. If an old refresh token is reused, the session and all downstream family accounts are signed out immediately to prevent token hijacking.
- **Multi-Factor Authentication (MFA)**: Enforced for administrative and executive roles. Optional for teachers and parents.

---

## 3. Data Protection and Encryption Standards

- **In Transit**: All connections must enforce TLS 1.3. Unencrypted HTTP (Port 80) calls redirect to HTTPS.
- **At Rest**:
  - Database: All data volumes in Supabase are encrypted using AES-256 transparent data encryption.
  - Storage: Files in Supabase Storage buckets are encrypted in transit and at rest.
  - Sensitive Fields: Sensitive identifiers (e.g. parent phone numbers, physical addresses) are encrypted at the schema layer using the PostgreSQL `pgcrypto` extension using symmetric keys stored in Supabase Vault.

---

## 4. Audit Log Specifications

All mutations (insert, update, delete) on key tables (enrollments, user roles, grades, billing ledgers) trigger audit records stored in the `audit_logs` table:

```sql
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid NOT NULL,          -- User who initiated the change
    action_type varchar(50) NOT NULL, -- INSERT/UPDATE/DELETE
    target_table varchar(100) NOT NULL,
    record_id uuid NOT NULL,
    old_data jsonb,                  -- Null on INSERT
    new_data jsonb,                  -- Null on DELETE
    ip_address inet,
    created_at timestamp DEFAULT now()
);
```

- **Immutability**: The `audit_logs` table has only `INSERT` permissions enabled. `UPDATE` and `DELETE` commands on this table are strictly blocked by database rules.

---

## 5. Threat Modeling & Risk Matrix

| Threat Vector | Mitigation Strategy | Severity |
| :--- | :--- | :--- |
| **SQL Injection (SQLi)** | Using Prisma ORM parameters to sanitize inputs automatically. | High |
| **Cross-Site Scripting (XSS)** | Enforcing Content Security Policies (CSP), sanitizing HTML inputs, and utilizing HTTP-only cookie parameters. | High |
| **Privilege Escalation** | Implementing Row-Level Security checks and double-checking roles in Server Actions independently. | Critical |
| **Credential Stuffing** | Rate-limiting auth routes, monitoring IP volumes, and requiring MFA for administration paths. | Medium |
| **GDPR / Compliance Breaches** | Enforcing "Right to be Forgotten" queries that scrub profile records while keeping anonymous financial data. | High |

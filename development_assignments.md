# Tiptop Virtual Academy 2.0 - Development Execution Task Assignments

This document maps the [Master Implementation Roadmap Work Orders](file:///c:/Users/aforl/Desktop/TVA/implementation_roadmap.md) to the specialized JBK Technologies departments and roles for execution.

---

## 1. Project Resource Allocation Matrix

| Work Order ID | Task Name | Primary Assigned Role | Supporting Role(s) | Review / Sign-off Role |
| :--- | :--- | :--- | :--- | :--- |
| **TVA-WO-001** | Foundation Setup | `software-engineer` | `process-optimizer` | `startup-cto` |
| **TVA-WO-007** | Curriculum Ingestion | `software-engineer` | `education-architect` | `JBK-Core (CEO)` |
| **TVA-WO-002** | Identity & Access | `software-engineer` | `security-architect` | `security-architect` |
| **TVA-WO-003** | Admissions & Stripe | `software-engineer` | `product-engineer` | `JBK-Core (CEO)` |
| **TVA-WO-004** | Academic Core | `software-engineer` | None | `startup-cto` |
| **TVA-WO-005** | Google Sync Engine | `software-engineer` | `startup-cto` | `startup-cto` |
| **TVA-WO-006** | AI Faculty Orchestrator | `software-engineer` | `frontend-designer` | `JBK-Core (CEO)` |

---

## 2. Detailed Task Breakdown & Handoff Criteria

### 2.1 TVA-WO-001: Foundation Setup
- **Objective**: Establish the development workspace baseline.
- **Tasks for `software-engineer`**:
  - Initialize Next.js project using App Router, TypeScript, and Tailwind CSS.
  - Setup ESLint rules and TypeScript configuration parameters.
  - Configure the local Supabase emulator, database schema, and migration files.
- **Tasks for `process-optimizer`**:
  - Setup build configuration scripts, package dependencies, and GitHub Action workflows.
- **Handoff Gate**: `npm run build` compiles with zero warnings; database migrations seed clean schemas.

### 2.2 TVA-WO-007: Curriculum Package Ingestion Service
- **Objective**: Implement the central curriculum parser.
- **Tasks for `software-engineer`**:
  - Implement `/lib/curriculum/` service utilities.
  - Create database schema loaders for subjects, units, and learning outcomes.
- **Tasks for `education-architect`**:
  - Review the British Curriculum JSON manifest structures for syllabus accuracy.
- **Handoff Gate**: Execution test loads the manifest and validates database entry mapping.

### 2.3 TVA-WO-002: Identity & Access Management
- **Objective**: Secure access control structures.
- **Tasks for `software-engineer`**:
  - Implement Supabase Auth routes.
  - Write JWT profile lookup utilities mapping student-parent relationships.
- **Tasks for `security-architect`**:
  - Review database Row-Level Security (RLS) policies.
  - Conduct privilege escalation tests on API routes.
- **Handoff Gate**: 100% of user data endpoints gate requests using `auth.uid()` parameter.

### 2.4 TVA-WO-003: Admissions and Stripe Checkout
- **Objective**: Payment gateway checkout pipelines.
- **Tasks for `software-engineer`**:
  - Build multi-step admissions forms and integrate Stripe Elements.
  - Implement discount calculations (sibling and referral credits).
- **Tasks for `product-engineer`**:
  - Verify guided enrollment steps align with user journey blueprints.
- **Handoff Gate**: Sibling discount logic computes calculations correctly; successful checkout webhook emits `student.enrolled` event.

### 2.5 TVA-WO-005: Google Sync Engine
- **Objective**: Google Workspace synchronization worker.
- **Tasks for `software-engineer`**:
  - Implement asynchronous outbox execution routines.
  - Build HTTP API integrations for Google Directory, Calendar, and Classroom.
- **Tasks for `startup-cto`**:
  - Verify exponential backoff and circuit breaker configurations.
- **Handoff Gate**: Outbox trigger syncs account and returns Meet links in under 5 seconds.

### 2.6 TVA-WO-006: Academy Intelligence Orchestrator
- **Objective**: AI Faculty engines.
- **Tasks for `software-engineer`**:
  - Configure Supabase `pgvector` parameters.
  - Implement context resolution pipelines for LLM adapters.
- **Tasks for `frontend-designer`**:
  - Style the chatbot overlay to align with the visual design guide.
- **Handoff Gate**: Guardrails block prompt injection attempts; safeguarding alerts escalate to the database.

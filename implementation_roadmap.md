# Tiptop Virtual Academy 2.0 - Master Implementation Roadmap

This document transforms the approved TVA 2.0 Engineering Architecture and the [British Curriculum Package Specifications](file:///c:/Users/aforl/Desktop/TVA/curriculum_map.md) into a structured, executable implementation programme.

---

## 1. Master Build Sequence

The curriculum package functions as a foundational system component. The build sequence requires that the curriculum data structures and schemas are established directly after the base database structure is initialized, blocking downstream student or parent modules.

```
[Phase 1: Foundation Setup]
           │
           ▼
[Phase 2: Curriculum Package Ingestion Service]
           │
           ▼
[Phase 3: Identity & Access Management]
           │
           ▼
[Phase 4: Admissions & Payments]
           │
           ▼
[Phase 5: Academic Delivery & Cohorts]
           │
           ▼
[Phase 6: Assessment & Grading]
           │
           ▼
[Phase 7: Google Workspace Integration Engine]
           │
           ▼
[Phase 8: Academy Intelligence Layer]
           │
           ▼
[Phase 9: Client Portal Portlets (Student, Parent, Teacher)]
           │
           ▼
[Phase 10: Executive Control Center & Telemetry]
```

### Build Sequence Rationale:
- **Phase 1 to Phase 2**: The database outbox and transaction tables must exist before the curriculum service schema is initialized.
- **Phase 2 to Phase 3**: User roles and profiles must be mapped to valid academic years and subjects loaded from the curriculum package.
- **Phase 3 to Phase 4**: Admissions registration forms must query pricing models and program catalogs directly from the active curriculum manifest.
- **Phase 4 to Phase 5**: Cohorts and classes must map to valid curriculum years and subjects.
- **Phase 5 to Phase 6**: Grading rubrics depend on curriculum learning outcomes defined in [Volume 6](file:///c:/Users/aforl/Desktop/TVA/curriculum_package/volume_6_assessment_framework.md).
- **Phase 6 to Phase 7**: Google Classroom provisioning relies on curriculum course mappings.
- **Phase 7 to Phase 8**: AI companions use curriculum progress maps to determine Socratic responses.
- **Phase 8 to Phase 9**: Dashboards require AI API services to be stable.
- **Phase 9 to Phase 10**: Executive KPIs require structured data from active portfolios and reports.

---

## 2. Dependency Matrix

No domain should begin development until all blocking prerequisites are resolved:

| Domain | Prerequisites (Must Exist) | Blocking Dependencies | Optional Dependencies | Shared Services Utilized | Risks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Curriculum** | Database Foundation | None | Manifest Schemas | `CurriculumService` | Manifest schema mismatches |
| **Identity** | Curriculum Package | Supabase Auth API | None | `SessionResolver` | Token hijacking, CSRF |
| **Admissions** | Identity, Curriculum | Stripe API | Referral Codes | `PricingEngine` | Payment failures, checkout drops |
| **Learning** | Curriculum, Identity | Google Meet | Calendar Sync | `ScheduleValidator` | Schedule clashes, timezone errors |
| **Assessment** | Learning, Curriculum | None | Certificate Service | `GradingRubric` | Grade tampering, file upload leaks |
| **Finance** | Admissions, Curriculum | Stripe API | Sibling Discount | `LedgerService` | Invoice math anomalies, refund voids |
| **AI Faculty** | Curriculum, Assessment | Gemini API | Vector DB | `RAGService` | Prompt injections, hallucinated grades |
| **Google Sync** | Identity, Learning, Curriculum | Google APIs | Drive API | `SyncQueue` | Rate limit blocks, out-of-sync profiles |

---

## 3. Work Order Breakdown

### TVA-WO-001: Foundation Setup
- **Objective**: Establish development environments, database migration tools, and design token classes.
- **Scope**: Configure Next.js baseline, Tailwind tokens, Supabase database outbox schema, and Docker configs.
- **Inputs**: [TVA-TECH-001](file:///c:/Users/aforl/Desktop/TVA/Materials/TVA-TECH-001.md), [Visual Language](file:///c:/Users/aforl/Desktop/TVA/Materials/Visual%20Language.md).
- **Outputs**: Baseline Next.js compilation, `supabase/migrations/` structure.
- **Dependencies**: None.
- **Acceptance Criteria**: `npm run build` executes without error; database initializes with outbox tables.
- **Estimated Complexity**: Low (1 Sprint).

### TVA-WO-007: Curriculum Package Ingestion Service
- **Objective**: Load, parse, and validate curriculum package manifests.
- **Scope**: Setup curriculum schemas, parsing code, and database schema loaders for subjects, units, and learning outcomes.
- **Inputs**: [Volume 1: Curriculum Package Manifest](file:///c:/Users/aforl/Desktop/TVA/curriculum_package/volume_1_manifest.md), [Volume 3: Academic Structure](file:///c:/Users/aforl/Desktop/TVA/curriculum_package/volume_3_academic_structure.md).
- **Outputs**: `/lib/curriculum/` service utilities, database tables for curriculum objects.
- **Dependencies**: TVA-WO-001.
- **Acceptance Criteria**: Running `loadCurriculumPackage` parses `pkg-uk-british-curriculum-v2` and seeds all academic levels in under 2 seconds.
- **Estimated Complexity**: Medium (1 Sprint).

### TVA-WO-002: Identity & Access Management
- **Objective**: Implement user sign-on, profile structures, and Row-Level Security parameters.
- **Scope**: Build JWT sign-on, parent-child profile links, and base PostgreSQL RLS scripts.
- **Inputs**: [Volume 11: Security Architecture](file:///c:/Users/aforl/Desktop/TVA/architecture/volume_11_security_architecture.md).
- **Outputs**: Sign-in API routes, profile tables, and RLS policies.
- **Dependencies**: TVA-WO-007.
- **Acceptance Criteria**: Users are mapped to valid academic years; unauthorized access to profile records returns HTTP 401.
- **Estimated Complexity**: Medium (2 Sprints).

### TVA-WO-003: Admissions and Stripe Checkout
- **Objective**: Implement the guided enrollment process and tuition payment processing.
- **Scope**: Multi-step registration forms, Stripe API payment gateways, and tuition credit records.
- **Inputs**: [Product pricing.md](file:///c:/Users/aforl/Desktop/TVA/Materials/Product%20pricing.md).
- **Outputs**: Enrollment APIs, payment processing forms, and transaction invoices.
- **Dependencies**: TVA-WO-002.
- **Acceptance Criteria**: Form correctly computes 10% discount on second child tuition based on curriculum tiers; successful payments insert records into the transaction ledger and emit `student.enrolled` events.
- **Estimated Complexity**: High (3 Sprints).

### TVA-WO-004: Academic Core & Schedule
- **Objective**: Implement class cohorts, weekly calendars, and scheduling capabilities.
- **Scope**: Class registry, lesson templates, schedules, and timezone handlers.
- **Inputs**: [Volume 4: Domain Architecture](file:///c:/Users/aforl/Desktop/TVA/architecture/volume_4_domain_architecture.md).
- **Outputs**: Scheduling API services and calendar database structures.
- **Dependencies**: TVA-WO-003.
- **Acceptance Criteria**: Cohorts map to curriculum subject codes; prevents double-booking a teacher during identical lesson frames.
- **Estimated Complexity**: Medium (2 Sprints).

### TVA-WO-005: Outbox Event & Google Sync Engine
- **Objective**: Process asynchronous outbox actions to sync student data to Google Workspace.
- **Scope**: Outbox workers, exponential backoff handler, Directory API client, and Classroom enrollment syncs.
- **Inputs**: [TVA-INT-001](file:///c:/Users/aforl/Desktop/TVA/Materials/TVA-INT-001.md), [Volume 11: Google Classroom Mapping](file:///c:/Users/aforl/Desktop/TVA/curriculum_package/volume_11_google_classroom_mapping.md).
- **Outputs**: Integration worker daemon and mapping registers.
- **Dependencies**: TVA-WO-004.
- **Acceptance Criteria**: Sync worker reads `student.enrolled` event, provisions Google Identity, creates Classroom courses based on curriculum structures, and inserts record mapping in under 5 seconds.
- **Estimated Complexity**: High (3 Sprints).

### TVA-WO-006: Academy Intelligence Orchestrator
- **Objective**: Setup prompt templates, vector databases, and AI Faculty endpoints.
- **Scope**: Supabase `pgvector` config, system prompt router, and safety guardrails.
- **Inputs**: [Volume 8: Intelligence Architecture](file:///c:/Users/aforl/Desktop/TVA/architecture/volume_8_intelligence_architecture.md), [Volume 10: AI Curriculum Intelligence](file:///c:/Users/aforl/Desktop/TVA/curriculum_package/volume_10_ai_curriculum_intelligence.md).
- **Outputs**: Prompt templates, chatbot APIs, and safety logs.
- **Dependencies**: TVA-WO-005.
- **Acceptance Criteria**: AI companion queries student learning progress maps from Volume 5; the AI interface escalates immediately when a prompt matches safety violation rules.
- **Estimated Complexity**: High (3 Sprints).

---

## 4. Major Project Milestones

### Milestone 1: Platform Foundation & Curriculum Loaded
- **Measurable Criteria**: Baseline Next.js server compiles; curriculum package loads and parses the British Curriculum manifest; authentication API correctly issues JWT tokens.

### Milestone 2: Admissions & Payments Active
- **Measurable Criteria**: Guided registration form handles pricing calculations (discounts and referral credits); Stripe webhook updates invoices to `PAID` status.

### Milestone 3: Academic Delivery Ready
- **Measurable Criteria**: Teachers can schedule learning cohorts; Calendar events create Google Meet meeting links; Attendance logged in database tables.

### Milestone 4: Integration Engine Stable
- **Measurable Criteria**: 100% of outbox events are processed; Directory and Classroom sync logs record zero sync delays; Google Classroom courses are generated dynamically matching curriculum definitions.

### Milestone 5: AI Faculty Active
- **Measurable Criteria**: Prompt guardrails prevent prompt injection attempts; Socratic learning paths are active for the Learning Companion; Safeguarding alerts trigger pastoral notifications in real-time.

---

## 5. Domain Implementation Order

1. **Identity & Security**: Target 2 Sprints. Integrates with Supabase Auth.
2. **Curriculum Package Loader**: Target 1 Sprint. Loader scripts, schema validations.
3. **Admissions & Finance**: Target 3 Sprints. Integrates with Stripe.
4. **Learning & Cohorts**: Target 2 Sprints. Timezone checks, calendar algorithms.
5. **Google Workspace Sync**: Target 3 Sprints. REST OAuth clients, sync workers.
6. **Assessment**: Target 2 Sprints. Files upload to private storage buckets.
7. **Academy Intelligence**: Target 3 Sprints. Vector queries, LLM templates.

---

## 6. AI Rollout Plan

```
Stage 1: Admissions Concierge (Public Landing Page)
   └─ Evaluation Gate: Confirms 95%+ accuracy in answering tuition & program details from the manifest.
           │
           ▼
Stage 2: Teaching Partner (Workspace Planner)
   └─ Evaluation Gate: Confirms lesson outlines map to standard British Curriculum templates in Volume 7.
           │
           ▼
Stage 3: Learning Companion (Student Dashboard)
   └─ Evaluation Gate: Verification of Socratic learning prompts using learning progression maps in Volume 5.
           │
           ▼
Stage 4: Family Advisor (Parent Dashboard)
   └─ Evaluation Gate: Confirms parent-only progress reports and reports context isolation.
           │
           ▼
Stage 5: Executive Chief of Staff (Executive Dashboard)
   └─ Evaluation Gate: Analytical reports generate without database read latency.
```

---

## 7. Google Workspace Rollout

TVA employs a modular design ensuring that if a Google API is slow or unavailable, the rest of the application remains fully functional.

1. **Identity Provisioning**: Core account generation (`Directory API`).
2. **Calendar & Meet**: Live session integration. Meet links generate on scheduling.
3. **Classroom & Drive**: Classroom course creation and Drive folder mappings matching curriculum units and subjects.
4. **Gmail**: System messages (Gmail API integration). Can fall back to Resend gateway.

---

## 8. Testing Gates

Before promoting any release to production, the application must pass through the following testing sequence:

```
[1. Commit] -> [2. Curriculum Ingest] -> [3. Integration] -> [4. Accessibility] -> [5. Security] -> [6. AI Eval] -> [7. UAT]
```

- **Gate 1: Commit**: TypeScript builds successfully; unit tests exceed 85% coverage.
- **Gate 2: Curriculum Ingest**: Verifies database schemas parse and store curriculum tables without truncation.
- **Gate 3: Integration**: DB schema migrates; outbox event dispatch is checked.
- **Gate 4: Accessibility**: Axe checks return 0 critical issues.
- **Gate 5: Security**: SQL injections and RLS permission bypass test passes.
- **Gate 6: AI Evaluation**: Socratic prompts pass prompt evaluation sets.
- **Gate 7: User Acceptance Testing (UAT)**: Stakeholder sign-off on dashboards.

---

## 9. Risk Register

| Risk Category | Risk Description | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Technical** | High latency on database connection pools. | Medium | Enforce PgBouncer transaction pooling. |
| **Operational** | Google Workspace API rate limits exceeded. | High | Implement local caching and worker retries. |
| **Educational** | AI provides direct homework answers. | High | Enforce system prompt templates in LLM queries. |
| **Integration** | Stripe webhook failure causes unpaid active states. | Critical | Outbox event verifies payment logs before cohort assignments. |
| **AI** | Prompt injection attacks leak other student records. | Critical | Enforce strict RLS in database queries; clean context blocks. |
| **Curriculum** | Ingestion parser fails to parse schema updates. | High | Implement local schema validation checks prior to database execution. |

---

## 10. Definition of Ready (DoR)

A backlog item is ready for development only when:
- [ ] Prerequisites and blocking dependencies are resolved.
- [ ] Acceptance criteria are explicitly defined and testable.
- [ ] Database schema changes are documented in Volume 5.
- [ ] Curriculum package schemas are confirmed by the Education Architect.
- [ ] Architectural models are approved by JBK-Core.

---

## 11. Definition of Done (DoD)

A backlog item is complete only when:
- [ ] Next.js component compiles without warnings or errors.
- [ ] Code changes include passing unit and integration tests.
- [ ] API documentation is updated inside the `/docs` directory.
- [ ] RLS policies are validated on new tables.
- [ ] Accessibility review verifies zero AA violations.
- [ ] Changes are reviewed and approved by two developers.

---

## 12. Traceability Matrix

Every work order maps back to the approved foundational design documents:

| Work Order ID | Constitution Clause | Event Model Reference | Decision Architecture | Experience Blueprint |
| :--- | :--- | :--- | :--- | :--- |
| **TVA-WO-001** | Learning First | None | System Setup | Visual Language |
| **TVA-WO-007** | Institutional | None | Ingestion Setup | Curriculum Map |
| **TVA-WO-002** | Trust & Privacy | None | Role Gating | Layout Guides |
| **TVA-WO-003** | Humans Lead | `student.enrolled` | Tuition Checkout | Admissions Flow |
| **TVA-WO-004** | Institutional | `session.scheduled` | Timetable Schedule | Teacher Workspace |
| **TVA-WO-005** | Support Availability | `classroom.synced` | Workspace Sync | Core Integration |
| **TVA-WO-006** | Explainability | `ai.violation.flagged` | AI Guardrails | Student Dashboard |

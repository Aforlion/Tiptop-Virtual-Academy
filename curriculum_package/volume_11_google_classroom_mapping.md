# Volume 11: Google Classroom Mapping

This document defines the automated mapping rules, provisioning scopes, and directory hierarchies connecting the British Curriculum structures with Google Workspace API resources.

## 1. Curriculum to Google Workspace Resource Mapping

The integration worker automatically creates Workspace resources based on the active curriculum structure, preventing the need for manual setup by teachers.

```
[Curriculum Object]                         [Google Workspace Resource]

Academic Subject (e.g. Mathematics)   ───►  Google Classroom Course
  └─ Name: "Mathematics - Year 5 - Cohort A"

Unit (e.g. Unit 3: Fractions)         ───►  Classroom Course Topic
  └─ Name: "Unit 3: Fractions"

Lesson (e.g. Lesson 3: Add Fractions) ───►  Classroom CourseWork Material
  └─ Title: "L3: Adding Fractions"

Homework Assignment                   ───►  Classroom CourseWork Assignment
  └─ Type: "ASSIGNMENT", Points: 100

Live Lesson Schedule                  ───►  Google Calendar Event + Meet link
  └─ ConferenceData config enabled
```

---

## 2. Shared Google Drive Directory Hierarchy

Every provisioned Google Classroom Course is linked to a structured folder hierarchy inside the school's shared Google Drive workspace:

```
Shared School Drive/
├── Curriculum-Templates/                   # Read-Only Central Repository
│   └── Year-5/
│       └── Mathematics/
│           └── Unit-3-Fractions/
└── Active-Classes/                         # Academic Class Cohorts
    └── Mathematics-Year-5-Cohort-A/
        ├── Class-Resources/                # Read-Only (Classroom materials)
        └── Student-Dropboxes/              # Private folders per student
            ├── Student-A-ID/
            └── Student-B-ID/
```

- **Permission Bounds**:
  - `Class-Resources`: Read-only permissions for students; Edit permissions for the cohort teacher.
  - `Student-Dropboxes`: Write-only permissions for the respective student (for uploads); Edit permissions for the cohort teacher.

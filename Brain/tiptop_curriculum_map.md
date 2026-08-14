---
Title: Tiptop Virtual Academy 2.0 - British Curriculum Package Specification Map
Category: Project-Memory
Project: Tiptop Virtual Academy 2.0
Owner: Education Architect
Status: Approved
Created: 2026-07-24
Review Date: 2027-07-24
Related Assets:
  - Projects/TVA/curriculum_map.md
  - Projects/TVA/implementation_roadmap.md
---

# Tiptop Virtual Academy 2.0 - British Curriculum Package Specification Map

This document registers the design details of the British Curriculum package integrated into the TVA 2.0 system.

## 1. Modular Package Architecture
The British Curriculum is engineered as a pluggable data package to ensure that admissions forms, billing calculators, Google Classroom creation utilities, and AI Oracles do not contain hardcoded educational logic. All domains interact with standard package attributes:
- **Tiers**: EYFS, KS1, KS2, KS3, IGCSE, and A-Levels.
- **Syllabus Hierarchy**: Year -> Terms -> Weeks -> Subjects -> Units -> Lessons -> Learning Objectives.

## 2. In-System Integrations
- **AI Curriculum Guidance**: Systems prompts and context retrieval metrics configured for the AI Learning Companion, Teaching Partner, Family Advisor, Executive Chief of Staff, and Curriculum Advisor.
- **Google Classroom Mapping**: Automatic generation of Classroom Course nodes, Topic items, CourseWork assignments, and Google Drive directories directly from the database syllabus.
- **Executive Analytics**: KPI formulations for Academic Mastery, Curriculum Coverage, Teacher Workload, and Student/Parent engagement.

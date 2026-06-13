# Strategy: Product Specification - Teen Dashboard

**Project:** Tiptop Virtual Academy  
**Category:** Strategy  
**Owner:** Product Engineer  
**Status:** Proposed  
**Created:** 2026-06-13  
**Review Date:** 2026-09-13  
**Related Assets:** [deep-research-director-report.md](file:///c:/Projects/Tiptop%20Virtual%20Academy/Research/deep-research-director-report.md)

## Executive Summary
This document specifies the Product Requirements and User Experience strategy for expanding Tiptop Virtual Academy's student dashboard to accommodate teen learners (Ages 13-16).

---

## Product Objective
To retain older students (ages 13-16) by offering a high-utility, workspace-like learning dashboard focused on developer practices, project submissions, and professional certifications.

---

## Problem Statement
The current dashboard options (Junior: ages 3-6, and Senior: ages 7-12) are stylized with gamification elements that do not appeal to teenagers. Teenagers require professional-looking tools, independent scheduling controls, and coding project integrations.

---

## User Analysis
- **Primary User:** Teen Student (13-16). Goals: Build projects, track class bookings, link GitHub repositories, and earn certificates. Pain Points: Frustrated by childish theme elements and over-gamified badges.
- **Secondary User:** Parent. Goals: Purchase credits and monitor progress. Needs: Oversight dashboard without micro-managing the teen.

---

## Product Definition
The Teen Dashboard is a modern slate-indigo themed workspace incorporating:
1. **Developer Portfolio:** Grid showing projects, linked repositories, and project statuses.
2. **Pomodoro/Study Timer:** Tool for focus sessions.
3. **Class Launcher & Attendance Tracker:** 1-Click launcher matching Jitsi sessions.

---

## User Journeys
1. **Teen logs in:** System detects age >= 13, renders `.teen-theme`.
2. **Teen completes class:** System prompts project upload; teen adds description and GitHub repository link.
3. **Teen views certificates:** Interactive PDF viewer showing certificate templates.

---

## MVP Definition
- **Must Have:** `.teen-theme` styling overrides, dynamic age layout switcher supporting age 13-16, class schedule board.
- **Should Have:** GitHub project submission form, Pomodoro focus widget.
- **Could Have:** Peer-to-peer discussion forum.
- **Won't Have:** Custom gamified avatars (replaced by professional profile pictures).

---

## Product Roadmap
- **Sprint 1 (Theme & Layout):** Integrate the Teen CSS theme and dynamic switcher into the dashboard wrapper.
- **Sprint 2 (Portfolio Feature):** Create the project list and submission components.

---

## Product Verdict
**Approved.** Scaling our platform to teens is essential for increasing customer lifetime value.

# Volume 12: Executive Analytics

This document defines the key performance indicators (KPIs), metric calculations, telemetry events, and tracking parameters that power the Executive Dashboard.

## 1. Educational KPIs & Metric Formulations

### 1.1 Academic Mastery (School-wide & Cohort)
- **Calculation Formula**:
  $$\text{Mastery \%} = \frac{\sum(\text{Student Final Grade \%})}{\text{Total Enrolled Students}}$$
- **Dashboard Warning Trigger**: Alert is generated on the Executive Dashboard if the mastery percentage for any cohort drops below **65%** for two consecutive weeks.

### 1.2 Curriculum Coverage Index
- **Calculation Formula**:
  $$\text{Coverage \%} = \frac{\text{Completed Lessons}}{\text{Scheduled Lessons in Term Syllabus}} \times 100$$
- **Dashboard Warning Trigger**: Alert is generated if coverage lag exceeds **15%** behind the scheduled calendar sequence.

### 1.3 Student Engagement Score
- **Telemetry Indicators**:
  - Live session attendance rates (attendance logging).
  - Time spent interacting with the AI Learning Companion.
  - Homework submission delay times.
- **Metric Formulation**:
  $$\text{Engagement Score} = (0.5 \times \text{Attendance \%}) + (0.3 \times \text{On-Time Submissions \%}) + (0.2 \times \text{Wellbeing Indicator})$$

---

## 2. Operational & Administrative KPIs

### 2.1 Teacher Workload Metric
- **Telemetry Indicators**:
  - Total live teaching hours per week.
  - Grading queue size (pending assignments count).
  - Average time to return feedback.
- **Action Plan**: If grading lag times exceed **48 hours**, the system prompts the administrator to adjust teacher assignments.

### 2.2 Parent Portal Engagement
- **Telemetry Indicators**:
  - Weekly login frequency.
  - Credit status logs (active payments).
  - Direct message threads opened.
- **Metric**: Percentage of parents logging in weekly. Target threshold set to **80%+**.

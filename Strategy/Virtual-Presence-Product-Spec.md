# Strategy: Virtual Presence Product Specification

**Project:** Tiptop Virtual Academy  
**Category:** Strategy  
**Owner:** Product Engineer  
**Status:** Proposed  
**Created:** 2026-06-14  
**Review Date:** 2026-09-14  
**Related Assets:** [product-roadmap-and-journeys.md](file:///c:/Projects/Tiptop%20Virtual%20Academy/Strategy/product-roadmap-and-journeys.md)

## Executive Summary
This document specifies the technical and user experience requirements for the "Virtual Presence" and "Immersive Cohort Start" systems. The goal is to make virtual schooling feel like a real physical environment by introducing synchronized arrivals, classmate check-ins, and a persistent classroom dock.

---

## Product Objective
To eliminate the isolation of online learning by establishing a sense of shared presence, anticipation, and synchronized routines for cohorts before their classes start.

---

## Problem Statement
Standard virtual learning feels solitary. Students log into class links late or without a sense of cohort community. There is no concept of a "playground arrival" or seeing who else is present before the school day starts, which diminishes student engagement and cohort bonding.

---

## User Analysis
1. **Student (Learner):** Wants to feel connected to their friends, see who has arrived, and feel like they are entering a physical classroom together.
2. **Teacher (Educator):** Wants to see which cohort members have checked in before opening the session and needs an automated attendance/presence tracker.
3. **Parent (Facilitator):** Wants reassurance that their child is active and attending sessions regularly.

---

## Product Definition
The Virtual Presence system consists of three main components:
1. **The Playground Check-in Signal:** A real-time lobby where students check in 10–15 minutes before school/class begins. Classmates see each other's status indicators update live (e.g. "Arrived", "In Lobby").
2. **The Synchronized Morning Assembly Button:** A unified, pulsating launcher that opens the Jitsi cohort assembly hall simultaneously for all checked-in students.
3. **The Embedded Classroom Dock:** A persistent side panel or dashboard dock housing the video stream alongside real-time status signals (teacher online status, audio check, and classmate presence).

---

## Technical Architecture & Realtime Sync
* **Presence Engine:** Powered by Supabase Realtime (Channels & Broadcasts) to track user presence state (online, check-in timestamp) without persistent DB polling.
* **Database State:** Uses a lightweight `presence_logs` table for persistent record auditing and real-time synchronization.
* **Jitsi Integrations:** Uses the Jitsi External API iframe event listeners (`videoConferenceJoined`, `videoConferenceLeft`) to automatically synchronize student status with the backend.

---

## User Journeys
1. **Lobby Arrival:** 10 minutes before the cohort session starts, the student's dashboard displays a checklist: "Check-in to school."
2. **Presence Broadcast:** Clicking "Check-in" updates the student's status indicator and broadcasts it to all other active cohort members in real-time.
3. **Synchronized Entry:** When the timer hits zero, the "Enter Assembly" button pulses, and classmates enter the Jitsi classroom dock synchronously.

---

## MVP Definition
* **Must Have:** Supabase Realtime channel integration, student check-in status indicators on the student dashboard, and synchronized session launch countdown.
* **Should Have:** Embedded Jitsi iframe listener monitoring connection duration, active classmate status list (e.g., "5 classmates checked in").
* **Could Have:** Animated playground visualizer representing checked-in classmate avatars, school bell sound alerts.

---

## Product Verdict
**Approved.** Creating a shared routine of "arriving" at the academy transforms the platform from a utility class portal into a true virtual school environment.

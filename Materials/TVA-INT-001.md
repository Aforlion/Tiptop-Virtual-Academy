TVA-INT-001
Google Workspace Integration Architecture
Role of Google Classroom within Tiptop Virtual Academy

Version 2.0 Foundation

Purpose

This document defines the role of Google Workspace services within Tiptop Virtual Academy.

Google Workspace shall function as an integrated educational delivery platform supporting the Academy's operations.

Google Workspace shall not become the Academy's source of truth.

Tiptop Virtual Academy remains the authoritative institutional platform.

Architectural Principle

The Academy owns the institution.

Google provides educational tools.

The relationship is therefore:

Tiptop Virtual Academy
        │
        │ controls
        ▼
Google Workspace

Never:

Google Classroom
        │
        ▼
Tiptop Virtual Academy

The Academy is always the system of record.

System of Record

TVA owns:

Students

Parents

Teachers

Admissions

Curriculum

Finance

Attendance

Assessment Records

Certificates

Policies

Academic Calendar

AI Intelligence

Reporting

Institutional Decisions

Google owns:

Classrooms

Meet Links

Drive Files

Google Docs

Google Slides

Google Forms

Google Calendar Events

Google Accounts

Emails

Integration Philosophy

Google Workspace extends the Academy.

It never replaces Academy capabilities.

Every Google object must originate from a TVA decision.

Example:

Student Enrolled

↓

TVA creates Student

↓

TVA emits StudentEnrolled Event

↓

Integration Service creates Google Account

↓

Creates Classroom Membership

↓

Creates Drive Folder

↓

Creates Calendar Events

↓

Sends Gmail Welcome

Google reacts.

TVA decides.

Google Classroom

Google Classroom serves one purpose:

Learning Delivery.

Responsibilities:

Deliver lessons

Organise coursework

Assignments

Announcements

Class discussions

Google Meet integration

Class stream

Learning materials

TVA remains responsible for:

Enrolment

Programme selection

Academic records

Progress tracking

Payments

Communication history

Reporting

Certificates

AI support

Institutional governance

Google Meet

Google Meet provides:

Live teaching

Parent meetings

Teacher collaboration

Staff meetings

One-to-one tutoring

TVA schedules meetings.

Google hosts meetings.

Meeting attendance flows back into TVA.

Google Drive

Every learner receives structured storage.

Example:

Student Drive

Assignments

Projects

Certificates

Portfolio

Resources

Teachers receive:

Lesson Resources

Department Materials

Shared Content

Assessment Resources

TVA stores references.

Google stores documents.

Gmail

Gmail becomes the Academy communication engine.

Examples:

Admissions

Welcome emails

Homework notifications

Attendance alerts

Payment receipts

Meeting invitations

Parent communication

AI-generated summaries (after approval)

Every email originates from TVA workflows.

Google Calendar

TVA owns the Academic Calendar.

Google Calendar displays it.

Examples:

Lessons

Examinations

Parent Meetings

School Events

Holiday Schedule

Teacher CPD

Calendar updates begin in TVA.

Google Forms

Optional.

Used for:

Surveys

Quick quizzes

Parent feedback

Teacher feedback

Registration supplements

Form responses synchronise back into TVA.

Google Docs

Teachers may create:

Lesson notes

Policies

Worksheets

Planning documents

TVA stores metadata.

Google stores content.

Google Slides

Used for:

Presentations

Teaching resources

Staff training

Orientation

Again:

TVA references.

Google stores.

Google Sheets

Used where appropriate for:

Operational exports

Bulk uploads

Temporary analysis

Never as the permanent database.

Google Identity

Google accounts are provisioned automatically.

Example:

Student admitted.

↓

TVA provisions Google account.

↓

Assigns organisational unit.

↓

Applies security policies.

↓

Adds Classroom memberships.

↓

Grants Drive permissions.

↓

Activates Gemini permissions.

Identity is managed automatically.

Academy Intelligence Integration

Every AI Faculty member may interact with Google Workspace through authorised services.

Examples:

Learning Companion

Reads assignments.

Summarises coursework.

Explains lesson material.

Teaching Partner

Creates Google Docs.

Drafts lesson plans.

Builds quizzes.

Executive Chief of Staff

Summarises Calendar.

Reviews Drive reports.

Analyses Classroom activity.

AI never bypasses TVA governance.

Synchronisation Principles

TVA → Google

Primary direction.

Institutional changes propagate outward.

Google → TVA

Secondary direction.

Learning activity returns to TVA.

Example:

Assignment submitted.

↓

Google Classroom Event.

↓

TVA receives event.

↓

Assessment updated.

↓

Parent notified.

↓

Executive Dashboard refreshed.

Everything becomes event-driven.

Error Handling

If Google services become unavailable:

TVA continues operating.

Operations enter Pending Synchronisation.

Automatic retries occur.

Administrators receive notifications.

No institutional information is lost.

Security

Integration shall use:

OAuth 2.0

Service Accounts

Least Privilege

Encrypted Secrets

Audit Logging

Domain-wide Delegation where appropriate

No credentials stored in source code.

Monitoring

Continuously monitor:

API health

Quota usage

Sync failures

Provisioning failures

Meet creation

Classroom membership

Email delivery

Calendar synchronisation

Every integration must be observable.

Future Integrations

The Integration Layer should support future providers without redesign.

Potential additions:

Microsoft 365

Zoom

Canvas

Moodle

WhatsApp

SMS

Payment Providers

Library Systems

Government reporting

Google Workspace becomes one adapter among many.

Definition of Success

A teacher should never need to manually create:

Google Classrooms
Meet links
Student accounts
Drive folders
Calendar events

These should be created automatically by TVA.

A parent should never need to know whether information comes from Google or TVA.

A learner should simply experience one seamless digital academy.

Final Integration Principle

Tiptop Virtual Academy is the Academy. Google Workspace is its classroom, meeting room, library, and communication tools.

The institution lives in TVA.

Google Workspace extends the institution.

Never the other way around.
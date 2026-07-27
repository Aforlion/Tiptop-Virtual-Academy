TVA-TECH-001
Technology Layer Implementation Directive
Tiptop Virtual Academy 2.0
Version 2.0 Foundation
Mission

The Technology Layer exists solely to implement the Institution Layer, Experience Layer, and Academy Intelligence Layer.

Technology shall never dictate institutional policy, educational philosophy, or user experience.

The architecture must faithfully realise the Academy already defined in the constitutional and architectural documents.

Guiding Principle

The development team is not building a Learning Management System.

The team is implementing a digital academy.

Every technical decision should reinforce the Academy's educational philosophy, institutional governance, and human-centred experience.

Technology Stack
Frontend

Framework

Next.js (App Router)

Language

TypeScript

UI

React

Styling

Tailwind CSS

Component Library

shadcn/ui

Animation

Framer Motion

Icons

Lucide React

Forms

React Hook Form

Validation

Zod

Charts

Recharts
Backend

Platform

Supabase

Database

PostgreSQL

Authentication

Supabase Auth

Storage

Supabase Storage

Realtime

Supabase Realtime

Security

Row Level Security (RLS)

Server Logic

Supabase Edge Functions where appropriate
Deployment

Source Control

GitHub

Continuous Deployment

GitHub Actions

Hosting

Vercel

Backend Services

Supabase

Environment Management

Vercel Environment Variables

Secrets

GitHub Secrets
Supabase Secrets
AI Platform

The application shall implement the Academy Intelligence Architecture.

AI shall never be embedded directly into user interfaces.

Instead, create a dedicated Academy Intelligence layer.

Frontend

↓

Academy Intelligence API

↓

AI Orchestrator

↓

AI Faculty

↓

Knowledge Layer

↓

LLM Provider

The frontend communicates only with the Academy Intelligence API.

The implementation of AI providers remains hidden behind the Intelligence Layer.

Supported AI Providers

The platform shall support multiple providers.

Primary

Google Gemini

Secondary

OpenAI

Future

Anthropic Claude

Future

Additional providers through adapters

No business logic shall depend directly upon a single LLM vendor.

Academy Intelligence

Implement the following official AI roles.

Admissions Concierge
Learning Companion
Family Advisor
Teaching Partner
Executive Chief of Staff
Operations Coordinator
Finance Assistant
Curriculum Advisor
Wellbeing Companion

Each role shall inherit from the shared Academy Intelligence Architecture.

Shared Knowledge Layer

Every AI role shall use the same institutional knowledge.

Knowledge sources include:

Academy Constitution

Academy Philosophy

Rulebook

Policies

Curriculum

Programme Catalogue

Academic Calendar

Capability Model

Event Model

Decision Architecture

Design System

Experience Blueprints

Knowledge Base

FAQs

Communication Standards

No AI role shall maintain conflicting institutional knowledge.

Application Architecture

The application shall be organised by business domains rather than pages.

Example structure:

app/

domains/

admissions/

students/

parents/

teachers/

curriculum/

assessment/

finance/

communications/

executive/

academy-intelligence/

shared/


Each domain owns:

Entities
Services
Events
APIs
Validation
Tests
UI Components

Domains communicate through events and contracts rather than direct dependencies.

Event-Driven Architecture

The platform shall be event-driven.

Example:

Student Enrolled

↓

Student Account Created

↓

Parent Account Created

↓

Teacher Assigned

↓

Learning Companion Activated

↓

Executive Dashboard Updated

↓

Notifications Sent

↓

Audit Log Recorded

Systems react to events rather than calling one another directly.

Security

Implement security by design.

Requirements:

Role-Based Access Control

Row-Level Security

Least Privilege

Encrypted Secrets

Audit Logging

Secure Authentication

Session Management

Input Validation

Output Sanitisation

No secrets committed to Git.

Academy Experience

The Technology Layer shall faithfully implement:

Landing Page

Student Dashboard

Parent Portal

Teacher Workspace

Executive Dashboard

No additional page shall introduce a competing design language.

All interfaces inherit from the Design System.

Performance Targets

Landing Page

First Contentful Paint under 2 seconds.

Interactive under 3 seconds.

Dashboard Loading

Critical information under 1 second.

Lazy loading for secondary information.

Animations

Smooth 60fps where supported.

Images

Optimised automatically.

Accessibility

WCAG AA minimum.

Design Principles

Technology must remain invisible.

Users should experience:

Warmth

Trust

Joy

Calmness

Professionalism

Human connection

The platform should never feel mechanical.

AI Principles

Artificial Intelligence may:

Explain

Recommend

Predict

Draft

Summarise

Generate

Translate

Analyse

Artificial Intelligence shall never:

Replace teachers

Approve admissions

Authorise payments

Change institutional policy

Award qualifications

Take safeguarding decisions

Terminate employment

Human authority remains final.

Repository Structure
tiptop-virtual-academy/

app/

components/

domains/

academy-intelligence/

shared/

hooks/

lib/

styles/

public/

supabase/

docs/

tests/


The Academy Intelligence implementation shall exist as its own first-class domain.

Quality Standards

Every Pull Request must include:

Passing TypeScript compilation

Passing unit tests

Passing integration tests

Passing linting

Accessibility review

Performance review

Documentation updates

No feature is complete until documentation is updated.

Documentation

Every domain must contain:

README

Architecture

Business Rules

Events

API

AI Behaviour

Testing

Future developers should understand a domain without reading its implementation first.

Testing Strategy

Unit Tests

Integration Tests

End-to-End Tests

Accessibility Tests

Performance Tests

Security Validation

AI Behaviour Evaluation

Regression Testing

Testing is mandatory.

Deployment Pipeline
Developer

↓

GitHub Branch

↓

Pull Request

↓

Code Review

↓

GitHub Actions

↓

Tests

↓

Build

↓

Deploy Preview (Vercel)

↓

Approval

↓

Production Deployment

↓

Monitoring

Production deployments shall always be traceable.

Monitoring

Continuously monitor:

Application Errors

Performance

Database Health

API Latency

Authentication

AI Usage

Operational Costs

User Behaviour

System Health

Observability is a production requirement.

Future Readiness

The architecture must support:

Additional curricula

Multiple campuses

International expansion

Multiple languages

Additional payment providers

New AI providers

Native mobile applications

Third-party integrations

Future growth should require extension rather than redesign.

Definition of Done

A feature is complete only when:

It aligns with the Constitution.
It respects the Rulebook.
It follows the Design System.
It integrates with the Academy Intelligence Architecture.
It passes automated testing.
It is documented.
It is accessible.
It is production-ready.

Code alone does not constitute completion.

Final Development Principle

When uncertainty arises, developers shall ask:

"Does this implementation make Tiptop Virtual Academy feel more like an exceptional academy?"

If the answer is No, the implementation should be reconsidered.

If the answer is Yes, and it aligns with the institutional architecture, experience blueprint, and Academy Intelligence Architecture, then the implementation is faithful to the vision of TVA 2.0.



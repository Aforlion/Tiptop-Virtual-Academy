# Strategy: Teen Workspace UI Architecture

**Project:** Tiptop Virtual Academy  
**Category:** Strategy  
**Owner:** Education Architect / Product Engineer  
**Status:** Proposed  
**Created:** 2026-06-13  
**Review Date:** 2026-09-13  
**Related Assets:** [globals.css](file:///c:/Projects/Tiptop%20Virtual%20Academy/src/app/globals.css), [page.tsx](file:///c:/Projects/Tiptop%20Virtual%20Academy/src/app/%28student%29/student/dashboard/page.tsx)

## Summary
With the academy's expansion to support ages 3 to 16, a single or double age bracket theme (Junior/Senior) is no longer sufficient. Teens (Ages 13-16) require a specialized user interface tailored to high-school maturity: focus-based, integrated with developer utilities, and containing portfolio displays.

## Proposed Strategy & UX Guidelines

1. **Theme Aesthetics (`.teen-theme`):**
   - High-contrast, clean professional workspace (Slate/Indigo dark theme).
   - Minimalist grid borders instead of playful shadows/gradients.
   - Standard font sizes and structured tables.

2. **Core Teen Dashboard Widgets:**
   - **Portfolio Showcase:** Allows students to upload or link project deliverables (GitHub repositories, hosted URLs, Figma boards).
   - **Workspace Terminal:** Embeds code challenges, terminal inputs, or lesson checklists directly.
   - **Study Timer / Pomodoro Widget:** Promotes focused independent learning blocks.
   - **Peer Collaboration Dock:** Channel feeds showing active code reviews or discussion threads.

## Impact & Actions
1. **Education Architect** will draft the course structures and modules for teen learners.
2. **Product Engineer** will build the `.teen-theme` CSS classes and mount the Teen Dashboard layouts when `calculateAge(student.date_of_birth) >= 13`.

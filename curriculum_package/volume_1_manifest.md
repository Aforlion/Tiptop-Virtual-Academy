# Volume 1: Curriculum Package Manifest

This manifest file specifies the core parameters, identification, provider definitions, and educational frameworks for the British Curriculum Package within Tiptop Virtual Academy 2.0.

## 1. Package Identification Metadata

To guarantee plug-in compatibility and allow modular integrations across other platform domains (such as Admissions, Billing, and AI Oracles), the package defines a clean programmatic manifest signature:

```json
{
  "curriculumPackageId": "pkg-uk-british-curriculum-v2",
  "curriculumName": "National Curriculum for England (British Curriculum)",
  "version": "2.0.0",
  "provider": "Tiptop Academy Curriculum Development Division",
  "ageRange": {
    "min": 3,
    "max": 18
  },
  "supportedAcademicLevels": [
    "Early Years Foundation Stage (EYFS)",
    "Key Stage 1 (KS1)",
    "Key Stage 2 (KS2)",
    "Key Stage 3 (KS3)",
    "Key Stage 4 (KS4 / IGCSE)",
    "Key Stage 5 (KS5 / A-Levels)"
  ],
  "subjects": [
    "English Language and Literature",
    "Mathematics",
    "Sciences (Biology, Chemistry, Physics)",
    "History & Humanities",
    "Geography",
    "Computing & Information Technology",
    "Art & Creative Design"
  ]
}
```

---

## 2. Learning Philosophy

The learning philosophy represents the core academic direction of Tiptop Virtual Academy:
- **Child-Centered Guided Inquiry**: Learning is guided by curiosity. We reject rote learning in favor of guided discovery.
- **Cognitive Development Phases**: Visual, play-centric modes for Early Years, transitioning into structured, conceptual models for Key Stages 2 & 3, and specialized exam tracks for IGCSE/A-Levels.
- **Socratic Instruction**: AI assistants and teaching plans employ active questioning rather than feeding direct solutions.

---

## 3. Assessment Philosophy

Assessment functions as a continuous feedback loop:
- **Formative Priority**: Formative checks occur throughout lessons to identify gaps early.
- **Competency-Based Evaluation**: Progress is assessed against learning outcomes, not memory tests.
- **Portfolio-Based Evidence**: Visual portfolios, project deliverables, and oral presentations are prioritised.

---

## 4. Reporting Model

Progress reporting is designed to keep families actively informed:
- **Weekly Progress Trackers**: Dashboard summaries displaying attendance rates, assignment completion status, and student wellbeing indicators.
- **Termly Academic Progress Reports**: Detailed reports breaking down academic mastery percentages, teacher comments, and next-step actions.

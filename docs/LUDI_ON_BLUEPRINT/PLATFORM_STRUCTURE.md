# LUDI ON – Platform Structure

**Version:** 1.0

**Status:** Draft

**Owner:** LUDI ON Core Team

**Last Update:** July 2026

---

# Purpose

This document defines the complete functional architecture of the LUDI ON platform.

It describes what the platform offers to each user role and how major functional areas are organized. It does not describe software implementation, technologies, or internal system design.

For AI system design, see `AI_ARCHITECTURE.md`.

---

# Platform Tree

```
LUDI ON Platform
│
├── 1. Authentication & Accounts
│   ├── User Registration
│   ├── User Login
│   ├── Password Recovery
│   ├── Account Profile
│   ├── Role Assignment
│   └── Account Preferences
│
├── 2. Teacher Portal
│   ├── Home Dashboard
│   ├── Activity Builder
│   │   ├── Activity Type Selection
│   │   ├── Game Type Selection
│   │   ├── Activity Configuration
│   │   ├── Game Configuration
│   │   ├── AI Configuration
│   │   └── Generation Summary
│   ├── Activity Editor
│   ├── My Projects
│   ├── Personal Library
│   ├── Scenario Studio
│   │   ├── Scenario Builder
│   │   ├── Character Management
│   │   ├── Theme Management
│   │   ├── Story Generation
│   │   └── Scenario Library
│   ├── AI Teaching Assistant
│   ├── Settings
│   └── Help
│
├── 3. Student Portal (Future)
│   ├── Assigned Activities
│   ├── Activity Participation
│   ├── Progress Overview
│   └── Learning History
│
├── 4. Parent Portal (Future)
│   ├── Child Activity Overview
│   ├── Progress Reports
│   └── Teacher Communication
│
├── 5. Administrator Portal (Future)
│   ├── User Management
│   ├── Platform Configuration
│   ├── Content Moderation
│   ├── Community Oversight
│   └── Usage Reports
│
├── 6. AI Platform
│   ├── Generation Orchestration
│   ├── Instructional Planning
│   ├── Pedagogical Recommendations
│   ├── Activity Content Generation
│   ├── Resource Generation
│   ├── AI Explanations
│   ├── Prompt Configuration
│   ├── Output Validation
│   └── Learning Memory (Future)
│
├── 7. Resource Center
│   ├── Resource Generation
│   │   ├── Worksheets
│   │   ├── Presentations
│   │   ├── Flashcards
│   │   ├── Quizzes
│   │   ├── Memory Games
│   │   ├── Escape Rooms
│   │   └── PDF Export
│   ├── Resource Preview
│   ├── Resource Download
│   └── Resource Library
│
├── 8. Collaboration
│   ├── Activity Sharing
│   ├── Template Library
│   ├── Ratings
│   ├── Comments
│   └── Marketplace
│
├── 9. Analytics
│   ├── Teacher Activity Metrics
│   ├── Resource Usage Metrics
│   ├── AI Generation Metrics
│   └── Platform Usage Reports (Future)
│
└── 10. Infrastructure
    ├── Content Persistence
    ├── Search and Discovery
    ├── Notification Delivery
    ├── Localization
    ├── Help and Support
    └── Data Export and Portability
```

---

# Module Descriptions

## 1. Authentication & Accounts

Manages identity, access, and account-level settings for all platform users.

| Functional Area | Description |
|-----------------|-------------|
| User Registration | Allows new users to create a platform account. |
| User Login | Authenticates returning users and grants access to their portal. |
| Password Recovery | Enables users to regain access to a locked account. |
| Account Profile | Stores personal and professional information such as name, school, and teaching context. |
| Role Assignment | Defines the user's platform role (teacher, student, parent, administrator). |
| Account Preferences | Manages language, notification, and display preferences at account level. |

---

## 2. Teacher Portal

The primary workspace where teachers design, create, manage, and refine educational activities.

| Functional Area | Description |
|-----------------|-------------|
| Home Dashboard | Entry point presenting quick access to creation, projects, library, and assistance tools. |
| Activity Builder | Guided workflow for configuring and generating a complete educational activity. |
| Activity Type Selection | Chooses the pedagogical purpose: instruction, practice, consolidation, assessment, or remediation. |
| Game Type Selection | Chooses the interactive format: quiz, puzzle, memory, matching, wheel, escape room, story, or AI recommendation. |
| Activity Configuration | Defines subject, topic, grade level, duration, and learning objectives. |
| Game Configuration | Sets game-specific parameters such as question count, difficulty, and interaction rules. |
| AI Configuration | Captures the teacher's intent through structured inputs and free-text description for AI generation. |
| Generation Summary | Presents the configured activity for review before generation or saving. |
| Activity Editor | Allows full editing of generated or manually created activity content. |
| My Projects | Organizes saved activities and work-in-progress projects. |
| Personal Library | Stores and retrieves the teacher's own activities, templates, and reusable elements. |
| Scenario Studio | Creates and manages reusable educational worlds with characters, themes, and narratives. |
| Scenario Builder | Designs multi-step educational scenarios linked to activities. |
| Character Management | Defines characters used across scenarios and activities. |
| Theme Management | Defines visual and narrative themes applied to scenarios. |
| Story Generation | Produces narrative content aligned with instructional goals. |
| Scenario Library | Stores and reuses previously created scenarios. |
| AI Teaching Assistant | Provides pedagogical guidance on methods, strategies, differentiation, and assessment. |
| Settings | Manages teacher-specific platform preferences and defaults. |
| Help | Provides guidance, documentation, and support resources. |

---

## 3. Student Portal (Future)

Provides learners with access to assigned activities and visibility into their own progress.

| Functional Area | Description |
|-----------------|-------------|
| Assigned Activities | Lists activities shared or assigned by a teacher. |
| Activity Participation | Allows students to complete interactive learning activities. |
| Progress Overview | Displays completion status and performance summaries. |
| Learning History | Records past activities and outcomes for reference. |

---

## 4. Parent Portal (Future)

Gives parents visibility into their child's educational activities and progress.

| Functional Area | Description |
|-----------------|-------------|
| Child Activity Overview | Shows activities assigned to or completed by the child. |
| Progress Reports | Summarizes learning progress over time. |
| Teacher Communication | Enables structured communication between parents and teachers. |

---

## 5. Administrator Portal (Future)

Supports platform operators in managing users, content, and community activity.

| Functional Area | Description |
|-----------------|-------------|
| User Management | Creates, modifies, and deactivates platform accounts. |
| Platform Configuration | Manages global settings that apply across the platform. |
| Content Moderation | Reviews shared content for compliance with platform standards. |
| Community Oversight | Monitors sharing, ratings, comments, and marketplace activity. |
| Usage Reports | Provides operational summaries for platform administration. |

---

## 6. AI Platform

Delivers AI-assisted creation, recommendation, and validation across the teacher workflow.

| Functional Area | Description |
|-----------------|-------------|
| Generation Orchestration | Coordinates the end-to-end AI generation workflow from teacher input to validated output. |
| Instructional Planning | Interprets teacher intent and produces a structured instructional blueprint. |
| Pedagogical Recommendations | Applies educational principles to refine activity design before content is generated. |
| Activity Content Generation | Produces activity text, game mechanics, questions, and interactive elements. |
| Resource Generation | Transforms approved activity content into classroom-ready resource formats. |
| AI Explanations | Explains AI design choices and generated content to the teacher. |
| Prompt Configuration | Allows structured and free-text input that guides AI generation. |
| Output Validation | Checks generated output for completeness, consistency, and pedagogical compliance. |
| Learning Memory (Future) | Records anonymized workflow patterns to improve future recommendations. |

---

## 7. Resource Center

Manages the creation, storage, and distribution of classroom-ready materials derived from activities.

| Functional Area | Description |
|-----------------|-------------|
| Resource Generation | Produces deliverable materials from an approved activity. |
| Worksheets | Generates printable exercise sheets. |
| Presentations | Generates slide-based classroom presentations. |
| Flashcards | Generates card-based review materials. |
| Quizzes | Generates structured question-and-answer assessments. |
| Memory Games | Generates paired-image memory activities. |
| Escape Rooms | Generates sequential mission-based learning experiences. |
| PDF Export | Exports any resource format as a downloadable PDF. |
| Resource Preview | Allows teachers to review resources before download or distribution. |
| Resource Download | Provides access to generated files. |
| Resource Library | Stores and organizes resources linked to activities and projects. |

---

## 8. Collaboration

Enables teachers to share, discover, and evaluate educational content within the platform community.

| Functional Area | Description |
|-----------------|-------------|
| Activity Sharing | Allows teachers to publish activities for other users. |
| Template Library | Provides downloadable activity templates for reuse. |
| Ratings | Allows users to evaluate shared activities. |
| Comments | Allows users to provide feedback on shared content. |
| Marketplace | Provides a curated space for discovering and obtaining shared educational resources. |

---

## 9. Analytics

Provides insight into platform usage and content performance.

| Functional Area | Description |
|-----------------|-------------|
| Teacher Activity Metrics | Tracks creation, editing, and usage patterns for teacher-authored content. |
| Resource Usage Metrics | Measures generation, download, and reuse of classroom resources. |
| AI Generation Metrics | Tracks AI-assisted creation volume and acceptance rates. |
| Platform Usage Reports (Future) | Aggregates cross-role usage data for institutional and administrative review. |

---

## 10. Infrastructure

Provides cross-cutting platform services that support all portals and modules.

| Functional Area | Description |
|-----------------|-------------|
| Content Persistence | Retains activities, projects, resources, and user-generated content across sessions. |
| Search and Discovery | Allows users to find activities, resources, templates, and shared content. |
| Notification Delivery | Informs users of relevant events such as shared content and completed generations. |
| Localization | Supports platform content and interface in the target language and regional context. |
| Help and Support | Provides access to documentation, FAQs, and support channels. |
| Data Export and Portability | Allows users to export their content for use outside the platform. |

---

# Scope Notes

- Modules marked **(Future)** are planned but not part of the current release scope.
- The Teacher Portal and AI Platform represent the active development focus aligned with the product roadmap.
- Student, Parent, and Administrator portals extend the platform to additional user roles defined in the long-term product vision.
- Functional areas within each module may be delivered incrementally across roadmap versions without changing the overall platform structure.

---
Status: Core Engineering Standard
Code: PRIMA-DOC-006
Title: Engineering Standards
Subtitle: The Engineering Constitution of PRIMA
Version: 1.0
Owner: Engineering Architecture Board of PRIMA
Priority: Absolute (engineering)
Last Updated: July 2026
Authority: Mandatory for every software component, interface contract, assisting-intelligence service, and infrastructure decision. Subordinate to PRIMA-DOC-000 (Founding Charter). Must remain consistent with PRIMA-DOC-001 through PRIMA-DOC-005. On conflict regarding technical design discipline, this Standard prevails over lower engineering specifications; higher constitutional and educational documents prevail on mission, pedagogy, experience, and intelligence ethics.
Depends On: PRIMA-DOC-000 · PRIMA-DOC-001 · PRIMA-DOC-002 · PRIMA-DOC-003 · PRIMA-DOC-004 · PRIMA-DOC-005
Authored Under: PRIMA-DOC-000-AP (timeless · educational-first · teacher sovereignty · learner dignity · ethical consistency · practical governance)
---

# PRIMA-DOC-006  
# Engineering Standards

**The Engineering Constitution of PRIMA**

Adopted as the permanent engineering reference for the design, implementation, maintenance, and evolution of the PRIMA ecosystem.

---

# Preamble

Every technical decision is also an educational decision.  
Architecture that cannot sustain pedagogy, teacher sovereignty, learner dignity, explainable assistance, and calm experience is not engineering excellence—regardless of novelty.

This Standard does not prescribe vendors, languages, or platforms.  
It defines durable engineering duties that remain valid as technologies change.

Core question for every section:

> **Does this technical choice protect educational mission, human authority, and long-term stewardship?**

---

# PART I — Engineering Philosophy

### 1.1 Technology serves pedagogy
Technical capability is justified only by educational purpose (PRIMA-DOC-003) and product worthiness (PRIMA-DOC-002). Technology may not redefine the aim.

### 1.2 Architecture serves sustainability
Systems are built to be understood, changed, and operated safely across years—not merely demonstrated once.

### 1.3 Code serves people
Code serves teachers through reliable product behaviour, and serves engineers through clarity that enables responsible change. Cleverness that obscures intent is debt.

### 1.4 Constraints are constitutional
Engineering must enforce—by design—teacher approval before educational use, explainability of material assistance, accessibility of critical paths, privacy minimization, and dignity protections (PRIMA-DOC-000 · 004 · 005).

### 1.5 Fail safe, fail obvious, fail recoverable
When systems degrade, they must not silently seize pedagogical commitment, destroy approved work, or hide failure.

### 1.6 Simplicity as strength
Prefer the simplest architecture that meets educational and operational duties. Accidental complexity is a stewardship failure.

### 1.7 Evidence over assertion
Quality, security, performance, and AI behaviour are evidenced through review, tests, observation, and gates—not declared by intent alone.

---

# PART II — Architectural Principles

### 2.1 Modularity
The system is composed of coherent modules with explicit responsibilities. Educational domains are not entangled with incidental infrastructure concerns.

**Implication.** Boundaries follow pedagogical and product seams (design, adaptation, validation, delivery, identity, persistence, messaging)—not temporary team convenience alone.

### 2.2 Loose coupling
Modules communicate through stable contracts. Changes in one area should not force unnecessary change in unrelated areas.

**Implication.** Prefer explicit interfaces and versioned contracts over hidden shared mutability.

### 2.3 High cohesion
Elements that change together live together. A module’s internals serve one clear purpose.

**Implication.** Reject “utility piles” that accumulate unrelated behaviour.

### 2.4 Scalability
Architecture supports growth in users, content, and capability without abandoning Charter duties or rewriting educational invariants.

**Implication.** Scale plans include integrity, privacy, and observability—not only throughput.

### 2.5 Maintainability
Future stewards can understand, test, and modify the system with proportionate effort.

**Implication.** Clarity, boundaries, and automated verification are architectural deliverables.

### 2.6 Observability
Runtime behaviour is inspectable: health, errors, latency, and material assistance influence can be diagnosed without guesswork.

**Implication.** Critical flows emit structured signals; silent black boxes are rejected for educationally material paths.

### 2.7 Resilience
Partial failure is expected. Critical teacher work degrades gracefully; approved artifacts are protected.

**Implication.** Timeouts, isolation, retries with care, and safe fallbacks are designed deliberately.

### 2.8 Extensibility
New educational capabilities can be added without violating invariants or collapsing modularity.

**Implication.** Extension points are intentional; open-ended sprawl is not extensibility.

### 2.9 Contract discipline
Public interfaces (human-facing workflows and machine-facing contracts) declare inputs, outputs, errors, and authority expectations.

**Implication.** Breaking changes are versioned and migrated; silent contract drift is prohibited.

### 2.10 Educational invariant enforcement
Architecture protects non-negotiables: drafts ≠ approved work; material AI influence is attributable; learner-labeling pathways are absent by design.

---

# PART III — Code Quality Standards

### 3.1 Naming
Names reveal intent in the language of the domain. Prefer ubiquitous educational and product terms over opaque abbreviations.

**Measure.** A steward unfamiliar with a module can infer purpose from names without tribal knowledge.

### 3.2 Readability
Code is written for the next responsible human. Structure, naming, and simplicity outrank clever density.

**Measure.** Reviews can explain behaviour from the code and nearby documentation without reverse-engineering rituals.

### 3.3 Documentation
Document why decisions exist, what invariants hold, and how failure is handled—especially at module boundaries and assistance surfaces.

**Measure.** Critical modules have current intent documentation; outdated docs are defects.

### 3.4 Testing
Behaviour that protects pedagogy, authority, privacy, accessibility-critical logic, and persistence of teacher work is covered by automated verification proportionate to risk.

**Measure.** Changes to critical paths include tests that would fail if invariants break.

### 3.5 Reviews
Human review examines correctness, clarity, security, accessibility impact, AI oversight integrity, and alignment with higher documents—not style alone.

**Measure.** Reviews record risk notes for educationally material changes; rubber stamps are non-compliant.

### 3.6 Refactoring
Continuous, safe improvement of structure is expected. Refactoring preserves behaviour unless change is explicit and gated.

**Measure.** Debt that blocks safe evolution is scheduled; known hazard without plan is non-compliant.

### 3.7 Error handling
Errors are typed, actionable, and safe. User-facing failures obey UX honesty (PRIMA-DOC-005). Internal failures are observable.

### 3.8 Dependency discipline
External dependencies are justified, minimized, and monitored for security and stewardship risk. Convenience libraries that compromise invariants are rejected.

---

# PART IV — AI Engineering Standards

These standards implement PRIMA-DOC-004 in engineering practice. They remain technology-agnostic.

### 4.1 Instruction architecture
Requests to assisting intelligence are structured artifacts: purpose, educational constraints, inputs, output shape, and refusal conditions. Ad-hoc unstructured instruction sprawl is prohibited for material counsel.

**Duty.** Instruction packages are reviewable, versionable, and testable.

### 4.2 Evaluation
Material AI capabilities have evaluation suites covering pedagogical relevance, dignity risks, bias-sensitive cases, explainability presence, and unsafe outputs.

**Duty.** Evaluation precedes deployment and continues after change.

### 4.3 Guardrails
Technical controls prevent prohibited behaviours: diagnosis/labeling patterns, silent commitment, hidden influence on approved work, and manipulative urgency.

**Duty.** Guardrails fail closed for high-risk classes of harm.

### 4.4 Validation
Outputs are validated against contracts and educational constraints before presentation as material counsel (shape, required rationale fields, safety checks).

**Duty.** Invalid output is not shown as trustworthy recommendation.

### 4.5 Fallback mechanisms
When assistance is unavailable, uncertain, or unsafe, the system falls back to teacher-controlled flows without coercion or data loss.

**Duty.** Fallback preserves the ability to teach and author manually.

### 4.6 Human approval
Engineering enforces teacher approval before educational use. Drafts cannot silently promote to approved state via timeouts, batch jobs, or defaults of neglect.

**Duty.** Commitment points are explicit in workflow and data state.

### 4.7 Explainability artefacts
Material recommendations persist or present the educational rationale elements required by PRIMA-DOC-004 (what / why / benefit / trade-offs / teacher actions).

**Duty.** Missing rationale blocks material counsel paths.

### 4.8 Provenance and distinctness
AI-influenced drafts are distinguishable from approved work in state and presentation contracts.

### 4.9 Uncertainty handling
Low confidence and known limits are representable. Fabricated certainty is an engineering defect.

### 4.10 Change control for intelligence behaviour
Changes to instruction architecture, models of influence, or guardrails follow review under the AI Review Framework (PRIMA-DOC-004 Part XI) and Quality Gates herein.

---

# PART V — Security Standards

### 5.1 Authentication
Identities of actors are verified before privileged action. Session and credential handling follow secure defaults.

### 5.2 Authorization
Permissions follow least privilege and role-appropriate access. Pedagogical commitment and administrative power are not conflated casually.

### 5.3 Encryption
Sensitive data is protected in transit and at rest according to duty-of-care standards appropriate to educational trust.

### 5.4 Auditability
Security-relevant and pedagogically material actions (especially approvals, exports, permission changes) are attributable and reviewable.

### 5.5 Least privilege
Services, humans, and automated agents receive only the access required for their duty—no ambient superpowers by convenience.

### 5.6 Secure defaults
Default configurations are safe. Insecure modes require explicit, justified enablement and are never the path of least resistance.

### 5.7 Data protection alignment
Security engineering enforces data minimization and purpose limitation (PRIMA-DOC-004 Part IX). Learner-related data, where present, receives heightened care.

### 5.8 Threat and abuse resistance
Designs anticipate misuse: injection into assistance inputs, privilege escalation, unauthorized export, and tampering with approved artifacts.

### 5.9 Incident readiness
Security incidents have defined detection, containment, communication, and recovery expectations.

### 5.10 Gate rule
Known critical vulnerabilities on release candidates block deployment.

---

# PART VI — Performance Standards

### 6.1 Reliability
Critical teacher jobs complete correctly under normal conditions. Correctness outranks speed theatre.

### 6.2 Availability
Core authoring and recovery paths remain available within declared service expectations. Degraded modes remain usable for essential craft.

### 6.3 Latency
Interactive flows respond within professional tolerance. Long operations show honest waiting states (PRIMA-DOC-005) and do not freeze authorship silently.

### 6.4 Scalability
Capacity planning matches expected educational usage patterns without sacrificing observability or safety controls.

### 6.5 Monitoring
Health, error rates, latency, and saturation are monitored for critical services. Alerts are actionable and proportionate.

### 6.6 Recovery
Backup, restore, and rollback capabilities protect teacher work. Recovery procedures are tested, not assumed.

### 6.7 Resilience under partial failure
Dependency failure isolates impact. Assistance outages must not corrupt approved work or block all manual craft.

### 6.8 Performance budgets for critical paths
Material teacher journeys have explicit performance expectations; regressions are treated as defects when they harm calm professional use.

### 6.9 Measure rule
Performance claims are evidenced by observation under representative conditions—not by optimism.

---

# PART VII — Release Standards

### 7.1 Definition of Done
A change is done only when:
1. Educational purpose remains intact (or is explicitly out of scope with no false claims)  
2. Teacher authority and AI oversight invariants hold where relevant  
3. UX critical-path expectations are met for changed surfaces  
4. Automated verification for touched risk areas passes  
5. Security and privacy duties for the change are satisfied  
6. Observability for new failure modes exists  
7. Documentation of intent/invariants is updated  
8. Rollback or safe revert path is identified  

### 7.2 Quality Gates (mandatory)
Releases that affect educational capability must pass applicable gates:

| Gate | Blocks when |
|------|-------------|
| **Pedagogical Gate** | Educational integrity, dignity, or intention fidelity is weakened |
| **AI Gate** | Oversight, explainability, or prohibited-behaviour protections fail |
| **Experience Gate** | Critical-path clarity, calm, or accessibility regressions occur |
| **Security Gate** | Authentication, authorization, encryption, or critical vulnerability duties fail |
| **Reliability Gate** | Persistence of teacher work, recovery, or critical availability is unsafe |
| **Governance Gate** | Higher-document conflicts remain unresolved |

### 7.3 Regression testing
Changes include regression coverage for previously protected behaviour on critical paths. AI evaluation suites regress material counsel behaviour.

### 7.4 Documentation
Release notes and steward documentation describe user-visible behaviour and invariant-impacting changes in plain professional language.

### 7.5 Deployment
Deployment is controlled, attributable, and reversible in principle. Educationally material releases are not informal hot-patches without gate discipline.

### 7.6 Rollback
Rollback or forward-fix recovery is planned before deployment of high-impact changes. Approved teacher artifacts must not be sacrificed to convenience.

### 7.7 Post-release stewardship
Material releases have monitoring attention and a clear owner for incident response during stabilization.

### 7.8 Decision rule
If any mandatory gate fails → do not release.  
If Dual Value is claimed but unverified for a major capability → return to product/pedagogy review.  
If removing the change would improve trust or safety → do not ship it.

---

# Engineering Commitments (summary)

1. **Pedagogy constrains architecture**  
2. **Boundaries beat tangles**  
3. **Invariants are enforced, not hoped**  
4. **Assistance is gated by approval and explanation**  
5. **Secure by default; least privilege always**  
6. **Observe, recover, roll back**  
7. **Done means gated—not merely merged**  

---

# Closing

Engineering excellence in PRIMA is measured by whether teachers can rely on the studio tomorrow—calmly, safely, and under their own authority—while learners remain protected from stigma and silent automation.

Build systems that deserve educational trust.  
Refuse cleverness that cannot be stewarded.

---

**End of Engineering Standards (PRIMA-DOC-006)**  
**Mandatory for every software component · interface contract · AI service · infrastructure decision**

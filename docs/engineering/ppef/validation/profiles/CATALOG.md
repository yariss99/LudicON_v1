---
Status: Official — PVP Profiles Catalog
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PVC-001 v2.0  
Historical Spec: PVC-004
Last Updated: July 2026
---

# Validation Profiles Catalog

Authoritative catalog per PVC-001 v2.0 §6. Effective RuleSets are composed per PVC-001 §6.3.

| Profile Identifier | Canonical Name | Lifecycle | Version | Owner | Parent | Included Rule Sets (symbolic) | Excluded | Execution Order | Execution Mode | Severity Threshold | Blocking Policy | Repository Location |
|--------------------|----------------|-----------|---------|-------|--------|-------------------------------|----------|-----------------|----------------|--------------------|-----------------|---------------------|
| PVP-FOUNDATION | Foundation Profile | Active | 1.0.0 | CSA | — | PVC-R001…R004; PPS-V01…V08 | — | dependency-then-priority | sequential | Low | Critical, High | `profiles/CATALOG.md` |
| PVP-ENGINEERING | Engineering Profile | Active | 1.0.0 | CSA | PVP-FOUNDATION | + PVC-R005…R010; PPS-V09…V10 | — | dependency-then-priority | hybrid | Low | Critical, High | `profiles/CATALOG.md` |
| PVP-GOVERNANCE | Governance Profile | Active | 1.0.0 | CSA | PVP-ENGINEERING | + PVC-R011…R014; ATP/ADL imports; PVL-6 focus | — | dependency-then-priority | hybrid | Low | Critical, High | `profiles/CATALOG.md` |
| PVP-REPOSITORY | Repository Profile | Active | 1.0.0 | CSA | PVP-FOUNDATION | PVC-R001, R009, R010, R011 | — | dependency-then-priority | sequential | Low | Critical, High | `profiles/CATALOG.md` |
| PVP-RELEASE | Release Profile | Active | 1.0.0 | CSA | — | Union applicable Foundation/Engineering/Governance/Repository | — | PVL-strict | hybrid | Low | Critical, High, Medium | `profiles/CATALOG.md` |
| PVP-CERTIFICATION | Certification Profile | Active | 1.0.0 | CSA | PVP-RELEASE | + PVC-R015; pin Rule Versions | — | PVL-strict | sequential | Low | Any Fail | `profiles/CATALOG.md` |
| PVP-DEVELOPMENT | Development Profile | Active | 1.0.0 | CSA | PVP-FOUNDATION | PVC-R001, R002 (+ optional R003…R010) | — | dependency-then-priority | sequential | Low | Critical | `profiles/CATALOG.md` |
| PVP-EXPERIMENTAL | Experimental Profile | Active | 1.0.0 | CSA | — | Declared experimental set | — | dependency-then-priority | parallel-independent | Advisory | None | `profiles/CATALOG.md` |

**Note:** `PVP-RELEASE` computes union from target-applicable families at composition time; Conflicts With ⇒ load Fail.

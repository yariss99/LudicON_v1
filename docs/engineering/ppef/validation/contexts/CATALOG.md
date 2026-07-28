---
Status: Official — Validation Contexts Catalog
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PVC-001 v2.0  
Historical Spec: PVC-005
Last Updated: July 2026
---

# Validation Contexts Catalog

| Context Identifier | Canonical Name | Lifecycle | Default Profile seed | Target Audience | Repository Scope |
|--------------------|----------------|-----------|----------------------|-----------------|------------------|
| VCTX-DEVELOPMENT | Development | Active | PVP-DEVELOPMENT | Authors, Agents | Local / any PPEF draft |
| VCTX-AUTHORING | Authoring | Active | PVP-FOUNDATION | Authors | Prompt drafts |
| VCTX-REVIEW | Review | Active | PVP-FOUNDATION + Governance subset | Reviewers, CSA | Pre-Approval artefacts |
| VCTX-ENGINEERING | Engineering | Active | PVP-ENGINEERING | EL, CSA, Agents | ES / engineering prompts |
| VCTX-GOVERNANCE | Governance | Active | PVP-GOVERNANCE | CSA, PO | PPS/PAP/ADL artefacts |
| VCTX-REPO-AUDIT | Repository Audit | Active | PVP-REPOSITORY | Agents, CSA | Indexes, registries, paths |
| VCTX-RC | Release Candidate | Active | PVP-RELEASE | EL, CI | Pre-release trees |
| VCTX-PROD-RELEASE | Production Release | Active | PVP-RELEASE | CI, CSA | Official merge |
| VCTX-CERTIFICATION | Certification | Active | PVP-CERTIFICATION | CSA | Certified elevation |
| VCTX-MAINTENANCE | Maintenance | Active | PVP-ENGINEERING | EL, Agents | Patch/clarify |
| VCTX-MIGRATION | Migration | Active | PVP-REPOSITORY + PVP-ENGINEERING | CSA, EL | Migration paths |
| VCTX-EMERGENCY | Emergency | Active | PVP-FOUNDATION | CSA | Hotfix + ADR follow-up |

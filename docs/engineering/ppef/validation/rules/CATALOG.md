---
Status: Official — PVF Rules Catalog (PVRS)
Version: 1.0
Owner: LUDI ON Chief System Architect / PPEF
Depends On: PVC-001 v2.0  
Historical Spec: PVC-002
Last Updated: July 2026
---

# Validation Rules Catalog

Authoritative fielded catalog per PVC-001 v2.0 §5.  
Imported families remain defined in source specs; native PVC-R\* rules are fully specified below.

## Imported families

| Rule ID prefix | Source | Category | Primary PVL | Lifecycle |
|----------------|--------|----------|-------------|-----------|
| PPS-V01…V10 | PPS-001 | VRC-STR / VRC-GOV | PVL-1 / PVL-6 | Active |
| APPL-V01…V08 | PPS-002 | VRC-GOV | PVL-6 | Active |
| PMM-I01…I08 | PPS-004 | VRC-META | PVL-2 | Active |
| PO-I01…I08 / PO-P01…P06 | PPS-005 | VRC-ONT | PVL-3 | Active |
| PSM-I01…I08 | PPS-006 | VRC-SEM | PVL-4 | Active |
| ATP-R01…R15 | PAP-004 | VRC-GOV / VRC-SEM | PVL-4 / PVL-6 | Active |
| ADL-C01…C12 | ADL-001 | VRC-GOV | PVL-6 | Active |

## Native rules PVC-R001…R015

| Rule Identifier | Canonical Name | Description | Purpose | Category | Severity | Priority | Validation Scope | Preconditions | Validation Logic | Expected Result | Failure Conditions | Resolution Guidance | Dependencies | References | Owner | Lifecycle | Version |
|-----------------|----------------|-------------|---------|----------|----------|----------|------------------|---------------|------------------|-----------------|--------------------|--------------------|--------------|------------|-------|-----------|---------|
| PVC-R001 | Structure Complete | Checks mandatory PPS-001 sections | Structural integrity | VRC-STR | Critical | 10 | Prompt | Target is serialized Prompt | All PPS-001 §4 sections present and non-vacuous | Pass | Missing/empty required section | Complete sections | None | PPS-001 §4 | CSA | Active | 1.0.0 |
| PVC-R002 | Metadata Complete | Checks mandatory metadata | Identity integrity | VRC-META | Critical | 20 | Prompt | — | Identifier, Version, Owner, Status, Family, Category present | Pass | Any required metadata missing | Add metadata | Extends PVC-R001 | PPS-001 §9 | CSA | Active | 1.0.0 |
| PVC-R003 | Single Owner | Enforces one Owner | Accountability | VRC-META | Critical | 30 | Prompt | — | Exactly one Owner | Pass | 0 or >1 Owners | Assign single Owner | Related PMM-I01 | PPS-004 | CSA | Active | 1.0.0 |
| PVC-R004 | Primary Deliverable | One primary deliverable | PMM deliverable invariant | VRC-META | High | 40 | Prompt | — | Exactly one primary Deliverable declared | Pass | None/ambiguous primary | Declare single primary | Related PMM-I03 | PPS-004 | CSA | Active | 1.0.0 |
| PVC-R005 | Canonical Terms | Controlled vocabulary | Ontology integrity | VRC-ONT | High | 50 | Prompt, Artifact | — | Terms ∈ PPS-005 glossary | Pass | Undefined term | Replace with Canonical Name | Related PO-C01 | PPS-005 §7 | CSA | Active | 1.0.0 |
| PVC-R006 | No Semantic Cycle | Acyclic dependency graph | Semantic integrity | VRC-SEM | Critical | 60 | Prompt | Dependency graph available | DEPENDS_ON/REQUIRES acyclic | Pass | Cycle detected | Break cycle | Related PSM-I01 | PPS-006 | CSA | Active | 1.0.0 |
| PVC-R007 | Reasoning Before Execution | ATP before Generation | Reasoning gate | VRC-SEM | Critical | 70 | Execution | Architectural Prompt | PAP-004 Phases 1–5 recorded | Pass | Execution without Reasoning | Complete ATP record | Requires ATP-R01 | PPS-006 PSM-I07 | CSA | Active | 1.0.0 |
| PVC-R008 | Validate Neq Approve | Split critique/authority | Security/governance | VRC-SEC | Critical | 80 | Execution | — | Validation outcome not used as Approval | Pass | Approval inferred from Validation | Separate Reviewer Approves | Related PSM-I06 | PPS-006 | CSA | Active | 1.0.0 |
| PVC-R009 | Registry Present | Active prompts registered | Repository integrity | VRC-REP | High | 90 | Prompt | Status=Active | Row exists in ppef/registry.md | Pass | Active missing | Register prompt | — | PVC-001 §15 | CSA | Active | 1.0.0 |
| PVC-R010 | Index Sync | Indexes updated | Orphan prevention | VRC-REP | High | 100 | Artifact | Repository Impact lists indexes | Declared indexes updated | Pass | Orphan / missing SPEC_INDEX when required | Synchronizes indexes | — | PPS-006 §7 | CSA | Active | 1.0.0 |
| PVC-R011 | ADR When Required | ADL gate | Governance | VRC-GOV | High | 110 | Prompt | ADL-001 scope applies | ADR id declared | Pass | Missing ADR requirement | Add ADR | Related ADL-C\* | ADL-001 | CSA | Active | 1.0.0 |
| PVC-R012 | Pattern Composition Legal | APPL composition | Governance | VRC-GOV | High | 120 | Prompt | PrimaryPattern set | Composition allowed | Pass | Prohibited composition | Fix patterns | Related APPL-C03 | PPS-002 §6 | CSA | Active | 1.0.0 |
| PVC-R013 | Grammar Deferred | Block false grammar Pass | Compatibility | VRC-CMP | Advisory | 15 | Prompt | PPS-003 Absent | No grammar Pass claimed | Pass | Grammar Pass claimed while Absent | Remove claim / await PPS-003 | Conflicts With any grammar-Pass claim | PVC-001 | CSA | Active | 1.0.0 |
| PVC-R014 | No Parallel Model | Architecture preservation | Governance | VRC-GOV | Critical | 130 | Prompt | — | No parallel model introduced | Pass | Parallel model language | Align to approved ES | Related ATP-R06 | PAP-004 | CSA | Active | 1.0.0 |
| PVC-R015 | Certification Evidence | Cert requires Pass Validation | Quality/governance | VRC-QUA | Critical | 140 | Pattern, Prompt | Certification requested | Certification references Pass Validation | Pass | Missing/Fail Validation | Re-validate | Requires prior Validation | PPS-005 PO-I05 | CSA | Active | 1.0.0 |

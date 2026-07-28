# @prima/application

**Purpose:** Application Layer — use-case handlers that accept Commands/Queries and invoke EOS Orchestration.  
**Owner:** Application Maintainers  
**PAS mapping:** L1 Application  

**Allowed dependencies:** `contracts`, `domain`, `eos` (orchestration ports).  
**Forbidden dependencies:** UI frameworks, Infrastructure concrete adapters, Engine private APIs, bypassing Orchestrator for gated pipelines.  

**Future evolution:** One handler family per constitutional Use Case / Command group.

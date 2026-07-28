# @prima/testing

**Purpose:** Shared fixtures, fakes, and contract-test helpers.  
**Owner:** Engineering / QA  
**PAS mapping:** Quality support  

**Allowed dependencies:** `contracts`, `domain` (for doubles).  
**Forbidden dependencies:** Production Infrastructure coupling; fakes that grant Teacher Approval as if production Policy passed without explicit test intent.  

**Future evolution:** Grow with contract and Engine test kits.

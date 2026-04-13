# Risk-Based Test Prioritization Matrix

## InvenTree Parts Module — QAHub AI Hackathon 2026

### Risk Assessment Methodology

**Risk Score = Likelihood × Business Impact**

| Factor | Scale | Description |
|--------|-------|-------------|
| **Likelihood** | 1 (Low) – 5 (Very High) | Probability that a defect exists or will be introduced |
| **Business Impact** | 1 (Low) – 5 (Very High) | Severity of impact if defect reaches production |
| **Risk Score** | 1–25 | Combined risk rating |

**Priority Mapping:**
- **Critical** (Score 16–25): Must pass before any release
- **High** (Score 9–15): Must pass before production deployment
- **Medium** (Score 4–8): Should pass, can be deferred with risk acceptance
- **Low** (Score 1–3): Nice-to-have, cosmetic or edge cases

---

### Risk Matrix

| Priority | Module/Area | Risk Description | Impact | Likelihood | Score | Test Cases | Coverage % | Execution Phase |
|----------|-------------|-----------------|--------|------------|-------|------------|------------|-----------------|
| **Critical** | Part CRUD — Create | Data loss: parts not saved correctly | 5 | 4 | 20 | TC-001..010, CRT-01..08 | 100% | Phase 1 |
| **Critical** | Part CRUD — Read | Incorrect data displayed to users | 5 | 3 | 15 | TC-015..016, RD-01..05 | 100% | Phase 1 |
| **Critical** | Part CRUD — Update | Data corruption on edit | 5 | 4 | 20 | TC-017..018, UPD-01..10 | 100% | Phase 1 |
| **Critical** | Part CRUD — Delete | Accidental data deletion | 5 | 3 | 15 | TC-019..020, DEL-01..05 | 100% | Phase 1 |
| **Critical** | Authentication | Unauthorized access to data | 5 | 3 | 15 | AUTH-01..05, EDGE-01..03 | 100% | Phase 1 |
| **Critical** | Field Validation | Invalid data stored in DB | 5 | 4 | 20 | TC-003..008, VAL-01..12 | 100% | Phase 1 |
| **High** | Category Hierarchy | Parts in wrong categories | 4 | 3 | 12 | TC-025..034, CAT-01..08 | 90% | Phase 2 |
| **High** | Template/Variant Relationships | Broken part relationships | 4 | 3 | 12 | TC-058..063, REL-01..04 | 85% | Phase 2 |
| **High** | Part Revisions | Revision constraints violated | 4 | 4 | 16 | TC-065..070, REL-05..08 | 90% | Phase 2 |
| **High** | BOM Management | Incorrect assembly builds | 4 | 3 | 12 | TC-070..078 | 70% | Phase 2 |
| **High** | Active/Inactive Logic | Inactive parts used in orders | 4 | 3 | 12 | TC-044..045, TC-096, UPD-04, DEL-03 | 90% | Phase 2 |
| **High** | Locked Part Restrictions | Locked parts modified | 4 | 2 | 8 | TC-046..047, TC-098..099 | 80% | Phase 2 |
| **High** | API Filtering & Search | Wrong parts returned in queries | 3 | 4 | 12 | FLT-01..10, PG-01..08 | 95% | Phase 2 |
| **High** | Schema Contract | API breaking changes undetected | 4 | 3 | 12 | SCH-01..08 | 100% | Phase 2 |
| **Medium** | Stock Tracking | Incorrect stock counts | 3 | 3 | 9 | TC-079..084 | 60% | Phase 3 |
| **Medium** | Part Parameters | Parameter data incorrect | 3 | 2 | 6 | TC-050..057 | 50% | Phase 3 |
| **Medium** | Units of Measure | Incompatible unit conversions | 3 | 2 | 6 | TC-085..089 | 40% | Phase 3 |
| **Medium** | Part Import | Failed imports lose data | 3 | 2 | 6 | TC-011..014 | 30% | Phase 3 |
| **Medium** | Pagination & Ordering | Users miss data in large lists | 2 | 3 | 6 | PG-01..08 | 95% | Phase 3 |
| **Medium** | Concurrent Edits | Race condition data corruption | 3 | 2 | 6 | TC-101, EDGE-08 | 50% | Phase 3 |
| **Low** | Part Images | Wrong thumbnails displayed | 2 | 2 | 4 | TC-090..092 | 30% | Phase 4 |
| **Low** | Related Parts | Broken links between parts | 2 | 2 | 4 | TC-093..094 | 30% | Phase 4 |
| **Low** | Attachments | Files not uploaded/downloaded | 2 | 2 | 4 | TC-095 | 20% | Phase 4 |
| **Low** | UI Cosmetics | Display issues, special chars | 1 | 3 | 3 | TC-103 | 30% | Phase 4 |
| **Low** | Performance / Stress | Slow under load | 2 | 1 | 2 | TC-104 | 10% | Phase 4 |

---

### Recommended Test Execution Order

#### Phase 1 — Smoke (Critical, ~20 min)
Must pass before proceeding. Blocks all other testing.

| Order | Test Suite | Tests | Est. Time |
|-------|-----------|-------|-----------|
| 1 | API: Authentication | AUTH-01..05 | 2 min |
| 2 | API: Parts CRUD | CRT-01..08, RD-01..05, UPD-01..10, DEL-01..05 | 5 min |
| 3 | API: Field Validation | VAL-01..12 | 3 min |
| 4 | API: Schema Contract | SCH-01..08 | 2 min |
| 5 | UI: Part CRUD (create, view, edit, delete) | TC-001..020 | 8 min |

#### Phase 2 — Core Business (High, ~30 min)

| Order | Test Suite | Tests | Est. Time |
|-------|-----------|-------|-----------|
| 6 | API: Filtering & Search | FLT-01..10 | 3 min |
| 7 | API: Pagination | PG-01..08 | 2 min |
| 8 | API: Categories | CAT-01..08, CFLT-01..05 | 3 min |
| 9 | API: Relations (variants, revisions) | REL-01..08 | 3 min |
| 10 | UI: Categories | TC-025..034 | 5 min |
| 11 | UI: Templates & Variants | TC-058..063 | 5 min |
| 12 | UI: Revisions | TC-065..070 | 5 min |
| 13 | UI: BOM | TC-070..078 | 5 min |
| 14 | UI: Active/Inactive/Locked | TC-044..047, TC-096..099 | 4 min |

#### Phase 3 — Extended (Medium, ~25 min)

| Order | Test Suite | Tests | Est. Time |
|-------|-----------|-------|-----------|
| 15 | API: Edge Cases | EDGE-01..13 | 3 min |
| 16 | UI: Stock | TC-079..084 | 5 min |
| 17 | UI: Parameters | TC-050..057 | 5 min |
| 18 | UI: Units | TC-085..089 | 3 min |
| 19 | UI: Import | TC-011..014 | 4 min |
| 20 | UI: Cross-functional flow | TC (e2e) | 5 min |

#### Phase 4 — Nice-to-Have (Low, ~15 min)

| Order | Test Suite | Tests | Est. Time |
|-------|-----------|-------|-----------|
| 21 | UI: Images | TC-090..092 | 3 min |
| 22 | UI: Related Parts | TC-093..094 | 3 min |
| 23 | UI: Attachments | TC-095 | 2 min |
| 24 | UI: Boundary/Edge | TC-100..105 | 5 min |

---

### Total Estimated Execution Time

| Phase | Priority | Time | Cumulative |
|-------|----------|------|-----------|
| Phase 1 | Critical | ~20 min | 20 min |
| Phase 2 | High | ~30 min | 50 min |
| Phase 3 | Medium | ~25 min | 75 min |
| Phase 4 | Low | ~15 min | 90 min |
| **Total** | — | **~90 min** | — |

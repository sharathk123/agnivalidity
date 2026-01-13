# TESTING CONTRACT
## EXIM Insight India – MVP

This document defines the MINIMUM testing requirements
for backend code in this repository.

Testing is mandatory.
Over-testing is forbidden.

If there is any conflict:
MASTER_PRODUCT_CONTRACT.md always wins.

---

## 1. CORE RULE (NON-NEGOTIABLE)

Every backend source file MUST have a corresponding test file.

Rule:
- No backend file without a test
- No test without a backend file

If a backend file exists without a test,
the work is considered INCOMPLETE.

---

## 2. SCOPE OF TESTING (MVP-LEVEL)

Tests MUST verify:
- Endpoint works
- Correct status code
- Correct response structure
- Deterministic output for known input

Tests MUST NOT:
- Test framework internals
- Test styling or UI
- Test performance benchmarks
- Mock entire application layers unnecessarily

---

## 3. WHAT REQUIRES A TEST

The following backend files REQUIRE tests:

- API route files
- Service / logic files
- Query / repository files
- Risk computation logic
- Report assembly logic

Config files do NOT require tests.

---

## 4. TEST TYPES (ALLOWED)

Allowed:
- Unit tests
- Lightweight integration tests (FastAPI TestClient)

Forbidden:
- End-to-end browser tests
- Load tests
- Chaos tests
- Snapshot-heavy tests

---

## 5. TEST TECH STACK (LOCKED)

- pytest
- FastAPI TestClient
- SQLite (in-memory or test DB)

No paid tools.
No cloud services.

---

## 6. FILE NAMING CONVENTION (STRICT)

For every backend file: `path/to/[filename].py`
The corresponding test file MUST be: `path/to/test_[filename].py`

---

## 7. TEST CONTENT RULES

Each test file MUST include at least:

1. One happy-path test
2. One invalid-input test (e.g. Valid HS + Country → 200 OK, Missing HS → 404/400 error)

---

## 8. DATABASE RULES FOR TESTS

- Tests MUST NOT modify production DB
- Use in-memory SQLite or test DB
- Schema must match DATABASE_SCHEMA.md
- No schema mutations allowed

---

## 9. AGENT BEHAVIOR RULE (CRITICAL)

Agents MUST:
- Write the test file in the SAME task
- Treat code without tests as unfinished
- Mention test coverage explicitly in reporting

Agents MUST NOT:
- Say “tests can be added later”
- Skip tests due to MVP scope
- Combine multiple files into one test

---

## 10. REPORTING REQUIREMENT

After implementing a backend file,
agents MUST report:
- Backend file created
- Test file created
- What the test validates

No other reporting is allowed.

---

## 11. FAILURE CONDITION

If:
- A backend file is created
- And no test exists

Then:
❌ The task has FAILED
❌ The change must be rejected

---

END OF TESTING CONTRACT

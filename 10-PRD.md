# 10-PRD.md: EXIM Insight India (MVP)

## 1. Problem Statement
Indian exporters, especially SMEs, struggle to find consolidated information regarding:
- Accurate HSN codes for their products.
- Applicable export incentives (RoDTEP, Duty Drawback).
- Mandatory certifications and compliance requirements.
- Country-specific risks.

Currently, this data is scattered across multiple government portals (DGFT, ICEGATE, CBIC).

## 2. Target Audience
- New Indian Export-Import businesses.
- Logistics providers looking for quick compliance checks.
- Trade consultants.

## 3. Core Features (Scope)
### Phase 1: Search & Intelligence (MVP)
1. **HSN Search Engine**: Full-text search to find 4, 6, and 8-digit HSN codes.
2. **Incentive Calculator**: Display RoDTEP and Duty Drawback rates for a given HSN.
3. **Compliance Checklist**: Rule-based engine to list mandatory documents (e.g., APEDA for spices, Coffee Board for coffee).
4. **Export Risk Profiler**: Basic risk indicators (Rule-based) for specific countries.

## 4. Non-Functional Requirements
- **Zero Cost**: No paid APIs (except free tiers if absolutely necessary).
- **Local-First**: Works offline (except for external deep links).
- **Explainable**: All compliance rules must cite the source (e.g., "As per DGFT Notification 2024").

## 5. Success Metrics
- Search result accuracy for top 50 Indian export commodities.
- Page load time < 2s on local environment.
- Successful deployment to free-tier production.

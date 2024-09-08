+++
title = "Embracing Healthcare Interoperability during Pandemic with TIBCO Cloud Integration"
description = "A system to show how healthcare players (health insurers, CMS, etc.,) can meet the healthcare interoperability mandate by following the modern Integration patterns."
date = "2019-08-23"
aliases = ["healthcare", "api", "api-management"]
author = "Akash Mahapatra"
tag = ["api", "api integration", "api management", "fhir", "healthcare innovations"]
+++

# Embracing Healthcare Interoperability during Pandemic with TIBCO Cloud Integration

The World Health Organization (WHO) officially declared the SARS-CoV-2 outbreak a Public Health Emergency of International Concern on January 30, 2020, and a global pandemic on March 11, 2020. And since then, the way we live has changed immeasurably as the pandemic has brought to light the importance of technology, especially in data-sharing, analytics, and predictive modeling, leading to new communication means and skyrocketed need for computing resources. Remote work is the new normal. Most of us are at home, using tools like Zoom, Teams, and Slack to stay in touch with family, friends, and colleagues.

Healthcare providers and hospitals are overwhelmed and struggling to render quality care. Limited access to patient health records is leading to a delay in timely intervention and administrative hassles. The current model of exchanging healthcare information involves physical mails and faxes. It is imperative to remove this bottleneck so that medical information can be exchanged seamlessly, enabling providers to make better clinical decisions and empower patients to access their medical information.

---

On March 9, 2020, the Centers for Medicare & Medicaid Services (CMS) announced the Final Rule for Interoperability and Patient Access. The intent of this Rule which affects all CMS-regulated health insurance plans, such as Medicare Advantage, Medicaid, Children Health Insurance Plan (CHIP), and Quality Health Plan (QHP) issuers on Federally-facilitated Exchanges (FFE), is to give patients full access and control of their health records electronically via mobile apps of the patients’ choice. The Rule mandates that these payers make two Application Program Interfaces (APIs) available by January 1, 2021 (plus a 6-month period where compliance will not be enforced) to third-party app developers so that these developers can create mobile apps which patients can choose to use.

{{< figure src="/images/healthcare/healthcare1.webp" alt="The rule for Interoperability and Patient Access" caption="The rule for Interoperability and Patient Access">}}

These APIs (using Health Level 7® (HL7) Fast Healthcare Interoperability Resources® (FHIR) 4.0.1) include the following:
- **Patient Access API** — which allows patients to easily access their claims and encounter information including costs and a defined subset of their clinical information.
- **Provider Directory API** — which makes the plans’ provider directory information publicly available.

This Rule doesn’t just require one to write an API or two, it is much more.
There are a number of preparation steps that are needed in order to build these APIs:
- Managing data
- Process Orchestration
- [FHIR](https://hl7.org/fhir/R4/) (Fast Healthcare Interoperability Resources) Server & Repository
- Managing APIs

FHIR, a specification, based on modern RESTful approaches makes it easier for healthcare entities to exchange information that is specific, well defined, and ubiquitously understood.

We at **TIBCO’s Global Innovation Center** recently built a system to show how payers (health insurers, CMS, etc.,) can meet the healthcare interoperability mandate by following the above steps.

---

### System Architecture

{{< figure src="/images/healthcare/healthcare-arch.webp" caption="Solution Architecture">}}

The solution takes care of the following:
- Data Entitlement and Governance of Patient and Provider Datasets using Data Virtualization and Master Data Management — Unifies versions across all data sources & types
- Reference Data Management for FHIR Terminologies — Clean, accurate & secure data policies & procedures
- Rapid transformation of clinical records to FHIR Resources, HL7 message to FHIR Resource, FHIR Resource to HL7 message for enabling Patient Access API and Provider Directory API
- Persisting FHIR resources in FHIR Server Repository
- API Management of Patient Access API and Provider Directory API — Create/host/manage APIs & provide a developer portal

---

### Business Impact

TIBCO Cloud Integration (TCI) provides an Interoperability Platform that is complete healthcare IT solution to will help you build a solid foundation for robust, flexible, scalable, and FHIR compliant applications with:

- Ease of Integration — quick and secure integration with backend applications along with HL7 FHIR plug-in providing schemas and out of the box encoding, validation, and CDS functionalities, pre-built maps accelerate data format conversions.
- Reduced cost and time to market — tooling for rapid development and deployment of FHIR applications, accelerate developer and third party onboarding with an intuitive and self-service developer portal.
- Data Accessibility — provide Data-As-A-Service for complete, unified, and trusted view of healthcare business data, add business context to your data, complete data lifecycle management, PHI protection, and HIPAA compliance.
- Security —
    - ISO 27001:2013 Certificate for Information Security Management System
    - Data Security: authentication, authorization, encryption, and masking, leverage your existing security investments (LDAP, Active Directory and Kerberos), standards (SAM, NTLM, TLS, and WSS), and policies for secure access
    - API Security: API Key, API Key+Hash (MD5 or SHA1), OAuth2, and SAML for LDAP and AD integration

---

FHIR standard’s modular approach and emphasis on the latest web technologies have the potential to lower the barrier for achieving meaningful interoperability in healthcare. The widespread adoption of interoperability would promote care coordination, better health outcomes, and quality measures. Physicians can make data-driven interventions, improving care, reducing medical spending waste, and errors. Patients can make informed decisions about their healthcare needs. With the TIBCO Interoperability platform provided by TCI, businesses can accelerate their healthcare interoperability journey with the right tools and holistic approach.
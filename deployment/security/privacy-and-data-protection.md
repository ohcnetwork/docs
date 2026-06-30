---
sidebar_position: 2
title: Privacy & data protection
---

# Privacy and data protection

The records Care holds — identities, diagnoses, medications, encounters — are
among the most sensitive personal data there is. [Data security](./data-security.md)
keeps that data safe from attackers; **privacy and data protection** govern how
you collect, use, share, retain, and give people control over it. Both are
required to run an EMR responsibly.

This page is a set of recommendations for operators deploying Care. They are
practices, not a compliance certification.

:::warning Not legal advice
The right requirements depend on where you operate and whom you serve. Treat this
as a starting point and confirm your specific obligations with qualified legal
counsel and your data-protection authority.
:::

## 1. Know which regulations apply

Before anything else, map the rules that govern your deployment. Health data is
specially protected almost everywhere. Common frameworks include:

- **India — [Digital Personal Data Protection (DPDP) Act, 2023](https://www.meity.gov.in/data-protection-framework)**,
  alongside sector rules for health information.
- **United States — [HIPAA](https://www.hhs.gov/hipaa/index.html)** for protected
  health information (PHI).
- **EU / EEA — [GDPR](https://gdpr.eu/)**, which treats health data as a special
  category requiring extra safeguards.

Identify which apply, who the data controller and processors are, and what each
regime requires for consent, retention, breach notification, and the rights of
the people whose data you hold.

## 2. Establish a lawful basis and capture consent

- Process patient data only on a **lawful basis** (consent, care delivery, legal
  obligation), and apply **purpose limitation** — use data only for what it was
  collected for.
- Record patient **consent** explicitly, and make it auditable and revocable.
  Care models consent as a first-class clinical record — see the
  [Consent concept](/concepts/clinical/consent) for what it captures and how it
  is represented.
- Be transparent: tell patients what is collected, why, who can see it, and how
  long it is kept.

## 3. Minimize and retain deliberately

- **Collect only what you need.** Every extra field is extra risk; avoid
  capturing data you have no clear use for.
- **Define retention and deletion policies.** Decide how long each class of data
  is kept and on what basis, then enforce it — archive or purge data that is past
  its retention window rather than keeping it indefinitely.
- **Plan for deletion requests** so a record can be removed or anonymized when a
  patient withdraws consent or the law requires it.

## 4. Control and govern access

Privacy depends on the right people — and only the right people — seeing each
record.

- **Enforce role-based access control and least privilege.** Grant each user the
  narrowest role that lets them do their job. Care's roles and permissions are
  described under [Access control](/concepts/access-governance/access-control).
- **Scope access to the right boundary.** Care structures access around
  [organizations](/concepts/access-governance/organization) and
  [facility organizations](/concepts/access-governance/facility-organization);
  use them so users only reach the patients and facilities they are responsible
  for.
- **Review access regularly** and revoke it promptly when roles change or people
  leave.

## 5. Make access auditable and accountable

- **Log access to patient data** — who viewed or changed which record, and when —
  and retain those logs so access can be reviewed and investigated.
- **Name an accountable owner** (a data protection officer or equivalent)
  responsible for privacy in your deployment.
- **Keep records of processing**: what data you hold, why, where it lives, and who
  it is shared with.

## 6. Honor patient rights

Most data-protection regimes give people rights over their own data. Have a
documented process to service requests for:

- **Access** — a copy of the data you hold about them.
- **Correction** — fixing inaccurate records.
- **Erasure** — deletion or anonymization where applicable.
- **Portability** — their data in a usable, machine-readable form.

Define who handles these requests, how identity is verified, and the timeline you
commit to.

## 7. De-identify data for secondary use

Analytics, dashboards, research, and model training rarely need identifiable
patient data.

- **Anonymize or pseudonymize** data before it leaves the clinical system for
  reporting or analytics (for example, dashboards built on Metabase).
- **Separate duties** so that analytics access does not become a back door to
  identifiable records.
- **Minimize exposure** — aggregate where possible, and never surface direct
  identifiers in a context that does not strictly require them.

## 8. Secure the data and the supply chain

- **Apply the technical controls** in [Data security](./data-security.md) —
  encryption in transit and at rest, network isolation, encrypted backups, and
  hardened access paths underpin every privacy commitment here.
- **Vet third parties.** Cloud providers, hosting partners, and any
  [Care plugins](/contributing/plugins) that touch patient data are processors —
  put data-processing agreements in place and do due diligence before trusting
  them with data.

## 9. Prepare for incidents

- **Have a breach-response plan** before you need it: how an incident is detected,
  contained, assessed, and communicated.
- **Know your notification obligations** — most regimes require notifying the
  authority and affected individuals within a defined window. Build the contacts
  and timelines into the plan in advance.

## Next steps

Pair these practices with the technical controls in
[Data security](./data-security.md), and revisit both whenever your deployment,
your data flows, or your regulatory environment changes.

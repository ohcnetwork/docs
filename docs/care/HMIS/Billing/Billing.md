# Billing Module

This folder contains documentation for the **Billing** section of the HMIS (Hospital Management Information System) built with FHIR-inspired design principles.

The goal of these documents is to help both **developers** (for integration and validation logic) and **hospital billing staff** (for understanding workflows) navigate and use the billing system effectively.

---

## 📁 Documentation Structure

| File | Description |
|------|-------------|
| `Account.md` | Explains how patient accounts are managed — including statuses, coverage, and linkage with charges and payments. |
| `ChargeItem.md` | Covers how billable services/items are posted to accounts, their status transitions, and validation rules. |
| `ChargeItemDefinition.md` | The source-of-truth catalog of all billable services and goods, with pricing, constraints, and usage rules. |
| `Invoice.md` | Workflow for generating, issuing, and managing invoices from charge items, including partial billing and cancellations. |
| `PaymentReconciliation.md` | Documentation on recording and applying payments to invoices/accounts, including bulk insurance payments. |
| `Notes.md` | Additional guidelines, clarifications, or decisions around the billing logic and implementation. |
| `Readme.md` | You are here — overview of this documentation folder. |

---

## 📌 Guidelines for Use

- **For Developers**:
  - Use this to implement frontend validations, enforce backend rules, and understand field relationships and status transitions.
  - Refer to flowcharts and step-by-step sections to implement the UI in sync with billing logic.

- **For Staff and Admins**:
  - Refer to individual module docs to understand workflows such as creating invoices, posting charges, reconciling payments, etc.
  - Use this as a training/reference tool for new billing operators.

---

## 🧭 Entry Points

1. Start with `Account.md` — it is the anchor for billing operations.
2. Move to `ChargeItem.md` and `ChargeItemDefinition.md` to understand how charges work.
3. Review `Invoice.md` for generating bills.
4. Go through `PaymentReconciliation.md` to handle payments.



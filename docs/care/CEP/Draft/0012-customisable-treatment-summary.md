# CEP-12: Customisable Treatment Summary in CARE

## Overview

The **Treatment Summary** in CARE is a critical artifact used by healthcare providers to understand a patient’s history, interventions, and progress. Given the varying needs of facilities, a *customisable treatment summary* feature is proposed to offer flexibility and personalization at the **facility level**.

This proposal outlines an iterative enhancement plan in **four versions**, each building upon the previous to support increasing levels of configurability.

Configuration data will be stored as a **facility flag**, ensuring the settings are scoped locally and do not impact other facilities.

---

## 🔧 Version 1: Selecting Questionnaires / Questions

### Objective
Allow facilities to define **which data points from questionnaires** appear in the treatment summary.

### Features
- Users can select:
  - **Entire questionnaires**, or
  - **Individual questions** within questionnaires
- Each selected item becomes a **"treatment summary item"**
- For each item, users can choose *how many data points* to display, using one or more of the following filters:
  1. **First `n` data points**
  2. **Last `n` data points**
  3. **Within specified date ranges** (supports multiple ranges)
  4. **Exclude specific date ranges** (supports multiple ranges)

---

## 🧩 Version 2: Drag-and-Drop Layout Builder

### Objective
Introduce **layout control** for better visual organization of the summary.

### Features
- Implement a **12-column grid layout system**
- Users can:
  - **Drag and drop** treatment summary items
  - **Resize** items based on grid columns (e.g., 3-column vs. 6-column width)
- Allows arrangement by *clinical importance* or *user preference*

---

## 🔍 Version 3: Selecting Fields from Encounter / Patient

### Objective
Support inclusion of **standardized fields from core models** like `Patient` and `Encounter`.

### Features
- Users can add static fields such as:
  - Encounter: `start_date`, `end_date`, `encounter_type`, etc.
  - Patient: `name`, `blood type`, `age`, `gender`, etc.
- Fields can be **placed anywhere** using the drag-and-drop layout
- Enables greater **clinical utility** and personalization

---

## 📝 Version 4: Adding Custom Fields

### Objective
Provide the ability to **manually add custom fields**, either pre-filled or as placeholders.

### Features
- Users can define:
  - **Input fields** to be filled before printing (e.g., "Remarks", "Discharge Plan")
  - **Placeholder fields** to be filled post-printing (e.g., signatures, physical stamps)
- These fields **will not be tracked** by CARE’s data models
  - Proper indication will be added to inform users
- Use-cases:
  - Quick annotations
  - Offline workflows
  - Patient-facing fields

---

## Summary

| Version | Feature                                        |
|---------|------------------------------------------------|
| V1      | Questionnaire & Question selection             |
| V2      | Visual layout (drag & drop)                    |
| V3      | Core model fields (Patient / Encounter)         |
| V4      | Manual custom fields (pre/post printing)        |

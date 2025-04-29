# Payment Reconciliation

## Summary 
The **Payment Reconciliation** module is responsible for recording payments (and adjustments) that the hospital receives and matching them to the corresponding invoices or accounts. In essence, it’s how the system knows an invoice has been paid, and by whom and when. Each Payment Reconciliation entry represents a payment transaction and how that payment is allocated to one or more invoices or other receivables ([PaymentReconciliation - FHIR v6.0.0-ballot2](https://build.fhir.org/paymentreconciliation.html#:~:text=The%20PaymentReconciliation%20resource%20provides%20the,or%20%2031%20for%20example)). This is aligned with the FHIR PaymentReconciliation resource, which “provides the details including amount of a payment and allocates the payment items being paid” ([PaymentReconciliation - FHIR v6.0.0-ballot2](https://build.fhir.org/paymentreconciliation.html#:~:text=This%20resource%20provides%20the%20details,the%20payment%20items%20being%20paid)).

In a hospital billing context, payments can come from patients (cash, credit card, checks) or from insurance companies (bulk payments for multiple claims, often via electronic remittances or checks covering several patients). The Payment Reconciliation module must handle both scenarios:
- **Patient Payments:** e.g., a patient pays their bill at the cashier or online, which goes toward their invoice.
- **Insurance Payments:** e.g., an insurer sends a lump sum that covers multiple invoices (claims) for multiple patients, often with an explanation of benefits detailing how to split it.

Key points:
- A Payment Reconciliation entry will have information about the payment (date, amount, method, identifier like check # or transaction ID).
- It will list one or more **allocations** – basically, references to the invoices (or accounts) that this money was applied to, along with how much of the payment went to each ([PaymentReconciliation - FHIR v6.0.0-ballot2](https://build.fhir.org/paymentreconciliation.html#:~:text=the%20individual%20payment%20amounts%20indicated,or%20%2031%20for%20example)).
- If the payment exactly matches an invoice, there will be one allocation for that invoice covering the full amount. If one payment is split, there are multiple allocations.
- Recording a payment will update the status of invoices (like marking them balanced if fully paid) and adjust account balances accordingly.
- The module should also handle reversals or cancellations of payments (for example, if a check bounces or a credit card charge is disputed, one must remove that payment).

## Key Fields 
**Key Fields:**
- **Payment Reference/Identifier:** An ID for the payment record, often the check number, transaction ID, or an internally generated receipt number. For example, “PMT-1001” or using bank ref like “CHK123456”. This helps trace the payment in case of queries.
- **Payment Date:** The date (and possibly time) when the payment was received. If a patient pays at the cashier, that’s the current date. If processing an insurance check received by mail, it might be the date on the check or the date it was processed.
- **Payment Amount:** The total amount of money received in this payment transaction. E.g., $250.00.
- **Payment Method:** How the payment was made. Common values: *Cash*, *Check*, *Credit Card*, *Bank Transfer*, *Mobile Payment*, etc. This is important for routing (e.g., checks need check numbers, credit cards have auth codes). The UI likely has a dropdown for method.
- **Payer (Source):** Who paid. If it’s a patient payment, the payer might be the patient or a family member (could have a name field). If it’s an insurance payment, the payer is the insurance company (and maybe a specific plan or reference).
- **Payee (Recipient):** Typically the hospital organization or department that received the money. Often implicit (the hospital’s name), but in multi-organization systems might be relevant (like which clinic’s bank account it went into).
- **Allocations (Applied To):** A breakdown of how the payment was applied:
  - Each allocation entry might include:
    - Reference to an **Invoice** (or possibly directly to an Account or Charge, but invoice is the usual granularity in our case) ([PaymentReconciliation - FHIR v6.0.0-ballot2](https://build.fhir.org/paymentreconciliation.html#:~:text=the%20individual%20payment%20amounts%20indicated,or%20%2031%20for%20example)).
    - The amount of the payment applied to that invoice.
    - (If integrated with insurance claims: possibly a reference to a Claim or ClaimResponse as well, but let’s assume invoice or account).
    - A short note or code about the allocation, e.g., indicating if it was an adjustment or interest, etc.
  - For example, a $100 insurance payment might be split: $80 to invoice 1001, $20 to invoice 1002. That means two allocation lines inside this Payment Reconciliation.
  - If the payment exactly matches one invoice: one allocation of full amount to that invoice.
  - If the payment is not tied to an invoice yet (like someone pre-pays before an invoice is generated), the allocation might just reference the Account (or be left unapplied temporarily, though ideally every payment ties to something).
- **Total Allocated vs Unallocated:** The sum of allocations ideally equals the payment amount. If not, then either there is an *unallocated remainder* (money received but not yet applied to any invoice) or *overallocation* (shouldn’t happen logically). For instance, insurance might send $100 but only 95 is for known invoices, 5 might be an overpayment or to be clarified. The system should track if any part of the payment isn’t allocated.
- **Status:** The status of the payment record. Likely values: **active/posted**, **cancelled**, **draft**, **entered-in-error** (following the FinancialResourceStatusCodes) ([Claim - FHIR Implementation Guide for ABDM v6.5.0 - NRCeS](https://www.nrces.in/preview/ndhm/fhir/r4/StructureDefinition-Claim.html#:~:text=Claim%20,state%20of%20the%20resource%20instance)). 
  - *Posted/Completed (Active):* Indicates the payment has been fully received and recorded (this is the normal state for a finalized payment). We can equate “active” to a completed payment record.
  - *Draft:* If someone started entering a payment but didn’t finish (maybe awaiting confirmation), but in practice payments are usually recorded in one go, so draft might not be heavily used.
  - *Cancelled/Reversed:* If the payment was voided (e.g., bounced check, or a credit card refund). Cancelled means the payment should no longer count. This typically would result in the corresponding invoices going back to unpaid.
  - *Entered-in-error:* If the payment entry was a mistake (e.g., recorded twice by accident). That would also effectively remove it from balances.
- **Payment Details:** Additional info depending on method:
  - If **Check**: check number, bank name.
  - If **Credit Card**: maybe last 4 digits of card, transaction auth code.
  - If **Transfer**: reference number, account number, etc.
  - If **Cash**: maybe cashier name or location.
  These might be captured in separate fields or a single notes field.
- **Notes/Comments:** Free text notes about the payment. E.g., “Patient paid $50 now, will pay rest next month” or “Insurance EOB 123456 dated 2025-04-01”.
- **Adjustment Type:** If this record also includes adjustments not actually money received (like a contractual adjustment from insurance), some systems include those as negative payment allocations or separate records. To keep it simpler, Payment Reconciliation entries should represent actual money transactions. Adjustments like write-offs can be recorded as zero-amount PaymentReconciliation with just allocations for adjustments, or as special allocation items. For now, assume payments only, but mention that insurance often comes with adjustments (insurance may pay less than billed, the difference is an adjustment that reduces invoice balance without payment).
- **Related Claim/EOB:** If tying to insurance, possibly reference to a Claim or ExplanationOfBenefit that this payment corresponds to. This helps in audit to know which claim the payment is for. Not needed in patient payments.

**Business Logic:**
- When a payment is recorded, the amount gets distributed to invoices:
  - If the user is recording a payment for a single invoice (like patient pays their bill), the system will auto-allocate full amount to that invoice (and check if it matches the invoice amount, if not, treat as partial payment).
  - If the payment is meant for multiple invoices (like an insurance bulk payment or patient paying multiple bills at once), the UI should allow selecting multiple target invoices and specifying amounts for each. The sum of allocations should equal the payment.
  - The account’s balance and each invoice’s balance need to update accordingly: subtract the paid amounts.
- If a payment fully covers an invoice, mark the invoice **balanced** (paid in full) ([OPENIMIS.FHIR.R4\Status (Invoice) - FHIR v4.0.1](https://fhir.openimis.org/ValueSet-invoice-status.html#:~:text=status%20hl7,cancelledCancelled%20the%20invoice%20was%20cancelled)). If partially, invoice remains **issued** with remaining balance.
- If a payment exceeds what was due (overpayment), the system might either hold the extra as a credit on the account (unallocated) or ask the user to adjust the allocation (maybe the patient intended to pay only what was due).
- Payment records can also represent **refunds or chargebacks** if negative amounts are allowed or by using cancellation:
  - e.g., if a refund is given, one might record a payment with a negative amount or a separate process for refunds (some systems would record a negative payment).
  - We'll keep it simpler by saying to cancel or reverse the payment rather than negative entries.
- The Payment Reconciliation acts as a receipt internally. It might also produce a receipt for the patient at point of sale: e.g., printing a “Payment Receipt” acknowledging their payment and listing what it was for.
- For insurance, one Payment Reconciliation might cover many accounts, so it’s not tied to one account like invoices are. This module must be able to cross-reference multiple accounts/invoices in one go.
- The module also likely handles **adjustments** from insurance (like contractual adjustments where the hospital agrees not to charge the difference). These might be recorded as a special kind of allocation (with no actual payment but reduces invoice balance). Some systems treat that as part of the insurance payment posting process. We can consider that an “allocation” that doesn’t correspond to received money but an adjustment amount.
- Ensuring that after posting all payments, any remaining balance on an invoice is correctly represented (which might then be billed to patient or written off).
- Payments should update the **Account** as well: since account balance is charges minus payments, adding a payment will reduce the account’s balance.
- If a Payment Reconciliation is cancelled (like a bounced check), the system should re-open those invoice balances:
  - The invoice status goes back from balanced to issued if it was fully paid by that payment.
  - If partial, increase the outstanding amount accordingly.
  - Possibly log the reason (bounced check fee maybe separate).
- There should be integrity: you shouldn’t be able to apply more money to an invoice than its amount (except if intentionally overpay, which then needs handling like credit).
- Payment Reconciliation records also help in reconciling with bank deposits (each day’s cash, check, credit totals). So you might have reports grouping payments by date/method for bank reconciliation.

## Step-by-Step User Workflows (Payment Posting)

**Recording a Patient Payment (Single Invoice, typical scenario):**
1. **Access Payment Screen:** The billing staff (or cashier) goes to record a payment. They might do this either from:
   - The **Invoice** view: e.g., viewing an issued invoice and clicking a “Record Payment” button on that screen (which will start a payment entry form linked to that invoice).
   - Or from a general **Payments** module: e.g., a “New Payment” function where they then search for the patient or invoice to apply it to.
   In either case, assume we have an invoice reference or at least an account/patient context.
2. **Enter Payment Details:** A form appears to input payment data:
   - ****Recording a Patient Payment (Single Invoice, typical scenario continued):**  
2. **Enter Payment Details:** A form appears to input the payment data:
   - **Invoice/Account Selection:** If not already pre-filled, the user selects which **Invoice** or **Account** the payment is for. (If they started from an invoice, this will be locked to that invoice).
   - **Amount:** Enter the payment amount (e.g., the patient is paying $200).
   - **Method:** Select the payment method (e.g., Cash, Credit Card, Check). Depending on choice, additional fields may appear (for check: check number; for card: transaction ID or last 4 digits).
   - **Date:** Defaults to today. They can adjust if recording a payment that was received on a different date.
   - **Payer Name:** By default the patient’s name might fill in. The staff can adjust if, say, a family member is paying on the patient’s behalf or if an insurance payment is being entered here (then would be the insurance name).
   - **Reference/Notes:** Enter any reference number or note. For example, for a check: input the check # and bank name; for credit card: an authorization code or receipt number. Notes could include “Partial payment, patient will pay rest later” or any relevant remark.
   - If the payment is less than the full invoice amount, some systems allow indicating if it’s an installment vs full settlement. Usually, just recording the amount is enough; the remaining balance will be tracked on the invoice.
3. **Apply Payment (Allocation):** Since this scenario is a single invoice, the system will allocate the entire amount to that invoice by default. The user should see something like “Apply $200 to Invoice #1234 (Total due $500).” They could adjust the allocation if they intend to split between multiple invoices (see multi-invoice scenario). Here, assume it’s just this one invoice.
   - The form might show the invoice’s outstanding amount as a reference, e.g., “Invoice #1234 – Outstanding $500. Payment $200 will leave $300 remaining.” This helps the cashier confirm the amount.
   - If the user accidentally entered more than outstanding (e.g., $600 on a $500 bill), the system should warn or require confirmation that this will result in an overpayment/credit.
4. **Save/Post Payment:** The user submits the payment. The system validates:
   - Amount > 0 (for a payment).
   - Required fields (method, etc.) are provided.
   - Allocations sum to total amount (here trivial single allocation).
   - If method is check or card, ensure reference info is entered.
   - If all good, the system creates a **Payment Reconciliation** record representing this payment.
   - It also updates the relevant invoice’s records: adds this payment allocation under that invoice.
5. **System Response:** After saving:
   - The invoice’s status/fields update. If the invoice is now partially paid (not fully covered), it remains **Issued** but might show “Paid $200, Remaining $300”. If the payment covered the invoice fully (say the patient paid $500 on a $500 invoice), the system would mark that invoice as **Balanced (Paid in Full)** automatically ([OPENIMIS.FHIR.R4\Status (Invoice) - FHIR v4.0.1](https://fhir.openimis.org/ValueSet-invoice-status.html#:~:text=status%20hl7,cancelledCancelled%20the%20invoice%20was%20cancelled)).
   - The account’s overall balance is reduced by $200 as well (since a payment was applied).
   - The Payment record is now stored and can be viewed in the Payments module or under that account’s payment history.
   - The UI likely displays a confirmation message “Payment of $200 recorded.” Often, it will also prompt to **print a receipt** for the patient.
6. **Receipt Printing:** The staff can print a **Payment Receipt** which typically includes: Hospital name, receipt number, date, patient name, amount paid, method, reference (check # etc.), invoice number it was applied to, and remaining balance if any. This is given to the patient as proof of payment.
7. **Ending Transaction:** The user’s workflow for that payment is done. If the patient only paid part, they might schedule another payment later. The invoice will remain open with the remaining balance. If paid in full, the invoice is closed out.

**Recording a Bulk/Insurance Payment (Multiple invoices scenario):**  
This is more complex, typically done by billing staff when reconciling an insurance remittance or when a patient pays multiple bills in one go.
1. **Initiate Bulk Payment:** In the Payments module, user chooses **“New Payment – Multiple Invoices”** (could be the same form but allows multiple allocations). If it’s an insurance payment, the user might input the insurance company name as the payer.
2. **Enter Total Amount and Method:** For example, an insurance sends a check of $1000 that covers 3 patients. The staff enters $1000, method “Check”, check #, date, payer “ABC Insurance Co.”.
3. **Select Invoices and Allocate:** The user then adds allocation lines for each portion:
   - They might have a list or search to add invoices by number or patient name. For each invoice they add, they enter how much of the $1000 goes to that invoice.
   - E.g., Invoice #1001: $400, Invoice #1005: $500, Invoice #1010: $100 (these sum to $1000).
   - The system could help by showing each invoice’s outstanding amount and not allowing allocation more than due. If an invoice is due $500 and user tries $600, give error or highlight.
   - If the insurance short-paid an invoice (allowed by contract), the allocation could be less than full amount, leaving some balance. Possibly the staff would then immediately record an adjustment for the remainder (maybe as another allocation line of type adjustment or they will handle that by marking that portion as insurance write-off separately).
   - The UI ensures the sum of allocations equals the total payment before allowing save.
4. **Save Payment:** Once allocations are entered, the user saves. The system creates one Payment Reconciliation record of $1000, and within it, stores the details of $400 to inv #1001, $500 to #1005, $100 to #1010.
5. **System Updates:** Each invoice referenced is updated:
   - Invoice #1001, #1005, #1010 get their paid amounts increased accordingly. If any hit full payment, mark them Balanced. Others remain issued with reduced balances.
   - All three patients’ account balances are reduced as well.
   - The Payment Reconciliation record can be retrieved later to see which invoices it covered.
   - If there was a remainder not allocated (shouldn’t be if done correctly), the system might either keep the remainder as unallocated credit or not allow it in the first place.
6. **Insurance Adjustments:** If the insurance didn’t pay an invoice in full due to contract adjustments, typically the staff would also record those adjustments. This might be done by adding an allocation line of type "adjustment" for the remaining amount on that invoice (which doesn’t tie to a payment but indicates the invoice is settled). Some systems handle this by posting a separate transaction or as part of the claim response processing. For documentation: staff could, for example, mark the remaining $50 on invoice #1001 as an adjustment which zeroes out the invoice. This could be recorded as a zero-dollar Payment Reconciliation entry or a special flag on the invoice. Implementation may vary (but the result is invoice becomes balanced with $400 paid + $50 adjusted off on a $450 bill).
7. **Confirmation:** The system confirms the bulk payment entry. The staff may then move on to next payment. They often reconcile these entries with the insurance explanation of benefits to ensure correctness.

 The flowchart above outlines the payment reconciliation process. It starts when a payment is received, followed by selecting the target invoice(s) or account and entering the payment details. The payment is then allocated to the respective invoice(s). If an invoice is fully covered by the payment, it is marked as paid (balanced); if not, it remains open with an outstanding balance. Finally, a PaymentReconciliation record is saved and the payment is reflected in the system. *Figure: Workflow for recording a payment and reconciling it with invoices.*

**Handling a Payment Reversal (Bounced check or error):**
1. Locate the Payment record (e.g., search by check number or patient).
2. Use a **“Cancel Payment”** or **“Reverse Payment”** action. The system might ask for a reason (“Check bounced due to insufficient funds”).
3. On confirmation, the Payment Reconciliation status changes to **Cancelled** (or enters an error state). The system effectively **negates the effects** of that payment:
   - The associated invoices’ balances are increased back by the amounts that this payment had covered.
   - If those invoices were marked paid, they revert to issued (not paid). If partially paid, their outstanding increases.
   - The account balance goes up accordingly.
   - Optionally log an internal note on the invoice or account about this reversal.
4. The cancelled payment record remains for audit, perhaps with a note, but is not counted in totals.

**Viewing Payment History:**
- On a patient account or invoice screen, staff can see a list of payments applied. For each payment: date, amount, method, reference. If one payment covered multiple invoices, that payment might show up in each relevant account’s history (with the portion that applied).
- There may also be a standalone Payment Reconciliation list (for all payments) where staff (like finance) can search by date range, method, etc., to do end-of-day reconciliation (e.g., total cash collected today).
- Reports can be generated, like “Daily Cash Collection Report” summing all payments by type, which should match actual cash in hand or bank deposits.


## Developer Notes (Payment Processing & Validation)
- **Data Model:** A PaymentReconciliation (PR) can be modeled with a main table (payment header) and a related table for allocations (line items):
  - Payment table: id, date, amount, method, payer, status, etc.
  - Payment allocation table: id, payment_id, invoice_id (or account_id), amount, type (payment or adjustment), note.
  - This is a one-to-many relationship (one payment, many allocations).
- **Status Handling:** Use **FinancialResourceStatusCodes** for the payment record: *active* for completed, *cancelled* for reversed, *draft* if you allow saving incomplete, *entered-in-error* for deletion mistakes ([Claim - FHIR Implementation Guide for ABDM v6.5.0 - NRCeS](https://www.nrces.in/preview/ndhm/fhir/r4/StructureDefinition-Claim.html#:~:text=Claim%20,state%20of%20the%20resource%20instance)).
- **Atomic Allocation:** Ensure that when saving a payment with multiple allocations, the entire operation is atomic. Use transactions – if any part of applying it fails (e.g., invoice not found, or amount mismatch), roll back everything, so you don’t end up with half-applied payments.
- **Validation Rules:**
  - The sum of allocation amounts must equal the payment amount (unless you allow partial allocation with remainder, but that complicates things; better to force full allocation).
  - None of the allocations should allocate more than the current outstanding on that invoice. If an invoice has $300 due and user tries to allocate $350, block or auto-trim it to $300 and maybe warn about $50 remainder.
  - Payment amount should generally not be 0 (except if using it to record pure adjustments, but those could be separate records or flagged).
  - If method is check, ensure check number is provided; if credit card, maybe gather a transaction ID.
  - The date should not be in the future (and perhaps not too far past if you want to warn, though you might back-date to when check was received).
- **Linking to Invoices/Accounts:** Ideally allocate to invoices. If a payment comes that is not specific to an invoice (say a patient gives an advance deposit), you could allow allocation to the Account without invoice. This would credit the account as a whole (like a prepayment). Later when an invoice is generated, that prepayment could be applied. Implementation: either treat it as an unallocated payment and then implement a way to apply credit to invoice, or encourage they hold money in a pseudo-invoice (some create a credit invoice). Possibly beyond current scope, but keep in mind.
- **Updating Invoice Records:** When a payment is posted:
  - Update a field on Invoice for amountPaid or outstanding balance. This avoids calculating every time. Alternatively, one can compute outstanding by invoice.total - sum(payments allocated), but storing it can improve performance for lists.
  - If `invoice.amountPaid >= invoice.total`, set `invoice.status = balanced`. Use `>=` to account for any slight overpayment scenario or float rounding.
  - If `invoice.status` was balanced and a payment is cancelled, recalc or store the new paid amount and adjust status back if needed.
- **Updating Account Balance:** Account balance is typically computed from charges - payments. If you are not storing account balance, no update needed (just compute on the fly). If you keep a running balance, then on payment posting subtract the payment amount from the account’s balance field.
- **Receipt Generation:** Similar to invoices, provide a standardized receipt template. Could reuse invoice number or generate a separate receipt number sequence for payments.
- **Audit Trail:** Log the user who recorded each payment (and who cancels any payment). Financial transactions must be audit-logged for security.
- **Concurrent Payments:** If two payments are being applied to the same invoice concurrently (rare but possible in online systems), you must avoid race conditions. E.g., both try to pay remaining $100 at same time:
  - Solutions: lock the invoice during payment allocation, or after each payment commit, check if invoice balance went negative (which indicates double payment) and handle accordingly (maybe refund one or notify staff).
  - Also ensure invoice status check is up-to-date when posting. Possibly requery the invoice's latest outstanding just before saving each allocation.
- **Partial vs Full Payment Flows:** If a payment doesn’t fully pay an invoice, consider if you need to prompt the user for next steps (like scheduling or reminding about remaining). That’s more a business workflow; technically just keep invoice open with remaining amount.
- **Insurance Payment Adjustments:** Decide how to capture adjustments:
  - Could allow an allocation line with no invoice but with an account reference and mark it as an adjustment (like -$X) to indicate a write-off. However, a better approach: treat adjustments as separate records (like a special Adjustment resource or use PaymentReconciliation with a different type code).
  - FHIR PaymentReconciliation has a concept of detail with a `type` (payment, adjustment, advance, etc.) ([Class PaymentReconciliation - HAPI FHIR](https://hapifhir.io/hapi-fhir/apidocs/hapi-fhir-structures-r5/org/hl7/fhir/r5/model/PaymentReconciliation.html#:~:text=Code%20to%20indicate%20the%20nature,contained%2C)). You could incorporate a `type` field in allocation: e.g., type = payment or adjustment. If adjustment, maybe you allow linking to an invoice and amount that reduces its balance without actual cash.
  - For simplicity, if insurer short-pays, you can directly reduce invoice total or mark something on invoice. But it's cleaner to explicitly record adjustments for transparency (so financial reports show that difference).
  - Possibly implement: Payment Reconciliation entry with amount 0 and one detail of type adjustment for invoice #X of $50. But probably easier: after posting insurance payment, user records adjustments by another interface. We won't fully detail that here.
- **Unallocated Payments:** If the system allows accepting money without applying it (like patient deposits), have a way to hold that. Maybe create a PaymentReconciliation with no invoice allocation yet (store it with a flag or temp account). Later, when an invoice is available, allow applying that credit. This is advanced; many HMIS simply apply to an invoice or create an invoice for deposit.
- **Balance Forward / Credits:** If a patient overpays and has a credit, you might either keep the credit on account or refund it. If keeping on account, you could leave a PaymentReconciliation with an unallocated portion or apply it to a special "credit invoice". Alternatively, track a negative balance on account. This area can be complex; a straightforward approach is to avoid overpayments (or treat them as prepayments for next bill).
- **Search and Reports:** Provide ability to search payments by:
  - Date range (for daily closeouts).
  - Method (for reconciling with bank statements, e.g., sum of all check payments vs sum of bank deposits).
  - Payer (find all payments by a certain insurance or patient).
  - Invoice or account (show all payments that hit a specific bill).
- **Security:** Payments involve money, so ensure only authorized roles can record or cancel payments. Possibly require dual approval for cancellations above a threshold.
- **Notifications:** Optionally, trigger notifications. E.g., when a big payment is recorded or when an invoice gets fully paid, perhaps notify relevant staff or thank patient via email, etc.
- **Integration with Accounting:** Payment records might be exported to a general ledger. For example, daily totals for cash, etc., might flow to finance. If required, categorize transactions by type for GL mapping.
- **Integration with External Systems:** If using an online payment portal, those could feed into Payment Reconciliation entries automatically. The design should accommodate creation of payments via API or automated process in addition to manual UI entry.
- **FHIR Consideration:** A PaymentReconciliation in FHIR often corresponds to an insurer’s bulk payment with allocations to claims ([PaymentReconciliation - FHIR v6.0.0-ballot2](https://build.fhir.org/paymentreconciliation.html#:~:text=The%20PaymentReconciliation%20resource%20provides%20the,or%20%2031%20for%20example)). Our usage extends it to patient payments as well. If mapping to FHIR:
  - Use `PaymentReconciliation.detail` for allocations with reference to `Invoice` (FHIR allows Invoice reference here since R5).
  - Status mapping: posted vs cancelled as discussed.
  - The payer could map to PaymentReconciliation.organization or request/response references, though FHIR might not have a direct field for payer name (in FHIR they often assume PaymentReconciliation from insurer implies the insurer is payer).
  - Might also consider using `PaymentNotice` resource in cases where needed, but for internal HMIS, PaymentReconciliation is enough.
- **Testing:** 
  - Test single invoice payment, check invoice status and balance.
  - Test underpayment, ensure remainder is correct.
  - Test overpayment scenario, see how system behaves (should ideally flag).
  - Test multi-invoice allocation: totals match, each invoice updated.
  - Test cancellation: invoice balances restored.
  - Test concurrency: two payments at once on same invoice (simulate if possible).
  - Edge: Payment amount = 0 or negative (shouldn’t be allowed except perhaps negative for refunds, which we handle via cancellation instead).
- **User Feedback:** If a user tries to record a payment and the invoice is already balanced, block it (“Invoice already paid”) to prevent confusion.
- **Linking to Patient Account:** After a payment, you might update some summary on patient account like “Last Payment: $X on [date]”. Not essential but user-friendly.
- **Partial Refunds:** If a patient requests a refund for an overpayment, one way is to record a negative payment (which many systems avoid) or simply cancel part of the payment. Possibly simpler: have a “Refund” function that creates a new PaymentReconciliation with negative amount. But implementing negative amounts can complicate sum calculations. Alternatively, treat refunds as separate processes outside PaymentReconciliation. This depends on requirements; mention for completeness.

By implementing the above, the Payment Reconciliation module will robustly handle the flow of funds in the HMIS, ensuring invoices are properly marked as paid or unpaid, and giving both staff and developers a clear view of the financial state of each account.



# Invoice

## Summary 
The **Invoice** module handles the generation of formal bills based on accumulated charges for an account. An **Invoice** is a financial document issued by the healthcare provider (hospital/clinic) to the responsible party (patient, insurance, or other payor) that lists the goods and services provided (the Charge Items) along with their quantities and prices ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=Tracking%20Financial%20information%20is%20vital,with%20their%20quantities%20and%20prices)). In simpler terms, it’s the bill that the patient or insurer receives, detailing what they are being asked to pay for. 

The Invoice pulls together all relevant Charge Items from an Account (or a subset of them for a given billing period) and calculates the total amount due. It serves as the hospital’s record of what was charged, and it’s also used by patients or insurers to process payments. In an HMIS inspired by FHIR, the Invoice correlates with the FHIR Invoice resource, which is designed for structured billing communication ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=towards%20patients,view%20on%20the%20performed%20services)). The invoice is the provider’s view of the charges, as opposed to an insurance Claim which is for payer’s adjudication purposes ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=Competing%20invoicing%20standards%20such%20as,view%20on%20the%20performed%20services)).

Key points about invoices:
- An invoice can be in different states (draft, issued, paid, etc.), reflecting its lifecycle.
- Invoices reference the account and the specific charge items included.
- Invoices typically have unique numbers for external reference, along with dates and payment terms.
- Once an invoice is issued (finalized), the charges on it are considered billed, and the invoice amount becomes a receivable for the hospital to collect from the payor.

## Key Fields and Lifecycle 
**Key Fields:**
- **Invoice Number:** A unique identifier for the invoice (often a sequential number or alphanumeric). This is what will be printed on the invoice document and used by patients or accounting to reference the bill. The system may auto-generate this when finalizing the invoice (e.g., “INV-2025-000123”).
- **Account/Patient:** A reference to the **Account** (and implicitly the patient) this invoice is for. All charges on the invoice should belong to that account. Typically, an invoice is for one account (one patient’s set of charges) ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=Reference,balanced)). (In some cases, a combined invoice could cover multiple accounts for one payer, but our scope assumes one account per invoice for simplicity).
- **Invoice Date (Issue Date):** The date the invoice is generated/finalized. This is important for payment due calculations and auditing. If an invoice is drafted on one day and finalized on another, the issue date is when it’s finalized.
- **Billing Period (Service Period):** The date range of services covered by the invoice. For example, “Services from Jan 1, 2025 to Jan 31, 2025.” If the invoice is for a hospital stay, it might be the admission to discharge dates. This field is often included on the invoice so the recipient knows which period the charges correspond to.
- **Line Items (Invoice Lines):** Each charge on the invoice becomes a line item. A line item typically includes:
  - A description of the service (from the Charge Item Definition).
  - The service date (or date range if applicable).
  - Quantity.
  - Unit price and line total. Some systems may also show any adjustments on the line (like a discount applied).
  - Optionally, a code or reference number for each line (for cross-reference).
  The invoice line items come directly from the selected **Charge Items**. If the system allows, you might combine or summarize some charges (though usually each charge is a separate line to match audit trail).
- **Subtotal, Taxes, Adjustments:** If applicable, the invoice will compute a subtotal of all line items. If there are any taxes (some jurisdictions tax certain medical services or supplies) or additional fees, those are added as separate lines or in summary. Adjustments or discounts at the invoice level (like a one-time discount or write-off) might appear as a line or summary deduction.
- **Total Amount:** The grand total the invoice recipient is responsible for. This considers all charges, plus taxes, minus any discounts. (It would not subtract payments; payments are handled separately, not on the original invoice).
- **Payor/Recipient:** Who the invoice is addressed to. Often this is the patient (for self-pay portions) or an insurance company if you’re billing them directly. The invoice might have fields like “Bill To: John Doe” or “Bill To: XYZ Insurance, Policy #12345”. In FHIR terms, there might be a `recipient` which could be an organization (insurer) or patient ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=Tracking%20Financial%20information%20is%20vital,with%20their%20quantities%20and%20prices)) ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=code%20draft%20,error%20Binding%3A%20Invoice%20Status%20%28Required)). In our HMIS, if the account has an insurance coverage as primary, the initial invoice might be addressed to the insurance.
- **Issuer (Provider):** The organization issuing the invoice (e.g., the hospital name and address). This is usually a constant (the hospital’s details) and printed on the invoice header. It might be stored or configured globally rather than per invoice, but the field exists to identify who is charging.
- **Status:** The state of the invoice in its lifecycle. The main statuses include **draft**, **issued**, **balanced**, **cancelled**, and **entered-in-error** ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=code%20draft%20,error%20Binding%3A%20Invoice%20Status%20%28Required)).  
  - *Draft:* The invoice is in preparation. It’s not yet finalized or sent out. In this state, staff can still add/remove charges or make corrections. Draft invoices are essentially internal working documents. They may not have an official number assigned until finalization, or might have a provisional identifier.  
  - *Issued:* The invoice has been finalized (approved and sent to the payor). This status indicates the invoice is now an official claim of money. According to FHIR, “issued” means the invoice has been finalized and sent to the recipient ([OPENIMIS.FHIR.R4\Status (Invoice) - FHIR v4.0.1](https://fhir.openimis.org/ValueSet-invoice-status.html#:~:text=status%20hl7,cancelledCancelled%20the%20invoice%20was%20cancelled)). At this stage, the invoice is considered outstanding debt that needs to be paid.  
  - *Balanced:* The invoice has been completely paid off ([OPENIMIS.FHIR.R4\Status (Invoice) - FHIR v4.0.1](https://fhir.openimis.org/ValueSet-invoice-status.html#:~:text=status%20hl7,cancelledCancelled%20the%20invoice%20was%20cancelled)). In other words, the balance due on the invoice is zero because payment(s) matching the full amount have been reconciled. This is essentially a terminal state indicating no further money is owed on this invoice.  
  - *Cancelled:* The invoice was cancelled and is not to be paid ([OPENIMIS.FHIR.R4\Status (Invoice) - FHIR v4.0.1](https://fhir.openimis.org/ValueSet-invoice-status.html#:~:text=status%20hl7,cancelledCancelled%20the%20invoice%20was%20cancelled)). Perhaps it was created in error or the charges were moved to another invoice. A cancelled invoice is usually not sent out, or if it was, a cancellation notice is issued. The invoice number might be retired or might reference a reason for cancellation.  
  - *Entered-in-error:* If the invoice record was a mistake (e.g., completely wrong target or duplicate entry), it can be marked as entered-in-error. This is similar to cancelled but specifically denotes a data entry error. It should not be considered a valid invoice at all. In systems, often “cancelled” covers most scenarios (entered-in-error might be used in FHIR contexts for tracking, but practically a cancelled invoice can also cover erroneous ones with an explanation).
  - *(Partial Payments?:)* Not a separate status, but it’s worth noting that if an invoice is partially paid, it typically remains in “issued” status (since it’s not fully settled, thus not balanced yet). There might be fields to track how much has been paid and what remains, but the status doesn’t change to a special “partially paid” value. Staff would look at payment records to know the outstanding balance on an issued invoice.
- **Payment Terms/Due Date:** Often invoices will say “Payment due in X days” or a specific due date (e.g., due 30 days from issue). The system might calculate a due date based on issue date plus a standard term (like 30 days). This isn’t exactly a status, but it’s an important piece of info. If the invoice is to an insurance, due date might not apply in the same way (it goes through adjudication). If to a patient, due date indicates when the patient should pay by.
- **Related References:** Possibly fields like *PaymentReconciliation reference* (if payment for this invoice has been recorded, a link to that), or *Claim reference* if this invoice was also submitted as an insurance claim. These help tie the invoice to other financial records.
- **Cancelled Reason:** If status is cancelled, a field to capture why (e.g., “Duplicate invoice”, “Charge error, invoice voided”) ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=%3CcancelledReason%20value%3D%22%5Bstring%5D%22%2F%3E%3C%21,cancellation%20of%20this%20Invoice)). This helps with audit and clarity.
- **Notes/Comments:** Any additional notes to include on the invoice, such as “Thank you for your prompt payment” or “Includes 10% discount as per management approval”. Also could include internal notes not printed, about special arrangements.

**Business Logic (Lifecycle & Rules):**
- **Drafting vs Finalizing:** Invoices can be prepared as draft, allowing staff to review and possibly get approval before issuing. While in draft, modifications are allowed:
  - Staff can add or remove line items (which corresponds to adding or removing Charge Items to the invoice). Usually, only charges that are in “billable” status and not yet invoiced can be added. 
  - They might adjust quantities or give discounts in this phase as well (for example, perhaps a manager can apply a manual discount line).
  - The invoice total is recalculated with each change.
- **Finalization (Issuing):** When staff are satisfied, they will finalize the invoice. At this point:
  - The invoice status changes to **issued**.
  - The system may assign the official invoice number (if it wasn’t assigned at creation).
  - The issue date is set (if not already).
  - All included Charge Items are marked as **billed** (their status updated, as discussed in Charge Item section).
  - The invoice becomes read-only for content; you generally shouldn’t edit line items after issuing (short of cancelling the invoice).
  - The invoice is now ready to be sent to the recipient (could be printed or electronically transmitted).
- **Posting/Printing:** Once issued, the invoice can be delivered. The system might have a function to print the invoice (generating a PDF or printout) or to send it via email. This doesn’t change the status, but it’s a crucial part of the workflow. The invoice document will list all charges and the total due.
- **Payments:** After issuance, the invoice sits in “issued” status until payment(s) are received:
  - If a payment comes in (via the Payment Reconciliation process), the invoice doesn’t immediately disappear; it just gains a record of payment. The invoice might show amount paid and remaining due.
  - When the total amount of the invoice has been paid, the system should mark the invoice as **balanced** automatically ([OPENIMIS.FHIR.R4\Status (Invoice) - FHIR v4.0.1](https://fhir.openimis.org/ValueSet-invoice-status.html#:~:text=status%20hl7,cancelledCancelled%20the%20invoice%20was%20cancelled)), indicating it’s fully settled. This could be done by the Payment Reconciliation logic (when it notices full payment).
  - Partial payments do not change the status (remain “issued”), but internal tracking of outstanding balance is updated.
- **Cancellation:** If an error is discovered on an issued invoice (e.g., a charge was wrong or the invoice was sent to the wrong payer), you may need to cancel it. Business rules:
  - Only allow cancellation if no (or minimal) payments have been applied. If payments exist, typically you can’t outright cancel; you might have to refund or reallocate payments first.
  - When cancelled, set status = cancelled, and record a cancellation reason ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=%3Cstatus%20value%3D%22%5Bcode%5D%22%2F%3E%3C%21,cancellation%20of%20this%20Invoice)). The system should also free up the underlying charge items to be billed on another invoice if appropriate. (i.e., change their status back to billable or even planned, depending on scenario).
  - Possibly generate a new invoice if needed (for correct charges). Or if the entire thing was wrong, just cancel and start over.
  - Cancelled invoices are kept for audit, but are not considered collectible.
- **Avoiding Duplicate Invoices:** The system should ensure the same charge isn’t invoiced twice. This is handled by charge status (once included on an issued invoice, a charge shouldn’t appear on another invoice). When creating an invoice, the selection of charges should exclude any that are already billed. If a user somehow attempts to include a charge that’s been billed, the system should flag it as not allowed.
- **Multiple Invoices per Account:** It’s possible to have multiple invoices for one account. For example, in a long hospital stay, they might generate interim invoices monthly, or one at discharge and then a supplementary one for late charges. The system should support picking which charges to include each time. Typically, an invoice might include all currently uninvoiced charges up to a cutoff date. If doing partial billing, the UI might allow selecting specific items or setting a date range.
- **Invoice for Insurance vs Patient:** If insurance is involved, an initial invoice might be created to send to the insurer (or an electronic claim, depending on integration). After insurer pays or responds, a secondary invoice (often called patient statement) might be created for the patient for any remaining amount. In our HMIS, the Invoice module could handle both by marking who it’s addressed to. For instance, invoice #100 to Insurance (for full charges) and after insurance adjustments, an invoice #101 to patient for copay/deductible. However, in FHIR, such coordination might use Claim/ClaimResponse for insurance and Invoice for patient billing. Here we can allow Invoice to represent any bill request.
- **Interfacing with Insurance Claims:** If the HMIS uses a separate Claim process, an invoice to insurance might effectively be a Claim record. But if not, the invoice itself could be used as the claim. Developer note: Decide if invoices to insurance will be recorded as Invoice in system (with a flag or recipient = insurance), or if they bypass invoice and only use Claim. For simplicity, assume all billing to any payer results in an Invoice in this module (ensuring consistent handling of payments via Payment Reconciliation).
- **Reminders/Overdue:** If an invoice remains unpaid past its due date, the system might flag it as overdue. It might trigger reminders or follow-ups. (This is more workflow after issuance: e.g., the UI could show a red “Overdue” label if today > due date and not balanced.) The status doesn’t change, but an additional field or calculation shows it’s overdue.
- **Invoice Adjustments/Credits:** If after issuing an invoice, one charge amount needs to be reduced (but not fully cancel the invoice), an approach is to add an adjustment line (negative line item) to the invoice. Some systems allow adjusting an issued invoice by adding a “- $50 adjustment: courtesy discount” and updating total. However, in strict accounting, once issued you’d rather cancel and reissue or issue a separate credit note. Implementation can vary. We mention it as an option: e.g., if a minor correction, maybe allow one to add an adjustment line in draft or require cancellation and new invoice.
- **Resending or Reissuing:** If a patient loses the invoice or an insurance needs a copy, staff can reprint the same invoice (with same number). If an invoice was lost before sending, you wouldn’t typically change its contents unless needed; you’d just send again.

## Step-by-Step User Workflow (Invoice Creation & Management)

**A. Creating and Finalizing an Invoice:**

1. **Initiate Invoice Creation:** A billing staff user navigates to the **Invoices** section for a particular account. Often, on the Account page, there will be a button like **“Generate Invoice”** or **“Create Invoice”**. They click this to start the process.
2. **Select Charges to Include:** The system will gather all **billable** Charge Items on that account that have not yet been invoiced ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=towards%20patients,view%20on%20the%20performed%20services)). These charges are typically listed out for the user to review. In many cases, the default is to include all of them. If needed, the user may have options to:
   - Remove certain items from this invoice (perhaps to bill them later or handle separately).
   - Confirm the date range of charges (maybe the UI says “Include all charges up to today” which is common).
   - If partial billing is supported, maybe the user can uncheck some items if they plan to invoice those another time.
   But by default, assume all open charges for that account are going into this invoice.
3. **Review Draft Invoice Details:** The system now shows a **draft invoice** view. This will look like an invoice with line items listed, but not finalized. The user should check:
   - All expected charges are present and none are missing or extra.
   - Each line has correct description, quantity, and price.
   - The subtotal and total calculations at the bottom seem correct.
   - The invoice is being addressed to the correct party (by default, perhaps the patient or primary insurance based on account’s coverage/guarantor settings).
   - The invoice date (which will default to today) and billing period (maybe from first charge date to last charge date).
   - If there are any automatic adjustments or discounts (for example, if the patient has a package deal, maybe some charges zeroed out or a discount line is present).
   The UI might allow editing certain fields in draft:
   - Changing the **Bill To**: e.g., user could switch the recipient from insurance to patient if needed for this invoice.
   - Adding a manual line item: e.g., a one-off adjustment or a service that was not captured as a Charge Item (less ideal, but some systems let you add an ad-hoc line with a description and price).
   - Removing a line: unchecking or deleting it from this invoice (the charge would remain in account and could be invoiced later).
   - Possibly adding a comment/note to the invoice (like “Payment plans available, contact billing” or any special message).
   Typically, the line item details themselves (description, price) come from the charges and can’t be edited here except by going back to edit the Charge Item.
4. **(Optional) Save as Draft:** If the user is not ready to finalize (maybe needs supervisor approval or waiting for end of day), they can save the invoice as **Draft**. The system will save the current invoice with a temporary ID (maybe no official number yet, or a draft number). 
   - In draft state, the invoice is not yet considered sent. Staff can come back later, open the draft, and continue editing. 
   - The advantage is that the selection of charges is frozen to that draft, so new charges that come in won’t automatically jump onto that draft until it’s finalized or updated. Some systems might still allow updating the draft with newly added charges if needed.
   - Draft invoices might show in an “Unissued Invoices” list for that account or in a billing worklist. They could be printed as “Pro Forma Invoice” for internal use if needed.
5. **Finalize (Issue) the Invoice:** When ready, the user clicks **“Finalize”** or **“Approve & Issue Invoice”**. A confirmation like “Once finalized, this invoice will be issued to the payer and no further edits will be possible. Continue?” might appear. On confirmation:
   - The system assigns the official **Invoice Number** (if not already assigned at creation).
   - Sets **Status = Issued** ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=code%20draft%20,error%20Binding%3A%20Invoice%20Status%20%28Required)).
   - Records the **Issue Date** (often the current date-time).
   - Locks the invoice content from further changes.
   - Updates all the included charge items: marks their status to **billed** ([ChargeItem - FHIR v6.0.0-ballot2](https://build.fhir.org/chargeitem-definitions.html#:~:text=The%20current%20state%20of%20the,ChargeItem)) and links them to this invoice record (so it’s easy to find which invoice a charge went to).
   - The invoice is now saved as an official record. 
6. **Output the Invoice Document:** Immediately after finalizing, the system will typically prompt to **print** or **view** the invoice PDF. The user can then print it out to send by mail or hand to the patient, or it could be emailed if the system supports (with patient consent etc.). The printed invoice will show the invoice number, date, patient info, list of charges, total due, etc.
   - If the invoice is to insurance, the output might be a standardized form or electronic claim — but if we treat invoice as multi-purpose, perhaps we still generate a readable invoice and separately send an electronic claim via another process.
7. **Post-Finalization UI Changes:** The invoice now appears in the account’s invoice list as an **Issued** invoice with its number and total. The charges that were on it no longer show as outstanding charges (they might move to a “Billed charges” section or simply not appear in the add-charge list anymore). The account’s balance might still remain the same until payment comes, but now that balance is associated with an issued invoice.
   - If the invoice was to insurance, perhaps the account might show “Pending Insurance: $X” to differentiate that portion.
   - The user can still open and view the invoice details, but all fields will be read-only, and a big “Status: Issued” label is shown.
   - The user might see options like “Record Payment” or “Cancel Invoice” now available for that invoice.

 An example workflow for creating an invoice is illustrated above. It begins with selecting an account and gathering all unbilled charges into a draft invoice for review. The user can save it as a draft if it’s not ready to issue, or finalize it to mark it as issued. Once issued, the invoice is considered outstanding for payment. *Figure: Creating and issuing an invoice (UI workflow).* 

**B. Canceling an Invoice (Voiding a bill):**

1. **Locate the Issued Invoice:** If an invoice needs cancellation (e.g., it was generated with incorrect information or patient decided on a different payment route before paying), the user finds that invoice in the system. Only **Issued** (or possibly Draft) invoices can be cancelled. If it’s draft, they might simply delete the draft. If issued, proceed with cancellation.
2. **Cancellation Action:** Click **“Cancel Invoice”** (sometimes shown as “Void” or “Delete Invoice” depending on terminology, but it should preserve record ideally). The system will likely prompt for a **Cancellation Reason** (a required input). The user provides an explanation like “Charges incorrect – will reissue” or selects a reason code (if predefined reasons).
3. **Confirm Cancellation:** On confirmation, the system:
   - Sets the invoice status to **Cancelled** ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=code%20draft%20,error%20Binding%3A%20Invoice%20Status%20%28Required)).
   - Stores the cancellation reason text ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=%3CcancelledReason%20value%3D%22%5Bstring%5D%22%2F%3E%3C%21,cancellation%20of%20this%20Invoice)).
   - Possibly updates an “Cancelled Date”.
   - Crucially, it must **unlock the charges** that were on this invoice: those charge items should be marked back from billed to their prior state (usually back to **billable**, as they haven’t truly been paid or anything). This allows them to be included on a new invoice later.
   - If any payments had somehow been applied to this invoice (which is unlikely if we cancel early; but suppose a partial payment was recorded), the system should warn or prevent cancellation until that is resolved (the payment would need to be unlinked or refunded).
   - The invoice record remains in the system for audit, but is tagged as cancelled and should not appear as an active receivable.
4. **Post-Cancellation Outcome:** The account will now show those charges as unbilled again. The cancelled invoice might be visible in an invoice history list (marked clearly as cancelled, maybe with a strikethrough or red status). It might not count towards any financial totals except in audit reports. If printed, the invoice would typically not be used, but if needed, it might have a watermark “VOID”.
5. The user can now correct whatever was wrong (maybe fix some charge items, or combine into a single invoice differently) and then create a new invoice as per steps above.

**C. Recording a Payment for an Invoice:**

*(Detailed payment workflows are covered in the Payment Reconciliation section, but from an invoice user’s perspective:)*  
- A user can select an issued invoice and choose **“Record Payment”** if a patient pays or an insurance EOB comes in. This usually pre-fills the invoice details into the payment entry form (so it knows which invoice to credit). The steps then align with the Payment Reconciliation process (enter amount, method, etc.). Once a payment is saved:
  - The invoice screen will update to show payments applied (like listing a payment of $100 on date X, possibly reducing “amount due”).
  - If the full amount gets paid, the invoice status might update to **Balanced** automatically, and perhaps a “Paid in full on [date]” note is shown.
  - If partially paid, the status stays Issued, but maybe a “Balance remaining: $Y” is displayed.
- The invoice could also be marked balanced by the system when a Payment Reconciliation covering its full amount is finalized.

**D. Viewing and Managing Invoices:**

- On the account page, staff can see all invoices associated with that account:
  - **Drafts:** listed separately maybe, to differentiate from issued ones.
  - **Issued:** with status, number, date, amount, outstanding balance.
  - **Balanced (Paid):** might be filtered out or marked as paid.
  - **Cancelled:** likely either hidden by default or shown in an archive list.
- They can click on any invoice to open details. For issued ones, they can reprint or see payment history. For drafts, they can edit or continue processing.
- The system might allow searching all invoices in the system by number, patient, or status (for billing office overview). For example, a billing manager might list all “Unpaid Invoices over 60 days” to follow up.
- If the HMIS supports integration, an invoice might have an option like “Submit Claim” if sending to insurance electronically (which could change status to something like “Submitted” in an extended workflow, but in basic terms it’s still issued from provider side).

In summary, from a staff perspective, generating an invoice is a guided process where the system pulls in charges, the user reviews, and then the invoice is finalized and sent out. The system tracks its status through payment and closure.

## Developer Notes (Invoice Processing & Integration)
- **Invoice Generation Logic:** When the user initiates an invoice creation, implement logic to fetch all eligible charges:
  - Query the ChargeItem table for all records linked to the account with status = billable (and possibly any additional criteria, like within certain date if partial billing by date).
  - If an account can have multiple draft invoices concurrently (probably not typical), decide how to handle allocation of charges between them. Usually, one invoice at a time per account to avoid confusion.
  - Once charges are selected for an invoice, mark them in some way (perhaps lock them or mark as "invoicing in progress") to prevent them being scooped up by another invoice process or accidentally double-charged.
- **Draft State Persistence:** When saving a draft invoice:
  - Store which charges are associated with it (maybe a join table InvoiceLine linking invoice draft to charge items).
  - Do not yet modify the charge item status; only do that on final issue.
  - Possibly generate a temporary ID. You might use a separate sequence for invoice numbers vs draft IDs. Some implementers use negative IDs or a prefix for drafts. Alternatively, treat draft similarly but mark status = draft and number = null or "DRAFT".
- **Invoice Number Generation:** Ensure invoice numbers are unique and sequential or follow required format. This likely happens at finalize. Consider concurrency: two users finalizing different invoices at same time should get different numbers without conflict. A robust approach is to have a transaction-safe sequence in the database.
- **Status Transitions & Enforcement:** 
  - Only allow moving from Draft -> Issued, Issued -> Balanced (via payment), Issued -> Cancelled, Issued -> (possibly entered-in-error), and Balanced -> (maybe allow cancel if a mistake but usually once paid you wouldn’t cancel).
  - Do not allow editing content when status is Issued or Balanced.
  - If someone tries to cancel a balanced (paid) invoice, either block it or require first reversing the payments.
- **Linking Charges to Invoice:** When finalizing:
  - Update each charge: set status to billed, and optionally add a reference to invoice ID on the charge record (if you want quick backward links). FHIR doesn’t explicitly have an invoice reference on ChargeItem, but nothing prevents an extension or a search by account+status. Many implementations will put an “invoiceId” field in charge for convenience.
  - Conversely, create invoice line entries that reference the original charge IDs (so you can trace from invoice line back to charge details if needed).
  - Once that’s done, future attempts to invoice those same charges should find them as already billed and skip them.
- **Printing/Formatting:** Generate an invoice document (PDF/printout) with a clear layout. Possibly include hospital logo, address, invoice number, patient details, list of charges (with maybe codes or dates), total, and payment instructions. If multiple languages or localization is needed, design templates accordingly.
- **Partial Invoice Selection:** If supporting partial selection in UI, ensure the backend can handle arbitrary subsets. The UI might pass specific charge IDs to include/exclude. The default can be “all billable charges now”. 
- **Payment Tracking on Invoice:** 
  - Maintain a field for amountPaid on invoice, updated whenever a payment is applied. This can make checking fully paid easy (amountPaid vs total).
  - Or calculate it by summing PaymentReconciliation allocations referencing that invoice each time (slower but single source of truth).
  - Possibly maintain amountDue = total - amountPaid.
  - When amountDue reaches 0, auto-set status to Balanced. This could be done via a trigger when posting payments or explicitly in payment application code.
- **Automating Status Balanced:** For safety, one might only mark Balanced when explicitly triggered (like after recording a payment covering full amount). But also consider edge case: if an invoice is $100 and two different payments $60 and $40 are applied at different times, after second payment, code should detect total paid equals invoice total and then set Balanced. This means the Payment Reconciliation process needs to check the invoice’s amounts or sum payments so far.
  - Alternatively, provide a batch job that scans invoices for fully paid ones and marks them balanced, if synchronous updates are tricky.
- **Cancelling Invoice Implementation:** 
  - Ensure atomicity: update invoice status, free up charges (set them to billable) within one transaction. If any part fails, roll back all, to avoid stranded charges (e.g., invoice cancelled but charges not restored).
  - If a charge had been partially paid (rare scenario, but maybe they paid something before cancellation), you may either not allow cancel or if allowed, handle that: possibly keep the payment but without an invoice? That’s messy — better to not cancel in that case or require refund. Usually, one wouldn’t cancel after payment; instead would issue a correcting credit.
  - Mark the invoice number as cancelled in case numbering needs to skip or reuse? Typically, do not reuse numbers – even cancelled invoice keeps its number.
- **Reissuing after Cancel:** The same charges can now go to a new invoice. That new invoice might get a new number. Optionally, you could link the new invoice to the old cancelled one for reference (not required but could be useful context).
- **Multiple Payers (Insurance then Patient):** If the workflow includes insurance, consider:
  - Possibly generating an invoice to insurance (with status maybe stays issued until insurer responds, then PaymentRec comes in). After insurer pays or denies certain items, the remaining can be billed to patient. There are a couple of approaches:
    - Create separate invoices: one for insurance, one for patient balance. If doing so, one must split the charges or amounts accordingly.
    - Or one invoice listing insurance portion and patient portion (less common, usually separate statements).
  - A simpler approach: treat the insurance claim outside of Invoice; only use Invoice for patient billing after insurance. But since the spec mentions PaymentReconciliation referencing invoices ([PaymentReconciliation - FHIR v6.0.0-ballot2](https://build.fhir.org/paymentreconciliation.html#:~:text=the%20individual%20payment%20amounts%20indicated,or%20%2031%20for%20example)), one can indeed track insurance payments against an invoice too.
  - Perhaps an invoice is always ultimately to the patient/guarantor, and insurance is handled by Claim. However, openIMIS and others seem to use Invoice for insurance too. Decide based on requirement.
  - Developers might need to incorporate logic: If account has insurance, maybe don’t invoice patient until insurance results are back; or generate an invoice but mark it as to insurance (which in effect is like a claim). 
  - For our documentation, we haven’t deeply distinguished, so implementation can vary.
- **Overdue & Reminders:** Could implement a job to mark invoices as overdue if current date > issue date + terms and status still issued (not balanced). This might trigger notifications or at least a visible flag. Not mandatory but typical in real systems.
- **Invoice Adjustments:** If the system allows editing an invoice after issuance by adding an adjustment line:
  - That effectively changes the total. If the invoice was $100 and you add a -$10 line, total becomes $90. One must ensure consistency: the underlying charge items still sum to $100, but invoice says $90 due. In accounting, that -$10 should be recorded as a write-off or discount entry somewhere.
  - Possibly better to avoid mid-flight changes and instead handle via PaymentReconciliation (like enter a $10 adjustment as a PaymentReconciliation of type adjustment).
  - Simpler: do not allow adding lines post-issue; require cancel and reissue if changes needed. That keeps invoice = sum of its charges strictly.
- **Query by Account/Status:** Implement convenient queries:
  - Find all invoices for an account (for account view).
  - Find all unpaid invoices for accounts, etc.
  - Ensure that when retrieving account balance via account, you consider partially paid invoices correctly (i.e., you might sum all charges - payments; or sum all invoice totals - payments).
  - Might double count if not careful: maybe simpler to rely on charges and payments at account level, ignoring invoices for balance calc, as FHIR suggests.
- **Integration with PaymentReconciliation:** The FHIR invoice resource references PaymentReconciliation ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=8,Resource)). In implementation:
  - When a PaymentReconciliation is created (payment posted), allow linking which invoices it covers. If one payment covers multiple invoices, all those should be updated.
  - PaymentReconciliation might itself store invoice references in its details, or you have a join table.
  - Ensure partial payments update invoice record (either store remaining balance or track via PaymentReconciliation records).
- **Security & Roles:** Limit who can cancel or edit issued invoices (maybe only supervisors). Normal clerks might only record payments. This can prevent malicious or erroneous cancellations of valid bills.
- **FHIR API Note:** If exposing these as FHIR:
  - The Invoice resource in FHIR R5 is still trial but has similar fields. Use the same statuses (draft, issued, balanced, cancelled, entered-in-error) ([Invoice - FHIR v6.0.0-ballot2](https://build.fhir.org/invoice.html#:~:text=code%20draft%20,error%20Binding%3A%20Invoice%20Status%20%28Required)) to maintain compatibility.
  - PaymentReconciliation and Invoice linking should conform to FHIR (e.g., PaymentReconciliation.detail might point to Invoice).
  - For now, internal workings can be done without strictly following all FHIR mechanics, but keep in mind for future interoperability.
- **Testing Scenarios:** 
  - Create invoice when no charges exist (system should not allow or show a message “No billable items to invoice”).
  - Create multiple invoices sequentially as new charges come in (one at discharge, then a supplemental later).
  - Cancel after partial payment, see what happens.
  - Ensure a balance invoice cannot be cancelled or edited.
  - Large invoices (many lines): test performance of rendering and summing.
- **Edge Case - Account with zero charges:** If for some reason an invoice is needed for a zero amount (maybe just to close out?), decide if allowed or skip since it’s pointless. Usually no invoice if nothing to bill.
- **Linking invoice to account balance:** Possibly update account’s notion of outstanding receivable. But since account balance can be derived from charges minus payments (not caring how many invoices), you may not need a separate field. The account could optionally track total invoiced vs not invoiced.
- **Open/Closed Accounting Periods:** In some hospital billing, once an account is discharged, they want all charges on one final bill. Late charges pose a problem. The system might allow generating another invoice for late charges or require managerial approval to add charges to a closed account. We touched on that. Implementation should allow invoicing any charges that appear later even if account was inactive (maybe temporarily reactivate or allow invoice generation even if account inactive but has unbilled charges).
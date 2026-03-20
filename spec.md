# Reagent CPT Calculator

## Current State
The app has a "Generate Quotation" button that opens a dialog for Customer Name and Lab Name, then generates a PDF with selected reagent rows including columns: #, Reagent Name, Volume, MRP (optional), Offer Price, Tests/mL, Total Tests, ML Cost, CPT. The PDF has T&C, validity, payment/delivery terms, and a footer.

## Requested Changes (Diff)

### Add
- A separate "Generate POB" (Pre Order Booking) button alongside the existing "Generate Quotation" button
- A POB dialog popup that collects: Customer Name, Lab Name, Address, Phone Number, and per-item editable Quantity (default 1 for each selected row)
- A `generatePOBPDF()` function that:
  - Shows Zamco Medical Tech Pvt Ltd logo (`/assets/uploads/zamco-med-1.png`) and company name in header
  - Has title "Pre Order Booking"
  - Shows date
  - Shows customer details (name, lab, address, phone)
  - Table columns: #, Reagent Name, ML (Volume), Offer Price (₹), Quantity, Total Amount (₹) [Offer Price × Quantity]
  - Bottom: subtotal of all Total Amounts
  - If `exclusiveGst` is checked: show 5% GST line and Grand Total
  - Sign and Stamp section below the totals
- POB-specific state: `pobOpen`, `pobCustomerName`, `pobLabName`, `pobAddress`, `pobPhone`, `pobQuantities` (map of row index to quantity)

### Modify
- The buttons area in the results section to include the new POB button alongside Export CSV and Generate Quotation

### Remove
- Nothing removed

## Implementation Plan
1. Add `generatePOBPDF()` function near the existing `generateQuotationPDF()` function
2. Add POB state variables (`pobOpen`, `pobCustomerName`, `pobLabName`, `pobAddress`, `pobPhone`, `pobQuantities`)
3. Add `handleGeneratePOB()` handler
4. Add POB Dialog component in the buttons area alongside the existing quotation button
5. The POB dialog shows per-item quantity fields for each selected row, defaulting to 1, editable

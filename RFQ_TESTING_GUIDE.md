# RFQ Flow End-to-End Testing Guide

## ✅ Implementation Complete

All fixes have been implemented:
- ✅ Admin email updated to: `sales@gravenautomation.com`
- ✅ FRONTEND_URL environment variable configured
- ✅ RevisionRequestDialog updated with proper customer data
- ✅ All edge functions using correct environment variables
- ✅ Resend webhook signature verification configured

## 📋 Testing Checklist

### Pre-Test Verification

**Database Status:**
```sql
-- Check existing quotation
SELECT id, status, customer_email, customer_name, total_amount, final_amount
FROM quotation_requests 
WHERE id = 'c782dd17-b4b9-4162-9cd8-afc78dd92541';
```

**Expected Result:**
- Status: `reviewing` (needs to be changed to `quoted` to start testing)
- Customer: kaushal@gravenautomation.com

---

## 🧪 Test Scenarios

### Scenario 1: Initial Quotation Email

**Prerequisites:**
- Quotation status must be `quoted`
- Admin has filled in pricing for all items

**Steps:**
1. As admin, go to `/admin/rfq/{quotation_id}`
2. Update quotation status to `quoted`
3. System automatically sends quotation email

**OR manually trigger:**
```javascript
// From browser console on quotation detail page
await supabase.functions.invoke("send-quotation-email", {
  body: { quotationId: "c782dd17-b4b9-4162-9cd8-afc78dd92541" }
});
```

**Verify:**
- [ ] Email received at `kaushal@gravenautomation.com`
- [ ] Email subject: `✅ Your Quotation is Ready - QR-C782DD17`
- [ ] All products and prices displayed correctly
- [ ] Total amount and discounts (if any) shown
- [ ] "View Quotation" button links to correct page
- [ ] Check logs: `resend-webhook` should show signature verified
- [ ] Database: `customer_communications` table has new record with `resend_id`

**Database Check:**
```sql
SELECT * FROM customer_communications 
WHERE metadata->>'quotation_id' = 'c782dd17-b4b9-4162-9cd8-afc78dd92541'
ORDER BY created_at DESC LIMIT 1;
```

---

### Scenario 2: Email Tracking Verification

**Prerequisites:**
- Email from Scenario 1 received

**Steps:**
1. Open the quotation email in your inbox
2. Wait 5-10 seconds
3. Click the "View Quotation" link
4. Wait another 5-10 seconds

**Verify:**
- [ ] `resend-webhook` logs show events received
- [ ] Webhook signature verification passes: `✅ Webhook signature verified`
- [ ] Database updated with tracking data

**Database Check:**
```sql
SELECT 
  subject,
  status,
  delivered_at,
  opened_at,
  clicked_at,
  metadata->>'resend_id' as resend_id
FROM customer_communications 
WHERE metadata->>'quotation_id' = 'c782dd17-b4b9-4162-9cd8-afc78dd92541'
ORDER BY created_at DESC;
```

**Expected:**
- `delivered_at`: Timestamp when Resend delivered email
- `opened_at`: Timestamp when you opened the email
- `clicked_at`: Timestamp when you clicked the link

---

### Scenario 3: Request Revision Flow

**Prerequisites:**
- Quotation status: `quoted`
- Customer logged in at `/quotation/{id}`

**Steps:**
1. Customer goes to quotation detail page
2. Clicks "Request Revision" button
3. Enters revision message: "Please provide 5% additional discount for bulk order"
4. Submits request

**Verify:**
- [ ] Quotation status changed to `revision_requested`
- [ ] Admin receives email at `sales@gravenautomation.com`
- [ ] Email subject: `Customer Requested Quote Revision - QR-C782DD17`
- [ ] Email shows:
  - Customer name and email
  - Current quote details (items, amounts)
  - Revision message text
- [ ] "Review & Revise Quote" link points to: `/admin/rfq/{id}`
- [ ] Customer sees success toast: "Revision request sent!"

**Admin Email Check:**
- [ ] Check `sales@gravenautomation.com` inbox
- [ ] Verify all customer details are correct (not placeholder data)
- [ ] Verify current quote amounts are accurate

**Database Check:**
```sql
SELECT 
  status, 
  admin_notes,
  updated_at
FROM quotation_requests 
WHERE id = 'c782dd17-b4b9-4162-9cd8-afc78dd92541';

-- Check communication log
SELECT * FROM customer_communications 
WHERE channel = 'revision'
AND metadata->>'quotation_id' = 'c782dd17-b4b9-4162-9cd8-afc78dd92541';
```

---

### Scenario 4: Admin Revises Quote

**Prerequisites:**
- Quotation status: `revision_requested`
- Admin logged in

**Steps:**
1. Admin opens revision email and clicks "Review & Revise Quote"
2. Updates pricing (e.g., adds 5% discount)
3. Changes status back to `quoted`
4. System sends updated quotation email

**Verify:**
- [ ] Customer receives new email
- [ ] Email has discount banner if discount >= 10%
- [ ] Email subject shows update: `📝 Updated Quotation` or `🎉 Special Discount Applied`
- [ ] Updated pricing reflected in email
- [ ] Previous and new amounts clearly shown

**Database Check:**
```sql
-- Check if revision was logged
SELECT * FROM quotation_revisions 
WHERE quotation_request_id = 'c782dd17-b4b9-4162-9cd8-afc78dd92541'
ORDER BY created_at DESC;

-- Check updated amounts
SELECT 
  total_amount,
  discount_percentage,
  discount_amount,
  final_amount,
  status
FROM quotation_requests 
WHERE id = 'c782dd17-b4b9-4162-9cd8-afc78dd92541';
```

---

### Scenario 5: Customer Finalizes Quote

**Prerequisites:**
- Quotation status: `quoted`
- Customer logged in at `/quotation/{id}`

**Steps:**
1. Customer reviews final quote
2. Clicks "Finalize & Order Now" button
3. Confirms finalization

**Verify:**
- [ ] Quotation status changed to `finalized`
- [ ] Admin receives email at `sales@gravenautomation.com`
- [ ] Email subject: `Customer Finalized Quotation - QR-C782DD17`
- [ ] Email shows:
  - Green banner: "✅ Quote Accepted!"
  - Customer details
  - Final amount and item count
- [ ] "View Quote Details" link points to: `/admin/quotation/{id}`
- [ ] Customer redirected to checkout or sees success message

**Admin Email Check:**
- [ ] Check `sales@gravenautomation.com` inbox
- [ ] Email has green/success theme
- [ ] All quote details accurate

**Database Check:**
```sql
SELECT 
  status,
  updated_at
FROM quotation_requests 
WHERE id = 'c782dd17-b4b9-4162-9cd8-afc78dd92541';

-- Check finalization communication
SELECT * FROM customer_communications 
WHERE channel = 'finalized'
AND metadata->>'quotation_id' = 'c782dd17-b4b9-4162-9cd8-afc78dd92541';
```

---

## 🔍 Monitoring & Debugging

### Check Edge Function Logs

**Resend Webhook:**
```
Go to: Lovable Cloud Backend > Functions > resend-webhook > Logs

Look for:
✅ Webhook signature verified
✅ Successfully updated communication for resend_id: xxx
❌ Webhook signature verification failed (should NOT appear)
```

**Send Quotation Email:**
```
Go to: Lovable Cloud Backend > Functions > send-quotation-email > Logs

Look for:
✅ Sending quotation email to: [email]
✅ Email sent successfully: { id: "..." }
❌ Error messages (should NOT appear)
```

**Send Revision Notification:**
```
Go to: Lovable Cloud Backend > Functions > send-revision-notification > Logs

Look for:
✅ Sending revision notification to admin: [email]
✅ Revision notification sent successfully: { id: "..." }
```

**Send Finalized Notification:**
```
Go to: Lovable Cloud Backend > Functions > send-finalized-notification > Logs

Look for:
✅ Sending finalized notification to admin: [email]
✅ Finalized notification sent successfully: { id: "..." }
```

### Check Customer Communications Table

```sql
-- View all communications for this quotation
SELECT 
  id,
  channel,
  subject,
  status,
  delivered_at,
  opened_at,
  clicked_at,
  metadata->>'resend_id' as resend_id,
  created_at
FROM customer_communications
WHERE metadata->>'quotation_id' = 'c782dd17-b4b9-4162-9cd8-afc78dd92541'
ORDER BY created_at ASC;
```

### Common Issues & Solutions

**Issue 1: Emails not received**
- Check spam folder
- Verify Resend domain is validated: https://resend.com/domains
- Check Resend API key is correct
- Verify email addresses are valid

**Issue 2: Webhook tracking not working**
- Verify `RESEND_SIGNING_SECRET` is correct (starts with `whsec_`)
- Check webhook is configured in Resend dashboard
- Webhook URL: `https://izphkdvrexejctdabplp.supabase.co/functions/v1/resend-webhook`
- Events enabled: `email.delivered`, `email.opened`, `email.clicked`

**Issue 3: Links in emails don't work**
- Verify `FRONTEND_URL` is set correctly
- Should be: `https://schneidervfd.com` (no trailing slash)
- Check edge function logs for the actual URL being generated

**Issue 4: Customer data missing in emails**
- Check that quotation object is being passed to RevisionRequestDialog
- Verify interface matches actual data structure
- Check edge function logs for data being sent

---

## ✅ Success Criteria

All tests pass when:

1. **Email Delivery:**
   - All 3 email types sent successfully
   - Emails received in correct inboxes
   - All content renders correctly

2. **Email Tracking:**
   - Webhook signature verification passes
   - `delivered_at`, `opened_at`, `clicked_at` all populate
   - No verification failures in logs

3. **Data Accuracy:**
   - Customer names, emails correct (not placeholders)
   - Quote amounts accurate
   - Links point to correct pages

4. **Status Transitions:**
   - `reviewing` → `quoted` → `revision_requested` → `quoted` → `finalized`
   - Each transition triggers correct notification

5. **Communication Logs:**
   - Every email logged in `customer_communications`
   - All records have `resend_id`
   - Tracking data populates after opening emails

---

## 📊 Test Results Template

Use this template to track your test results:

```
Date: ___________
Tester: ___________

Scenario 1 - Initial Quotation Email: [ ] Pass [ ] Fail
Scenario 2 - Email Tracking: [ ] Pass [ ] Fail
Scenario 3 - Request Revision: [ ] Pass [ ] Fail
Scenario 4 - Admin Revises: [ ] Pass [ ] Fail
Scenario 5 - Customer Finalizes: [ ] Pass [ ] Fail

Notes:
_______________________________________
_______________________________________
_______________________________________
```

---

## 🎯 Quick Test Commands

**Test quotation email manually:**
```javascript
await supabase.functions.invoke("send-quotation-email", {
  body: { quotationId: "c782dd17-b4b9-4162-9cd8-afc78dd92541" }
});
```

**Check latest communication:**
```sql
SELECT * FROM customer_communications ORDER BY created_at DESC LIMIT 5;
```

**Check quotation status:**
```sql
SELECT status, customer_email FROM quotation_requests 
WHERE id = 'c782dd17-b4b9-4162-9cd8-afc78dd92541';
```

**View recent webhook events:**
```sql
-- Check edge function logs in Lovable Cloud Backend
```

---

## 📞 Support

If issues persist:
1. Check all environment variables are set correctly
2. Verify Resend account is in good standing
3. Review edge function logs for detailed error messages
4. Ensure database has proper RLS policies for testing user

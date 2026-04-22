import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateQuotationPDF } from '../_shared/pdf-generator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('🚀 PDF Generation started - Request received')
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📋 Step 1: Creating Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    console.log('✅ Supabase client created')

    console.log('📝 Step 2: Parsing request body...')
    const { quotationId } = await req.json()
    console.log(`✅ Quotation ID received: ${quotationId}`)

    if (!quotationId) {
      console.error('❌ ERROR: No quotation ID provided')
      return new Response(
        JSON.stringify({ error: 'Quotation ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔐 Step 3: Authenticating user...')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ ERROR: Authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log(`✅ User authenticated: ${user.id}`)

    console.log('👤 Step 3.5: Checking if user is admin...')
    const { data: adminRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
    
    const isAdmin = !!adminRole
    console.log(`✅ User role: ${isAdmin ? 'Admin' : 'Customer'}`)

    console.log('📊 Step 4a: Fetching quotation from database...')
    const { data: quotation, error: quotationError } = await supabaseClient
      .from('quotation_requests')
      .select('*')
      .eq('id', quotationId)
      .single()

    if (quotationError || !quotation) {
      console.error('❌ ERROR: Quotation fetch failed:', quotationError)
      return new Response(
        JSON.stringify({ error: 'Quotation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log(`✅ Quotation fetched - Status: ${quotation.status}, User ID: ${quotation.user_id}`)

    console.log('👤 Step 4b: Fetching customer details...')
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .select('phone, gst_number, billing_address, shipping_address')
      .eq('user_id', quotation.user_id)
      .maybeSingle()

    if (customerError) {
      console.error('⚠️ WARNING: Customer fetch failed:', customerError)
    }
    console.log('✅ Customer details fetched:', customer ? 'Found' : 'Not found')

    console.log('🔒 Step 5: Verifying quotation ownership...')
    if (quotation.user_id !== user.id) {
      console.error(`❌ ERROR: Ownership mismatch - Quotation user: ${quotation.user_id}, Requesting user: ${user.id}`)
      return new Response(
        JSON.stringify({ error: 'Unauthorized to access this quotation' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('✅ Ownership verified')

    console.log('📋 Step 6: Verifying quotation status...')
    if (quotation.status !== 'quoted' && quotation.status !== 'revised' && quotation.status !== 'finalized' && quotation.status !== 'converted_to_order') {
      console.error(`❌ ERROR: Invalid status for PDF generation: ${quotation.status}`)
      return new Response(
        JSON.stringify({ error: 'PDF is only available for quoted/revised/finalized quotations' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log(`✅ Status verified: ${quotation.status}`)

    console.log('📦 Step 7: Fetching quotation items from quotation_request_items table...')
    const { data: items, error: itemsError } = await supabaseClient
      .from('quotation_request_items')
      .select('product_name, product_sku, quantity, unit_price, discount_percentage, final_price')
      .eq('quotation_request_id', quotationId)
      .order('created_at', { ascending: true })

    if (itemsError) {
      console.error('❌ ERROR: Items fetch failed:', itemsError)
      console.error('❌ Items error details:', JSON.stringify(itemsError))
      return new Response(
        JSON.stringify({ error: 'Failed to fetch quotation items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log(`✅ Items fetched successfully - Count: ${items?.length || 0}`)

    if (!items || items.length === 0) {
      console.error('❌ ERROR: No items found for quotation')
      return new Response(
        JSON.stringify({ error: 'No items found for this quotation' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔧 Step 8: Preparing quotation data with customer details...')
    const quotationData = {
      id: quotation.id,
      created_at: quotation.created_at,
      expires_at: quotation.expires_at,
      status: quotation.status,
      customer_name: quotation.customer_name,
      customer_email: quotation.customer_email,
      company_name: quotation.company_name,
      customer_phone: customer?.phone || null,
      customer_gst: customer?.gst_number || null,
      billing_address: customer?.billing_address || null,
      shipping_address: customer?.shipping_address || null,
      final_amount: quotation.final_amount,
      discount_amount: quotation.discount_amount,
      discount_percentage: quotation.discount_percentage,
      quote_notes: quotation.quote_notes || '',
    }
    console.log('✅ Quotation data prepared:', JSON.stringify(quotationData, null, 2))

    console.log('🎨 Step 9: Generating PDF...')
    const pdfBuffer = await generateQuotationPDF(quotationData, items)
    console.log(`✅ PDF generated successfully - Size: ${pdfBuffer.length} bytes`)

    // Step 9.5: Log audit trail and send notification if admin
    if (isAdmin) {
      console.log('📝 Step 9.5a: Logging PDF download by admin...')
      try {
        const { error: auditError } = await supabaseClient
          .from('quotation_audit_log')
          .insert({
            quotation_request_id: quotationId,
            change_type: 'pdf_downloaded',
            field_name: 'pdf_download',
            changed_by: user.id,
            change_summary: 'PDF downloaded by admin',
            metadata: {
              download_timestamp: new Date().toISOString(),
              downloaded_by_admin: true,
              admin_id: user.id,
              user_agent: req.headers.get('user-agent'),
              ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
            }
          })
        
        if (auditError) {
          console.error('❌ Failed to log audit entry:', auditError)
        } else {
          console.log('✅ Audit log entry created')
        }
      } catch (auditErr) {
        console.error('❌ Audit logging error:', auditErr)
      }

      // Send email notification to customer
      if (quotation.customer_email) {
        console.log('📧 Step 9.5b: Sending notification email to customer...')
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Schneidervfd.com <noreply@schneidervfd.com>',
              reply_to: 'sales@gravenautomation.com',
              to: [quotation.customer_email],
              subject: `📄 Your Quotation PDF Was Accessed - ${quotation.id.slice(0, 8).toUpperCase()}`,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  </head>
                  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="color: white; margin: 0; font-size: 28px;">Quotation PDF Accessed</h1>
                    </div>
                    
                    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                      <p style="font-size: 16px; margin-bottom: 20px;">Dear ${quotation.customer_name},</p>
                      
                      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                        <p style="margin: 0; font-weight: 600; color: #1e40af;">📄 Activity Notification</p>
                        <p style="margin: 8px 0 0 0; color: #1e40af;">
                          Your quotation PDF was accessed by our team at ${new Date().toLocaleString('en-IN', { 
                            timeZone: 'Asia/Kolkata',
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}.
                        </p>
                      </div>
                      
                      <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;"><strong>Quotation Number:</strong> QR-${quotation.id.slice(0, 8).toUpperCase()}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> ${quotation.status}</p>
                        <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${(quotation.final_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>

                      <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                        This is an automated notification to keep you informed about activity on your quotation. If you have any questions, please don't hesitate to contact us.
                      </p>

                      <div style="text-align: center; margin-top: 30px;">
                        <a href="${(Deno.env.get('FRONTEND_URL') || 'https://schneidervfd.com').replace(/\/+$/, '')}/quotation/${quotationId}"
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          View Your Quotation
                        </a>
                      </div>

                      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #4b5563;">
                        <p style="margin-bottom: 15px; font-weight: 600;">Need assistance?</p>
                        <p style="margin: 5px 0;">
                          📧 Email: <a href="mailto:sales@gravenautomation.com" style="color: #667eea; text-decoration: none;">sales@gravenautomation.com</a>
                        </p>
                        <p style="margin: 5px 0;">
                          📞 Phone: <a href="tel:+917905350134" style="color: #667eea; text-decoration: none;">+91 7905350134</a>
                        </p>
                        <p style="margin: 15px 0 5px 0; font-size: 12px; color: #6b7280;">
                          7/25, Tower F, 2nd Floor, Kirti Nagar Industrial Area, Delhi - India - 110015
                        </p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
            }),
          })

          const emailResult = await emailResponse.json()
          
          if (emailResponse.ok) {
            console.log('✅ Customer notification email sent:', emailResult.id)
          } else {
            console.error('❌ Failed to send email:', emailResult)
          }
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError)
        }
      }
    }

    console.log('📤 Step 10: Sending PDF response...')
    return new Response(new Blob([pdfBuffer as any], { type: 'application/pdf' }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Quotation-${quotation.id.slice(0, 8).toUpperCase()}.pdf"`
      }
    })

  } catch (error) {
    console.error('❌ CRITICAL ERROR in PDF generation:', error)
    console.error('📋 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('📋 Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

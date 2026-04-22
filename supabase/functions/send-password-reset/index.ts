import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getBranding, getEmailTemplate, getEmailButton, getAlertBox } from "../_shared/branding.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const branding = getBranding();
    
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Generate password reset link using Supabase Admin API
    const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${branding.frontendUrl}/auth/reset-password`,
      },
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset link will be sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resetLink = data?.properties?.action_link;
    
    if (!resetLink) {
      console.error("No reset link generated");
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset link will be sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email content
    const content = `
      <p style="color: ${branding.colors.textMuted}; font-size: 15px; margin: 0 0 20px 0;">
        We received a request to reset the password for your account. Click the button below to create a new password:
      </p>
      
      ${getEmailButton('Reset Password', resetLink)}
      
      <p style="color: ${branding.colors.textMuted}; font-size: 13px; margin: 24px 0 8px 0;">
        If the button doesn't work, copy and paste this link:
      </p>
      <p style="color: ${branding.colors.primary}; font-size: 12px; word-break: break-all; background: ${branding.colors.bgLight}; padding: 12px; border-radius: 6px; margin: 0;">
        ${resetLink}
      </p>
      
      ${getAlertBox('<strong>Security Notice:</strong> This link expires in 1 hour. If you didn\'t request this, please ignore this email.', 'warning')}
    `;

    const emailHtml = getEmailTemplate(content, 'Reset Your Password');

    const emailResponse = await resend.emails.send({
      from: branding.email.from,
      to: [email],
      reply_to: branding.email.replyTo,
      subject: `Reset Your Password - ${branding.companyName}`,
      html: emailHtml,
    });

    console.log("Password reset email sent:", emailResponse);

    // Log communication
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, user_id")
      .eq("email", email)
      .single();

    if (customer) {
      await supabaseAdmin.from("customer_communications").insert({
        user_id: customer.user_id,
        customer_id: customer.id,
        communication_type: "password_reset",
        channel: "email",
        subject: `Reset Your Password - ${branding.companyName}`,
        message_preview: "Password reset link sent",
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Password reset link sent to your email." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

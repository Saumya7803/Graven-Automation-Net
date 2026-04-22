// Centralized branding configuration for all edge functions
export const getBranding = () => ({
  companyName: 'Schneidervfd.com',
  companyLegal: 'Graven Automation Private Limited',
  tagline: 'Your Trusted VFD Partner',
  email: {
    from: `Schneidervfd.com <noreply@${Deno.env.get('EMAIL_DOMAIN') || 'schneidervfd.com'}>`,
    replyTo: 'sales@gravenautomation.com',
    support: 'sales@gravenautomation.com',
  },
  frontendUrl: (Deno.env.get('FRONTEND_URL') || 'https://schneidervfd.com').replace(/\/+$/, ''),
  contact: {
    phone1: '+91 7905350134',
    phone2: '+91 9919089567',
    whatsapp1: '+91 7905350134',
    whatsapp2: '+91 9919089567',
    address: '7/25, Tower F, 2nd Floor, Kirti Nagar Industrial Area, Delhi - India - 110015',
  },
  colors: {
    primary: '#009530',
    primaryDark: '#007025',
    accent: '#10b981',
    warning: '#f59e0b',
    success: '#10b981',
    whatsapp: '#25D366',
    textDark: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    bgLight: '#f9fafb',
  },
});

export const getEmailHeader = (title: string) => {
  const branding = getBranding();
  return `
    <div style="background: ${branding.colors.primary}; padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
        ${branding.companyName}
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 13px; font-weight: 500;">
        ${branding.tagline}
      </p>
    </div>
    ${title ? `
    <div style="padding: 32px 24px 0 24px;">
      <h2 style="color: ${branding.colors.textDark}; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">
        ${title}
      </h2>
    </div>
    ` : ''}
  `;
};

export const getEmailFooter = () => {
  const branding = getBranding();
  return `
    <div style="margin-top: 40px; padding: 24px; border-top: 1px solid ${branding.colors.border}; background: ${branding.colors.bgLight};">
      <p style="margin: 0 0 16px 0; font-weight: 600; color: ${branding.colors.textDark}; font-size: 14px;">Need help? Contact us:</p>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: ${branding.colors.textMuted};">
            📧 <a href="mailto:${branding.email.replyTo}" style="color: ${branding.colors.primary}; text-decoration: none;">${branding.email.replyTo}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: ${branding.colors.textMuted};">
            📞 <a href="tel:${branding.contact.phone1.replace(/\s/g, '')}" style="color: ${branding.colors.primary}; text-decoration: none;">${branding.contact.phone1}</a> | 
            <a href="tel:${branding.contact.phone2.replace(/\s/g, '')}" style="color: ${branding.colors.primary}; text-decoration: none;">${branding.contact.phone2}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: ${branding.colors.textMuted};">
            💬 <a href="https://wa.me/${branding.contact.whatsapp1.replace(/[^0-9]/g, '')}" style="color: ${branding.colors.whatsapp}; text-decoration: none;">${branding.contact.whatsapp1}</a> | 
            <a href="https://wa.me/${branding.contact.whatsapp2.replace(/[^0-9]/g, '')}" style="color: ${branding.colors.whatsapp}; text-decoration: none;">${branding.contact.whatsapp2}</a>
          </td>
        </tr>
      </table>
      <p style="margin: 20px 0 0 0; font-size: 12px; color: ${branding.colors.textMuted};">
        ${branding.contact.address}
      </p>
      <p style="margin: 16px 0 0 0; text-align: center; font-size: 12px; color: ${branding.colors.textMuted};">
        © ${new Date().getFullYear()} ${branding.companyName}. All rights reserved.
      </p>
    </div>
  `;
};

export const getEmailButton = (text: string, url: string) => {
  const branding = getBranding();
  return `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${url}" 
         style="display: inline-block; background: ${branding.colors.primary}; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 6px; font-size: 15px; font-weight: 600;">
        ${text}
      </a>
    </div>
  `;
};

export const getEmailTemplate = (content: string, title?: string) => {
  const branding = getBranding();
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || branding.companyName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        ${getEmailHeader(title || '')}
        <div style="padding: 0 24px 24px 24px;">
          ${content}
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
};

export const getAlertBox = (message: string, type: 'warning' | 'success' | 'info' = 'warning') => {
  const branding = getBranding();
  const colors = {
    warning: { bg: '#fef3c7', border: branding.colors.warning, text: '#92400e' },
    success: { bg: '#dcfce7', border: branding.colors.success, text: '#065f46' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  };
  const c = colors[type];
  return `
    <div style="background: ${c.bg}; border-left: 4px solid ${c.border}; padding: 14px 16px; margin: 20px 0; border-radius: 0 6px 6px 0;">
      <p style="color: ${c.text}; font-size: 14px; margin: 0;">${message}</p>
    </div>
  `;
};

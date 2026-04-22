export const EMAIL_TEMPLATES = {
  vip_exclusive: {
    name: 'VIP Exclusive Offer',
    defaultSubject: '🌟 Exclusive VIP Offer Just for You',
    template: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; color: #fff; font-size: 14px; margin-top: 10px; }
    .content { padding: 40px 20px; }
    .content h2 { color: #1f2937; margin-top: 0; }
    .offer-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
    .footer a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{tier_badge}} VIP Exclusive Access</h1>
      <div class="badge">Premium Member</div>
    </div>
    
    <div class="content">
      <h2>Dear {{customer_name}},</h2>
      <p>As one of our most valued VIP customers, we're thrilled to offer you an exclusive opportunity that's not available to the general public.</p>
      
      <div class="offer-box">
        <h3 style="margin-top:0; color: #d97706;">🎁 Your Exclusive VIP Offer</h3>
        <p><strong>Get 15% OFF on all VFD products</strong></p>
        <p>Plus: Free priority shipping and dedicated technical support</p>
        <p><strong>Code: VIP2024</strong> | Valid for 7 days</p>
      </div>
      
      <p>This is our way of saying thank you for your continued partnership and trust in our products.</p>
      
      <a href="#" class="cta-button">Shop VIP Collection →</a>
      
      <p>Need assistance? Your dedicated account manager is just a call away.</p>
      
      <p>Best regards,<br>The Schneider VFD Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Schneider VFD. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">Contact Us</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  new_welcome: {
    name: 'New Customer Welcome',
    defaultSubject: '👋 Welcome to Schneider VFD!',
    template: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 20px; }
    .content h2 { color: #1f2937; margin-top: 0; }
    .feature { background: #f0fdf4; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 3px solid #10b981; }
    .feature h3 { margin-top: 0; color: #059669; font-size: 16px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
    .footer a { color: #10b981; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{tier_badge}} Welcome Aboard!</h1>
    </div>
    
    <div class="content">
      <h2>Hello {{customer_name}},</h2>
      <p>Welcome to Schneider VFD! We're excited to have you join our community of industrial automation experts.</p>
      
      <p><strong>Here's what you can do next:</strong></p>
      
      <div class="feature">
        <h3>📦 Browse Our Product Catalog</h3>
        <p>Explore our complete range of Variable Frequency Drives and find the perfect solution for your needs.</p>
      </div>
      
      <div class="feature">
        <h3>💡 Get Expert Advice</h3>
        <p>Our technical team is ready to help you select the right VFD for your application.</p>
      </div>
      
      <div class="feature">
        <h3>🎁 New Customer Offer</h3>
        <p>Enjoy 10% OFF your first order! Use code: <strong>WELCOME10</strong></p>
      </div>
      
      <a href="#" class="cta-button">Start Shopping →</a>
      
      <p>If you have any questions, our support team is here to help you every step of the way.</p>
      
      <p>Best regards,<br>The Schneider VFD Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Schneider VFD. All rights reserved.</p>
      <p><a href="#">Contact Us</a> | <a href="#">Help Center</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  regular_appreciation: {
    name: 'Customer Appreciation',
    defaultSubject: '⭐ Thank You for Being Part of Our Journey',
    template: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 20px; }
    .content h2 { color: #1f2937; margin-top: 0; }
    .thank-you-box { background: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .products { display: flex; gap: 10px; margin: 20px 0; }
    .product { flex: 1; background: #f8fafc; padding: 15px; border-radius: 4px; text-align: center; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{tier_badge}} Thank You!</h1>
    </div>
    
    <div class="content">
      <h2>Dear {{customer_name}},</h2>
      
      <div class="thank-you-box">
        <h3 style="margin-top:0; color: #2563eb;">We Appreciate Your Trust</h3>
        <p>Your continued support means the world to us. Thank you for choosing Schneider VFD as your automation partner.</p>
      </div>
      
      <p><strong>What's New This Month:</strong></p>
      <ul>
        <li>New VFD models with enhanced energy efficiency</li>
        <li>Extended warranty program for loyal customers</li>
        <li>Free technical webinars and training sessions</li>
      </ul>
      
      <p>As a valued customer, you're eligible for our loyalty rewards program with exclusive benefits and early access to new products.</p>
      
      <a href="#" class="cta-button">View Your Rewards →</a>
      
      <p>Thank you for being an essential part of our success story.</p>
      
      <p>With gratitude,<br>The Schneider VFD Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Schneider VFD. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">Manage Preferences</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  win_back: {
    name: 'Win-Back Campaign',
    defaultSubject: "We Miss You! Here's a Special Offer",
    template: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 20px; }
    .content h2 { color: #1f2937; margin-top: 0; }
    .comeback-offer { background: #f5f3ff; border: 2px dashed #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .comeback-offer h3 { margin-top: 0; color: #7c3aed; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
    .footer a { color: #8b5cf6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>We Miss You, {{customer_name}}!</h1>
    </div>
    
    <div class="content">
      <h2>Come Back to Schneider VFD</h2>
      <p>It's been a while since we last connected, and we wanted to reach out to see how you're doing.</p>
      
      <div class="comeback-offer">
        <h3>🎉 Special Comeback Offer</h3>
        <p><strong>20% OFF your next order</strong></p>
        <p>Use code: <strong>COMEBACK20</strong></p>
        <p>Valid for the next 14 days</p>
      </div>
      
      <p><strong>Here's what you've been missing:</strong></p>
      <ul>
        <li>New product lines with cutting-edge technology</li>
        <li>Improved customer support and faster shipping</li>
        <li>Competitive pricing and flexible payment options</li>
        <li>Extended warranties and service packages</li>
      </ul>
      
      <a href="#" class="cta-button">Welcome Me Back →</a>
      
      <p>We'd love to have you back and serve your automation needs once again.</p>
      
      <p>Looking forward to reconnecting,<br>The Schneider VFD Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Schneider VFD. All rights reserved.</p>
      <p><a href="#">Contact Us</a> | <a href="#">View Catalog</a></p>
    </div>
  </div>
</body>
</html>
    `
  }
};

export function replacePlaceholders(
  template: string,
  data: Record<string, string>
): string {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  });
  return result;
}

export function getTemplatePreview(templateKey: string): string {
  const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES];
  if (!template) return '';
  
  return replacePlaceholders(template.template, {
    customer_name: 'John Doe',
    tier: 'regular',
    tier_badge: '⭐'
  });
}

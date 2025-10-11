import { Resend } from 'resend';

let resendClient = null;

function getResendClient() {
  if (!resendClient) {
    // Check if Resend API key is configured
    if (!process.env.SMTP_PASSWORD) {
      console.error('⚠️ Resend API key not configured! Email features will not work.');
      console.error('Required env var: SMTP_PASSWORD (Resend API key)');
      return null;
    }

    resendClient = new Resend(process.env.SMTP_PASSWORD);
    console.log('✅ Resend email client configured');
  }
  return resendClient;
}

// Default from email
const FROM_EMAIL = 'onboarding@resend.dev';

export async function sendMagicLink(email, token) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('Email not configured - skipping magic link email');
      return;
    }

    const magicUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Magic Login Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9333ea;">Admin Login</h2>
          <p>Click the link below to log in to your admin panel:</p>
          <a href="${magicUrl}" style="display: inline-block; padding: 12px 24px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Log In
          </a>
          <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
    
    console.log(`✅ Magic link sent to: ${email}`);
  } catch (error) {
    console.error('❌ Error sending magic link:', error.message);
    throw error;
  }
}

export async function sendNewsletter(email, subject, message) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('Email not configured - skipping newsletter');
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #9333ea; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Newsletter</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            ${message}
          </div>
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>You're receiving this because you subscribed to our newsletter.</p>
          </div>
        </div>
      `
    });
    
    console.log(`✅ Newsletter sent to: ${email}`);
  } catch (error) {
    console.error(`❌ Error sending newsletter to ${email}:`, error.message);
    throw error;
  }
}

export async function sendContactNotification(data) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('Email not configured - skipping contact notification');
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form: ${data.subject || 'No Subject'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Type:</strong> ${data.type}</p>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Subject:</strong> ${data.subject || 'N/A'}</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin-top: 20px; border-left: 4px solid #9333ea;">
            <p><strong>Message:</strong></p>
            <p>${data.message}</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Contact notification sent to admin');
  } catch (error) {
    console.error('❌ Error sending contact notification:', error.message);
    throw error;
  }
}

export async function sendLiveEventNotification(email, event) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('Email not configured - skipping live event notification');
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🔴 LIVE NOW: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">🔴 LIVE EVENT STARTING!</h1>
          </div>
          
          <div style="background: #1a1a1a; padding: 30px; margin-top: 20px; border-radius: 10px;">
            ${event.thumbnailUrl ? `<img src="${event.thumbnailUrl}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />` : ''}
            
            <h2 style="color: #9333ea; margin-top: 0;">${event.title}</h2>
            
            ${event.description ? `<p style="color: #ccc; line-height: 1.6;">${event.description}</p>` : ''}
            
            <div style="background: #000; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #888;">📅 <strong style="color: #fff;">When:</strong> ${new Date(event.scheduledAt).toLocaleString()}</p>
              ${event.accessFee > 0 ? `<p style="margin: 10px 0 0; color: #888;">💳 <strong style="color: #fff;">Fee:</strong> $${event.accessFee}</p>` : '<p style="margin: 10px 0 0; color: #888;">🎁 <strong style="color: #fff;">Free for Fan Club Members</strong></p>'}
            </div>
            
            <a href="${process.env.FRONTEND_URL}/live/${event.id}" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-top: 10px;">Join Live Event →</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>You're receiving this because you're subscribed to our fan club.</p>
          </div>
        </div>
      `
    });
    
    console.log(`✅ Live event notification sent to: ${email}`);
  } catch (error) {
    console.error(`❌ Error sending live event notification to ${email}:`, error.message);
    throw error;
  }
}

export async function sendVerificationEmail(email, name, token) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('Email not configured - skipping verification email');
      return;
    }

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '✨ Verify Your Email - Welcome to the Fan Club!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">Welcome to the Fan Club! 🎉</h1>
          </div>
          
          <div style="background: #1a1a1a; padding: 30px; margin-top: 20px; border-radius: 10px;">
            <h2 style="color: #9333ea;">Hi ${name}!</h2>
            
            <p style="color: #ccc; line-height: 1.6; font-size: 16px;">
              Thanks for joining our fan club! We're excited to have you as part of our community.
            </p>
            
            <p style="color: #ccc; line-height: 1.6; font-size: 16px;">
              To complete your signup and verify your email address, just click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Verify My Email →</a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px;">
              Or copy and paste this link into your browser:<br>
              <span style="color: #9333ea;">${verifyUrl}</span>
            </p>
            
            <p style="color: #666; font-size: 13px; margin-top: 20px;">
              This link will expire in 24 hours. If you didn't sign up for our fan club, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>See you on the inside! 🎵</p>
          </div>
        </div>
      `
    });
    
    console.log(`✅ Verification email sent to: ${email}`);
  } catch (error) {
    console.error(`❌ Error sending verification email to ${email}:`, error.message);
    throw error;
  }
}

import fetch from 'node-fetch';

// Unified Brevo HTTP API function (same as in routes/live.js)
const sendBrevoEmail = async (to, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY) {
    console.log('❌ BREVO_API_KEY not configured, skipping email')
    return false
  }

  try {
    console.log('✅ Brevo email service configured')
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: process.env.SENDER_NAME || 'Musician Website',
          email: process.env.SENDER_EMAIL || 'noreply@yourdomain.com'
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    })

    if (response.ok) {
      console.log(`✅ Email sent successfully to: ${to}`)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Brevo API error:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Email send error:', error)
    return false
  }
}

export async function sendMagicLink(email, token) {
  try {
    const magicUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
    
    const htmlContent = `<div>Admin login link: <a href="${magicUrl}">Log In</a></div>`;
    
    const success = await sendBrevoEmail(email, 'Your Magic Login Link', htmlContent);
    
    if (!success) {
      throw new Error('Failed to send magic link');
    }
    
    console.log(`✅ Magic link sent to: ${email}`);
  } catch (error) {
    console.error('❌ Error sending magic link:', error.message);
    throw error;
  }
}

export async function sendNewsletter(email, subject, message) {
  try {
    console.log(`📧 Attempting to send newsletter to: ${email}`);
    
    const htmlContent = `<div>${message}</div>`;
    
    const success = await sendBrevoEmail(email, subject, htmlContent);
    
    if (!success) {
      throw new Error('Failed to send newsletter');
    }
    
    console.log(`✅ Newsletter sent successfully to: ${email}`);
  } catch (error) {
    console.error(`❌ Error sending newsletter to ${email}:`, error.message);
    throw error;
  }
}

export async function sendContactNotification(data) {
  try {
    const htmlContent = `<div><h2>Contact Form</h2><p>${data.message}</p></div>`;
    
    const success = await sendBrevoEmail(
      process.env.ADMIN_EMAIL, 
      `New Contact Form: ${data.subject || 'No Subject'}`, 
      htmlContent
    );
    
    if (!success) {
      throw new Error('Failed to send contact notification');
    }
    
    console.log('✅ Contact notification sent to admin');
  } catch (error) {
    console.error('❌ Error sending contact notification:', error.message);
    throw error;
  }
}

export async function sendLiveEventNotification(email, event) {
  try {
    const htmlContent = `<div>Live event: ${event.title}</div>`;
    
    const success = await sendBrevoEmail(email, `🔴 LIVE NOW: ${event.title}`, htmlContent);
    
    if (!success) {
      throw new Error('Failed to send live event notification');
    }
    
    console.log(`✅ Live event notification sent to: ${email}`);
  } catch (error) {
    console.error(`❌ Error sending live event notification to ${email}:`, error.message);
    throw error;
  }
}

export async function sendVerificationEmail(email, name, token) {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    console.log(`📧 Attempting to send verification email to: ${email}`);
    console.log(`🔗 Verification URL: ${verifyUrl}`);
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">Welcome to the Fan Club! 🎉</h1>
        </div>
        <div style="background: #1a1a1a; padding: 30px; margin-top: 20px; border-radius: 10px;">
          <h2 style="color: #9333ea;">Hi ${name}!</h2>
          <p style="color: #ccc;">Thanks for joining! Click below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify My Email →</a>
          </div>
        </div>
      </div>
    `;
    
    const success = await sendBrevoEmail(email, '✨ Verify Your Email - Welcome to the Fan Club!', htmlContent);
    
    if (!success) {
      throw new Error('Failed to send verification email');
    }
    
    console.log(`✅ Verification email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`❌ Error sending verification email to ${email}:`, error.message);
    throw error;
  }
}

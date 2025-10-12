import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Testing Gmail SMTP Configuration...');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? 'SET' : 'NOT SET');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

console.log('📧 Testing email connection...');

try {
  await transporter.verify();
  console.log('✅ SMTP connection successful!');
  
  // Send test email
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: 'johnsonmbuguamuhabi@gmail.com', // Send to yourself first
    subject: '🧪 Test Email from Musician Website',
    html: '<h1>Test Email</h1><p>If you receive this, Gmail SMTP is working!</p>'
  });
  
  console.log('✅ Test email sent successfully!');
  console.log('Message ID:', info.messageId);
  
} catch (error) {
  console.error('❌ SMTP Error:', error.message);
  console.error('Full error:', error);
}

process.exit(0);

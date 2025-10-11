# 📧 Email Configuration Guide

## ✅ What's Been Fixed:

1. **Email Verification Restored** - Users must verify their email to join Fan Club
2. **Broadcast Emails Fixed** - Sends to all verified subscribers with proper error handling
3. **Better Logging** - See email send status in console
4. **Error Handling** - Won't crash if SMTP not configured

---

## 🔧 SMTP Configuration

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Musician App"
   - Copy the 16-character password

3. **Update `.env` file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

### Option 2: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_password
```

### Option 3: Custom SMTP Provider

For production, use a professional email service:

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.com
SMTP_PASSWORD=your_mailgun_password
```

**AWS SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_username
SMTP_PASSWORD=your_ses_smtp_password
```

---

## 🧪 Testing Email Configuration

### 1. Check Server Console on Startup

After configuring SMTP and restarting the backend, you should see:

```
✅ Email transporter configured: smtp.gmail.com
✅ Admin account initialized: ruachkol@gmail.com
```

If SMTP is **not** configured, you'll see:
```
⚠️ SMTP not configured! Email features will not work.
Required env vars: SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT
```

### 2. Test Email Verification

1. Go to Fan Club page
2. Enter name + email
3. Click "Join for FREE"
4. Check console for:
   ```
   ✅ Verification email sent to: user@email.com
   ```
5. Check your email inbox for verification link

### 3. Test Broadcast

1. Login as admin
2. Go to "Subscribers" section
3. Click "Send Broadcast"
4. Fill in subject and message
5. Send to "All Subscribers" or "Fan Club Only"
6. Check console for:
   ```
   📧 Sending broadcast to 5 subscribers...
   ✅ Newsletter sent to: user1@email.com
   ✅ Newsletter sent to: user2@email.com
   ✅ Broadcast complete: 5 sent, 0 failed
   ```

---

## 📊 How It Works Now

### **User Joins Fan Club:**
1. Enters name + email
2. Backend creates subscriber with `emailVerified: false`
3. Generates verification token
4. Sends verification email
5. User clicks link in email
6. Email verified → Can access fan club

### **Broadcast to Subscribers:**
1. Admin creates broadcast message
2. Backend queries verified subscribers only
3. Sends emails one by one with 100ms delay
4. Logs success/failure for each
5. Returns total sent/failed count

### **Email Not Configured:**
- App continues to work
- Warns in console
- No emails sent (gracefully skips)

---

## 🚨 Troubleshooting

### Problem: Emails Not Sending

**Check 1: SMTP Variables**
```bash
# In backend directory
cat .env | grep SMTP
```

Should show all 4 variables filled in.

**Check 2: Server Console**
Look for:
- ❌ `Error sending verification email: [error message]`
- ⚠️ `SMTP not configured!`

**Check 3: Gmail App Password**
- Must be 16 characters (no spaces)
- 2FA must be enabled
- Use App Password, NOT your regular password

**Check 4: Firewall/Network**
- Port 587 must be open
- Some networks block SMTP

### Problem: "Authentication Failed"

- **Gmail:** Use App Password, not regular password
- **Outlook:** Enable "Allow less secure apps"
- **Other:** Check username (some require full email, some just username)

### Problem: Emails Go to Spam

This is normal for development. In production:
1. Use a professional email service (SendGrid, Mailgun, etc.)
2. Configure SPF, DKIM, DMARC records
3. Use a domain email (not Gmail)
4. Warm up your sending reputation

---

## 🎯 Current Features

✅ **Email Verification** - Required to join fan club  
✅ **Verification Emails** - Beautiful HTML templates  
✅ **Resend Verification** - If user doesn't receive email  
✅ **Broadcast Emails** - Send to all or fan club only  
✅ **Admin Magic Links** - Login via email link  
✅ **Error Handling** - Graceful fallbacks if SMTP not configured  
✅ **Verified Emails Only** - Broadcasts only to verified users  
✅ **Rate Limiting** - 100ms delay between emails  

---

## 📝 Production Checklist

Before deploying to production:

- [ ] Configure professional SMTP service (SendGrid/Mailgun)
- [ ] Update `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
- [ ] Test verification emails
- [ ] Test broadcast to yourself first
- [ ] Add "Unsubscribe" links (future feature)
- [ ] Configure email tracking/analytics
- [ ] Set up domain authentication (SPF/DKIM)
- [ ] Monitor bounce rates

---

## 💡 Tips

**Development:**
- Use your personal Gmail with App Password
- Test with your own email address
- Check spam folder

**Production:**
- Use SendGrid (100 free emails/day) or Mailgun
- Use domain email (e.g., noreply@yourdomain.com)
- Monitor email deliverability
- Keep subscriber list clean

---

## 🆘 Need Help?

1. **Check server console** for error messages
2. **Verify .env variables** are correct
3. **Test with a simple email first** (not broadcast)
4. **Check email spam folder**
5. **Try a different SMTP provider**

If emails still don't work, the app will continue functioning, but users won't receive verification/broadcast emails.

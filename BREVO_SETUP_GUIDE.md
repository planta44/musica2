# 📧 Brevo (Sendinblue) Email Setup Guide

## 🎯 **Why Brevo?**

- ✅ **Free Tier:** 300 emails/day (better than SendGrid's 100)
- ✅ **HTTP API:** No SMTP ports needed (works perfectly with Render)
- ✅ **Easy Signup:** No credit card required
- ✅ **Reliable:** Used by millions of developers

---

## 📋 **Step-by-Step Setup**

### **PART 1: Get Brevo API Key (5 minutes)**

1. **Go to:** https://app.brevo.com/account/register
2. **Sign up** with your email (johnsonmbuguamuhabi@gmail.com)
3. **Verify your email** (check inbox)
4. **After login, go to:** Settings → SMTP & API → API Keys
5. **Click:** "Generate a new API key"
6. **Name:** "Musician Website"
7. **Copy the API key** (looks like: `xkeysib-xxxxx...`)
8. **Save it somewhere safe!**

---

### **PART 2: Configure Sender Email**

1. **Still in Brevo Dashboard**
2. **Go to:** Settings → Senders & IP
3. **Click:** "Add a sender"
4. **Enter:**
   - Name: `Bonke` (your artist name)
   - Email: `johnsonmbuguamuhabi@gmail.com`
5. **Click:** "Save"
6. **Check your Gmail** for verification email from Brevo
7. **Click the verification link**
8. **Done!** ✅

---

### **PART 3: Setup Locally (Your Computer)**

#### **A. Update .env File**

Open `backend/.env` and replace the email section:

```env
# Email (for magic links and newsletters)
# Using Brevo HTTP API - Works perfectly with Render (no SMTP ports)
BREVO_API_KEY=your_brevo_api_key_

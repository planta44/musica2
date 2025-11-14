# 🚨 **URGENT: Fix Brevo IP Restriction**

## **Problem:**
Brevo is blocking Render's IP address: `74.220.52.2`

## **Quick Fix:**
1. **Go to:** https://app.brevo.com/security/authorised_ips
2. **Add IP:** `74.220.52.2` 
3. **OR Better:** **Disable IP restrictions** entirely

## **Steps:**
### **Option A: Add Render IP**
- Click "Add IP Address"
- Enter: `74.220.52.2`
- Save

### **Option B: Disable IP Restrictions (Recommended)**
- Turn OFF "Enable IP Address Restriction"
- This allows emails from any server (safer for cloud hosting)

## **Why This Happened:**
Render uses shared/dynamic IP addresses that change. IP restrictions break cloud deployments.

**Fix this FIRST, then I'll handle the database issue.**

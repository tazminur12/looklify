# ⚠️ IMPORTANT: Fix "Failed to get EPS token" Error

## Problem
Getting **"Payment Error: Failed to get EPS token"** because Next.js loads environment variables from `.env.local`, not from `.env`.

## ✅ Solution Applied

I've already added the EPS variables to your `.env.local` file. Now you need to:

## 🔄 Required Steps

### 1. **Restart Development Server** (IMPORTANT!)

Environment variables are only loaded when the server starts. You MUST restart:

```bash
# Stop current server (Ctrl + C)
# Then restart:
npm run dev
```

### 2. **Verify Variables are Loaded**

After restarting, visit this URL to check:

```
http://localhost:3000/api/eps/debug
```

You should see:
```json
{
  "success": true,
  "config": {
    "hasUsername": true,
    "hasPassword": true,
    "hasHashKey": true,
    "hasMerchantId": true,
    "hasStoreId": true,
    "apiBase": "https://pgapi.eps.com.bd",
    ...
  },
  "message": "All variables present? true"
}
```

### 3. **Test EPS Payment**

1. Go to checkout: `http://localhost:3000/checkout`
2. Fill in shipping details
3. Select **"EPS Payment Gateway"**
4. Click **"Pay with EPS"**

## 📝 What Was Added to `.env.local`

```env
# EPS Payment Gateway Configuration
EPS_USERNAME=Shohan.h.alfaz@gmail.com
EPS_PASSWORD=Elitebanga8@
EPS_HASH_KEY=FMUNISHOY2lWZXDELITEBANGAFOOD&BEVERAGE
EPS_MERCHANT_ID=ece261fa-c158-4f14-8c4c-1916bf6fda8a
EPS_STORE_ID=45241ee8-dc3a-4526-a5d8-115114b98f72
EPS_API_BASE=https://pgapi.eps.com.bd
```

## 🐛 If Still Not Working

### Check Server Logs

Look for these logs in your terminal:

```bash
🔐 EPS Token Request: ...
✅ Token received
💳 Starting EPS payment flow...
```

### Common Issues:

1. **Server not restarted** → Restart with `npm run dev`
2. **Wrong file** → Make sure variables are in `.env.local` NOT `.env`
3. **Port already in use** → Kill process and restart
4. **Typo in variable names** → Check spelling matches exactly

## 📊 Server Logs to Watch

When you click "Pay with EPS", you should see:

```
💳 Starting EPS payment flow...
🔐 EPS Token Request: { url: 'https://pgapi.eps.com.bd/v1/Auth/GetToken', ... }
🔐 EPS Token Response: { status: 200, responseCode: '0', hasToken: true }
✅ Token received
✅ Order created: ORDER-123...
💳 EPS Init Request: { ... }
💳 EPS Init Response: { status: 200, responseCode: '0', hasRedirectUrl: true }
✅ Payment initialized, redirecting...
```

## ✅ Success Indicators

- No more "Failed to get EPS token" error
- Browser redirects to EPS payment page
- Can see transaction in EPS dashboard

## 🚨 Quick Fix Command

If everything above doesn't work, try this:

```bash
# 1. Stop server (Ctrl + C)

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart
npm run dev
```

---

**Remember:** Always restart the development server after modifying `.env.local` file!

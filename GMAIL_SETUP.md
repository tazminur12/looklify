# 📧 Gmail Email Setup Guide for Password Reset

এই guide আপনাকে Gmail দিয়ে password reset emails পাঠানোর জন্য setup করতে সাহায্য করবে।

## ❌ Common Error

যদি আপনি এই error দেখেন:
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

এর মানে হল Gmail আপনার credentials accept করছে না। সাধারণত এর কারণ হল:
- ❌ Regular Gmail password ব্যবহার করা (যা কাজ করবে না)
- ❌ App Password না তৈরি করা
- ❌ 2-Step Verification enable না করা

## ✅ Solution: Gmail App Password Setup

### Step 1: Enable 2-Step Verification

1. আপনার [Google Account](https://myaccount.google.com/) এ যান
2. **Security** tab এ যান
3. **2-Step Verification** enable করুন (যদি আগে থেকে enable না থাকে)

### Step 2: Generate App Password

1. Google Account → **Security** → **2-Step Verification** section এ যান
2. Scroll down করে **App passwords** section খুঁজুন
3. **Select app** dropdown থেকে **Mail** select করুন
4. **Select device** dropdown থেকে **Other (Custom name)** select করুন
5. "Looklify" লিখুন
6. **Generate** button click করুন
7. আপনি একটি **16-character password** দেখতে পাবেন (যেমন: `abcd efgh ijkl mnop`)

### Step 3: Add to Environment Variables

আপনার `.env.local` file এ যোগ করুন:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**⚠️ Important:**
- App Password-এ কোন space রাখবেন না (যদি space থাকে তাহলে remove করুন)
- Password exactly 16 characters হতে হবে
- Regular Gmail password ব্যবহার করবেন না, শুধুমাত্র App Password

### Step 4: Restart Your Server

Environment variables change করার পর server restart করুন:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Verify Your Setup

1. `.env.local` file open করুন
2. Check করুন:
   - `EMAIL_USER` আপনার Gmail address আছে কিনা
   - `EMAIL_PASS` exactly 16 characters আছে কিনা (no spaces)
3. Server logs check করুন - এখন error message আরও helpful হবে

## 🧪 Test the Setup

1. Browser এ যান: `http://localhost:3000/forgot-password`
2. আপনার registered email address দিন
3. Submit করুন
4. Server console check করুন:
   - ✅ Success: `✅ Gmail SMTP connection verified successfully`
   - ✅ Success: `✅ Password reset email sent successfully to: ...`
   - ❌ Error: Detailed error messages দেখাবে যা আপনাকে guide করবে

## 🐛 Troubleshooting

### Error: "Username and Password not accepted"
- ✅ Check করুন App Password correct আছে কিনা
- ✅ Check করুন password-এ কোন space আছে কিনা
- ✅ Verify করুন 2-Step Verification enabled আছে কিনা

### Email Not Sending
- ✅ Check করুন `.env.local` file এর variables correctly set আছে
- ✅ Server restart করেছেন কিনা
- ✅ Console logs check করুন detailed error messages এর জন্য

### Still Having Issues?
1. Google Account Security settings check করুন
2. Try করুন একটি নতুন App Password generate করতে
3. Verify করুন App Password exact copy করেছেন (no extra spaces)

## 📝 Alternative Email Providers

Gmail ছাড়াও আপনি অন্য SMTP providers ব্যবহার করতে পারেন:

### For Other SMTP Providers:

আপনার `.env.local` এ:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

Code automatically detect করবে এবং configure করবে।

## 💡 Tips

- 🔒 App Password ব্যবহার করুন security এর জন্য
- 🔄 প্রতি কিছুদিন পর পর App Password change করুন
- 📧 Test email আপনার নিজের email address এ পাঠান
- 🧹 Old/unused App Passwords delete করুন Google Account থেকে

---

**Need Help?** Server console এ detailed error messages দেখুন - সেগুলো আপনাকে exact problem identify করতে সাহায্য করবে।


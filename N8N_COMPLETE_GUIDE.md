# n8n সম্পূর্ণ ব্যবহার গাইড - Step by Step

## 📚 Table of Contents
1. [n8n কি এবং কেন প্রয়োজন](#n8n-কি-এবং-কেন-প্রয়োজন)
2. [n8n Install করা](#n8n-install-করা)
3. [n8n Account তৈরি করা](#n8n-account-তৈরি-করা)
4. [Workflow Import করা](#workflow-import-করা)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Credentials Setup](#credentials-setup)
7. [Workflow Configure করা](#workflow-configure-করা)
8. [Webhook URL সংগ্রহ করা](#webhook-url-সংগ্রহ-করা)
9. [Testing করা](#testing-করা)
10. [Production এ Deploy করা](#production-এ-deploy-করা)
11. [Frontend/Backend এ Integration](#frontendbackend-এ-integration)

---

## n8n কি এবং কেন প্রয়োজন?

**n8n** হলো একটি **workflow automation tool** যা:
- বিভিন্ন services এর মধ্যে connection তৈরি করে
- Automated tasks execute করে
- Email, WhatsApp, SMS ইত্যাদি পাঠায়
- API calls handle করে

**আপনার Looklify project এ n8n কেন প্রয়োজন:**
- Automation Brain route থেকে decision নিয়ে automatically email/WhatsApp পাঠাতে হবে
- Manual intervention ছাড়াই customer engagement handle করতে হবে

---

## n8n Install করা

### Option 1: n8n Cloud ব্যবহার (সবচেয়ে সহজ)

**Step 1:** Browser এ যান
```
https://n8n.io
```

**Step 2:** **Sign Up** button এ click করুন

**Step 3:** Email এবং password দিয়ে account তৈরি করুন

**Step 4:** Email verification করুন

**Step 5:** Login করুন

✅ **Done!** n8n cloud ready!

---

### Option 2: Self-Hosted (Local বা Server এ)

**Step 1:** Node.js install করুন (যদি না থাকে)
```bash
# Check করুন Node.js আছে কিনা
node --version

# যদি না থাকে, install করুন
# macOS:
brew install node

# Linux:
sudo apt install nodejs npm

# Windows:
# nodejs.org থেকে download করুন
```

**Step 2:** n8n install করুন
```bash
# Global install
npm install -g n8n

# বা npx দিয়ে run করুন (install ছাড়াই)
npx n8n
```

**Step 3:** n8n start করুন
```bash
n8n start
```

**Step 4:** Browser এ যান
```
http://localhost:5678
```

**Step 5:** First time setup:
- Name দিন
- Email দিন
- Password set করুন

✅ **Done!** n8n running locally!

---

## n8n Account তৈরি করা

### Cloud Version:

**Step 1:** https://n8n.io এ যান

**Step 2:** **Get Started** বা **Sign Up** click করুন

**Step 3:** Form fill করুন:
- **Email**: আপনার email address
- **Password**: Strong password (minimum 8 characters)
- **Name**: আপনার নাম

**Step 4:** **Create Account** click করুন

**Step 5:** Email verification:
- Email inbox check করুন
- Verification link click করুন

**Step 6:** Login করুন n8n cloud dashboard এ

✅ **Account তৈরি সম্পন্ন!**

---

## Workflow Import করা

### Step 1: n8n Dashboard এ যান

**Cloud:** https://app.n8n.io  
**Self-hosted:** http://localhost:5678

### Step 2: Workflows Section এ যান

Left sidebar এ **"Workflows"** menu click করুন

### Step 3: Import Button Click করুন

Top right corner এ **"Import"** বা **"Import from File"** button click করুন

### Step 4: JSON File Select করুন

**Step 4.1:** File picker open হবে

**Step 4.2:** আপনার project folder এ যান:
```
/Users/m2air/Documents/Sohan/looklify/
```

**Step 4.3:** এই file select করুন:
```
n8n-workflow-looklify-automation.json
```

**Step 4.4:** **Open** click করুন

### Step 5: Import Confirm করুন

**Step 5.1:** n8n workflow preview দেখাবে

**Step 5.2:** **Import** button click করুন

### Step 6: Workflow Save করুন

**Step 6.1:** Workflow name check করুন:
- Name: "Looklify Automation Brain Workflow"

**Step 6.2:** Top right corner এ **"Save"** button click করুন

✅ **Workflow Import সম্পন্ন!**

---

## Environment Variables Setup

### Step 1: n8n Settings এ যান

**Cloud:**
- Top right corner এ profile icon click করুন
- **Settings** select করুন

**Self-hosted:**
- Left sidebar এ **Settings** click করুন

### Step 2: Environment Variables Section

**Step 2.1:** **Environment Variables** বা **Variables** tab click করুন

**Step 2.2:** **Add Variable** button click করুন

### Step 3: Variables Add করুন

নিচের variables গুলো একে একে add করুন:

#### Variable 1: LOOKLIFY_API_URL

**Step 3.1.1:** **Name**: `LOOKLIFY_API_URL`

**Step 3.1.2:** **Value**: 
```
http://localhost:3000
```
(Development এর জন্য)

অথবা production এর জন্য:
```
https://your-domain.com
```

**Step 3.1.3:** **Save** click করুন

---

#### Variable 2: EMAIL_FROM

**Step 3.2.1:** **Name**: `EMAIL_FROM`

**Step 3.2.2:** **Value**: 
```
noreply@looklify.com
```
(আপনার email address)

**Step 3.2.3:** **Save** click করুন

---

#### Variable 3: ADMIN_EMAIL

**Step 3.3.1:** **Name**: `ADMIN_EMAIL`

**Step 3.3.2:** **Value**: 
```
admin@looklify.com
```
(Admin email address)

**Step 3.3.3:** **Save** click করুন

---

#### Variable 4: LOOKLIFY_WEB_URL (Optional)

**Step 3.4.1:** **Name**: `LOOKLIFY_WEB_URL`

**Step 3.4.2:** **Value**: 
```
http://localhost:3000
```
(Website URL)

**Step 3.4.3:** **Save** click করুন

### Step 4: Variables Verify করুন

**Step 4.1:** সব variables list এ আছে কিনা check করুন

**Step 4.2:** Values correct আছে কিনা verify করুন

✅ **Environment Variables Setup সম্পন্ন!**

---

## Credentials Setup

### Email Credentials (SMTP) Setup

#### Step 1: Credentials Section এ যান

**Step 1.1:** Left sidebar এ **"Credentials"** click করুন

**Step 1.2:** **Add Credential** button click করুন

#### Step 2: SMTP Select করুন

**Step 2.1:** Search box এ **"SMTP"** type করুন

**Step 2.2:** **SMTP** credential type select করুন

#### Step 3: SMTP Details Fill করুন

**Gmail এর জন্য:**

**Step 3.1:** **Credential Name**: `SMTP Account` (বা আপনার পছন্দমতো নাম)

**Step 3.2:** **User**: 
```
your-email@gmail.com
```

**Step 3.3:** **Password**: 
```
your-app-password
```
(⚠️ Gmail App Password ব্যবহার করুন, regular password নয়)

**Step 3.4:** **Host**: 
```
smtp.gmail.com
```

**Step 3.5:** **Port**: 
```
465
```
(SSL এর জন্য) অথবা `587` (TLS এর জন্য)

**Step 3.6:** **Secure**: 
```
true
```
(checkbox check করুন)

**Step 3.7:** **Save** click করুন

---

**Gmail App Password তৈরি করা (যদি না থাকে):**

1. Google Account → **Security** → **2-Step Verification** enable করুন
2. **App Passwords** → **Select App**: Mail → **Select Device**: Other
3. **Generate** click করুন
4. 16-digit password copy করুন
5. এই password n8n এ use করুন

---

**Outlook/Hotmail এর জন্য:**

- **Host**: `smtp-mail.outlook.com`
- **Port**: `587`
- **Secure**: `true`

**Custom SMTP এর জন্য:**

আপনার email provider এর SMTP settings use করুন

#### Step 4: Test Connection

**Step 4.1:** **Test** button click করুন (যদি available থাকে)

**Step 4.2:** Success message দেখলে OK

✅ **SMTP Credentials Setup সম্পন্ন!**

---

### WhatsApp Credentials Setup (Optional)

#### Step 1: WhatsApp API Provider Select করুন

Popular options:
- Twilio WhatsApp API
- WhatsApp Business API
- Other providers

#### Step 2: Credential Add করুন

**Step 2.1:** **Credentials** → **Add Credential**

**Step 2.2:** **WhatsApp** search করুন

**Step 2.3:** আপনার provider select করুন

**Step 2.4:** Required credentials fill করুন:
- API Key
- Account SID
- Phone Number
- etc.

**Step 2.5:** **Save** click করুন

✅ **WhatsApp Credentials Setup সম্পন্ন!** (যদি ব্যবহার করতে চান)

---

## Workflow Configure করা

### Step 1: Workflow Open করুন

**Step 1.1:** **Workflows** section এ যান

**Step 1.2:** **"Looklify Automation Brain Workflow"** click করুন

### Step 2: Nodes Check করুন

Workflow এ এই nodes থাকবে:
1. **Webhook Trigger** - Events receive করে
2. **Call Automation Brain** - API call করে
3. **Route Actions** - Actions route করে
4. **Send Email** - Email পাঠায়
5. **Send WhatsApp** - WhatsApp পাঠায়
6. **Other Email Nodes** - বিভিন্ন email types
7. **Merge Results** - Results combine করে
8. **Webhook Response** - Response দেয়

### Step 3: Call Automation Brain Node Configure করুন

**Step 3.1:** **"Call Automation Brain"** node এ click করুন

**Step 3.2:** **URL** field check করুন:
```
{{ $env.LOOKLIFY_API_URL || 'http://localhost:3000' }}/api/automation/brain
```

**Step 3.3:** যদি URL change করতে হয়:
- **URL** field edit করুন
- Environment variable use করুন: `{{ $env.LOOKLIFY_API_URL }}/api/automation/brain`

**Step 3.4:** **Save** click করুন

### Step 4: Email Nodes Configure করুন

**Step 4.1:** প্রতিটি **Send Email** node এ click করুন

**Step 4.2:** **Credentials** section:
- **SMTP Account** select করুন (আগে তৈরি করা credential)

**Step 4.3:** **From Email** check করুন:
```
{{ $env.EMAIL_FROM || 'noreply@looklify.com' }}
```

**Step 4.4:** **To Email** check করুন (dynamic থাকবে):
```
{{ $json.data.customer_email || $json.data.email }}
```

**Step 4.5:** **Subject** check করুন

**Step 4.6:** **Message** check করুন

**Step 4.7:** **Save** click করুন

### Step 5: WhatsApp Nodes Configure করুন (যদি ব্যবহার করেন)

**Step 5.1:** **Send WhatsApp** node এ click করুন

**Step 5.2:** **Credentials** section:
- **WhatsApp Account** select করুন

**Step 5.3:** **To** field check করুন:
```
{{ $json.data.customer_phone || $json.data.phone }}
```

**Step 5.4:** **Save** click করুন

### Step 6: Admin Email Node Configure করুন

**Step 6.1:** **"Notify Admin Email"** node এ click করুন

**Step 6.2:** **To Email** field check করুন:
```
{{ $env.ADMIN_EMAIL || 'admin@looklify.com' }}
```

**Step 6.3:** **Save** click করুন

### Step 7: Workflow Save করুন

**Step 7.1:** Top right corner এ **"Save"** button click করুন

✅ **Workflow Configuration সম্পন্ন!**

---

## Webhook URL সংগ্রহ করা

### Step 1: Webhook Node Open করুন

**Step 1.1:** Workflow এ **"Webhook Trigger"** node এ click করুন

**Step 1.2:** Node details panel open হবে

### Step 2: Webhook Activate করুন

**Step 2.1:** Top right corner এ **"Execute Workflow"** button click করুন

**Step 2.2:** n8n workflow activate করবে

**Step 2.3:** Webhook URL generate হবে

### Step 3: Webhook URL Copy করুন

**Step 3.1:** Webhook node panel এ **"Webhook URL"** field দেখবেন

**Step 3.2:** URL copy করুন:
```
https://your-n8n-instance.com/webhook/looklify-automation
```
অথবা
```
http://localhost:5678/webhook/looklify-automation
```

**Step 3.3:** এই URL save করুন (notepad এ বা file এ)

### Step 4: Webhook Method Verify করুন

**Step 4.1:** **HTTP Method** check করুন:
- **POST** selected থাকতে হবে

**Step 4.2:** **Path** check করুন:
- `/looklify-automation` (default)

✅ **Webhook URL সংগ্রহ সম্পন্ন!**

**⚠️ Important:** 
- Workflow active থাকলে webhook কাজ করবে
- Workflow inactive করলে webhook কাজ করবে না
- Production এ workflow সবসময় active রাখুন

---

## Testing করা

### Method 1: n8n Interface থেকে Test

#### Step 1: Test Data তৈরি করুন

**Step 1.1:** Webhook node panel এ scroll down করুন

**Step 1.2:** **"Test"** section দেখবেন

**Step 1.3:** **"Send Test Request"** button click করুন

**Step 1.4:** Test data automatically generate হবে

#### Step 2: Manual Test Data Add করুন

**Step 2.1:** **"Body"** section এ click করুন

**Step 2.2:** এই JSON paste করুন:
```json
{
  "event": "NEW_USER",
  "userId": "test_user_123",
  "additionalData": {
    "name": "Test User"
  }
}
```

**Step 2.3:** **"Send Test Request"** click করুন

#### Step 3: Execution Check করুন

**Step 3.1:** Workflow execution start হবে

**Step 3.2:** প্রতিটি node এর status check করুন:
- ✅ Green = Success
- ❌ Red = Error
- ⏸️ Yellow = Waiting

**Step 3.3:** **"Call Automation Brain"** node check করুন:
- API call successful?
- Response received?

**Step 3.4:** **"Route Actions"** node check করুন:
- Correct action selected?

**Step 3.5:** **"Send Email"** node check করুন:
- Email sent successfully?

#### Step 4: Email Verify করুন

**Step 4.1:** Test email address check করুন

**Step 4.2:** Email received হয়েছে কিনা verify করুন

✅ **Test সম্পন্ন!**

---

### Method 2: cURL দিয়ে Test

#### Step 1: Terminal Open করুন

**Step 1.1:** Terminal/Command Prompt open করুন

#### Step 2: cURL Command Run করুন

**Step 2.1:** এই command paste করুন (আপনার webhook URL দিয়ে replace করুন):

```bash
curl -X POST https://your-n8n.com/webhook/looklify-automation \
  -H "Content-Type: application/json" \
  -d '{
    "event": "NEW_USER",
    "userId": "test_user_123",
    "additionalData": {}
  }'
```

**Step 2.2:** Enter press করুন

#### Step 3: Response Check করুন

**Step 3.1:** Terminal এ response দেখবেন:
```json
{
  "success": true,
  "action": "send_email",
  "message": "Welcome to Looklify..."
}
```

**Step 3.2:** n8n dashboard এ execution দেখবেন

✅ **cURL Test সম্পন্ন!**

---

### Method 3: Postman দিয়ে Test

#### Step 1: Postman Open করুন

**Step 1.1:** Postman application open করুন

#### Step 2: New Request তৈরি করুন

**Step 2.1:** **New** → **HTTP Request** click করুন

**Step 2.2:** Method: **POST** select করুন

**Step 2.3:** URL field এ webhook URL paste করুন:
```
https://your-n8n.com/webhook/looklify-automation
```

#### Step 3: Headers Set করুন

**Step 3.1:** **Headers** tab click করুন

**Step 3.2:** Add করুন:
- **Key**: `Content-Type`
- **Value**: `application/json`

#### Step 4: Body Set করুন

**Step 4.1:** **Body** tab click করুন

**Step 4.2:** **raw** select করুন

**Step 4.3:** **JSON** select করুন

**Step 4.4:** এই JSON paste করুন:
```json
{
  "event": "ORDER_SUCCESS",
  "userId": "user_123",
  "orderId": "order_456",
  "additionalData": {}
}
```

#### Step 5: Send করুন

**Step 5.1:** **Send** button click করুন

**Step 5.2:** Response দেখবেন

**Step 5.3:** n8n dashboard এ execution check করুন

✅ **Postman Test সম্পন্ন!**

---

## Production এ Deploy করা

### Step 1: Environment Variables Update করুন

**Step 1.1:** Production environment variables set করুন:

```env
LOOKLIFY_API_URL=https://your-production-domain.com
EMAIL_FROM=noreply@looklify.com
ADMIN_EMAIL=admin@looklify.com
LOOKLIFY_WEB_URL=https://your-production-domain.com
```

### Step 2: Webhook URL Update করুন

**Step 2.1:** Production n8n webhook URL note করুন:
```
https://your-production-n8n.com/webhook/looklify-automation
```

### Step 3: Workflow Activate করুন

**Step 3.1:** Production n8n instance এ workflow open করুন

**Step 3.2:** **"Active"** toggle ON করুন

**Step 3.3:** **"Save"** click করুন

### Step 4: Test করুন

**Step 4.1:** Production environment এ test event send করুন

**Step 4.2:** Everything working আছে কিনা verify করুন

✅ **Production Deploy সম্পন্ন!**

---

## Frontend/Backend এ Integration

### Frontend Integration (React/Next.js)

#### Step 1: Helper Function তৈরি করুন

**Step 1.1:** আপনার project এ একটি utility file তৈরি করুন:
```
src/lib/automation.js
```

**Step 1.2:** এই code add করুন:

```javascript
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 
  'https://your-n8n.com/webhook/looklify-automation';

export async function triggerAutomation(event, data) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: event,
        userId: data.userId,
        orderId: data.orderId,
        productId: data.productId,
        additionalData: data.additionalData || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Automation failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Automation triggered:', result);
    return result;
  } catch (error) {
    console.error('Automation error:', error);
    // Don't throw - automation failure shouldn't break user flow
    return null;
  }
}
```

#### Step 2: Environment Variable Add করুন

**Step 2.1:** `.env.local` file এ add করুন:
```
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n.com/webhook/looklify-automation
```

#### Step 3: Use করুন

**Order Success হলে:**
```javascript
import { triggerAutomation } from '@/lib/automation';

// Order complete করার পর
await triggerAutomation('ORDER_SUCCESS', {
  userId: user.id,
  orderId: order.id
});
```

**Product View হলে:**
```javascript
// Product page এ
useEffect(() => {
  if (user && productId) {
    triggerAutomation('PRODUCT_VIEW', {
      userId: user.id,
      productId: productId,
      additionalData: {
        viewCount: viewCount
      }
    });
  }
}, [productId, user]);
```

**Cart Abandoned হলে:**
```javascript
// Checkout started কিন্তু complete না হলে (30 min পর)
setTimeout(() => {
  if (!orderCompleted) {
    triggerAutomation('CART_ABANDONED', {
      userId: user.id,
      additionalData: {
        cartItems: cartItems,
        cartValue: totalPrice
      }
    });
  }
}, 30 * 60 * 1000); // 30 minutes
```

---

### Backend Integration (API Routes)

#### Step 1: API Route এ Use করুন

**Order Create Route:**
```javascript
// src/app/api/orders/route.js
import { triggerAutomation } from '@/lib/automation';

export async function POST(request) {
  // ... order create logic ...
  
  const order = await Order.create(orderData);
  
  // Automation trigger করুন
  await triggerAutomation('ORDER_SUCCESS', {
    userId: order.user.toString(),
    orderId: order._id.toString()
  });
  
  return NextResponse.json({ order });
}
```

**User Register Route:**
```javascript
// src/app/api/auth/register/route.js
import { triggerAutomation } from '@/lib/automation';

export async function POST(request) {
  // ... user create logic ...
  
  const user = await User.create(userData);
  
  // Automation trigger করুন
  await triggerAutomation('NEW_USER', {
    userId: user._id.toString()
  });
  
  return NextResponse.json({ user });
}
```

---

## Troubleshooting

### Problem 1: Webhook Response না পাচ্ছেন

**Solution:**
1. Workflow active আছে কিনা check করুন
2. Webhook URL correct আছে কিনা verify করুন
3. n8n execution logs check করুন

### Problem 2: Email না যাচ্ছে

**Solution:**
1. SMTP credentials correct আছে কিনা check করুন
2. Email node এর "To Email" field check করুন
3. Gmail App Password use করছেন কিনা verify করুন
4. n8n execution logs check করুন

### Problem 3: API Call Fail হচ্ছে

**Solution:**
1. `LOOKLIFY_API_URL` environment variable check করুন
2. Looklify API running আছে কিনা verify করুন
3. CORS settings check করুন
4. API endpoint correct আছে কিনা check করুন

### Problem 4: Workflow Execute হচ্ছে না

**Solution:**
1. Workflow active আছে কিনা check করুন
2. Webhook node properly configured আছে কিনা check করুন
3. n8n instance running আছে কিনা verify করুন
4. Execution logs check করুন

---

## Best Practices

1. **Always Test First**: Production এ deploy করার আগে local এ test করুন
2. **Monitor Executions**: n8n dashboard এ executions monitor করুন
3. **Error Handling**: Frontend/Backend এ proper error handling করুন
4. **Logging**: Important events log করুন
5. **Backup**: Workflow backup রাখুন
6. **Security**: Webhook URLs secure রাখুন
7. **Rate Limiting**: Too many requests avoid করুন

---

## Summary Checklist

- [ ] n8n install/account তৈরি করা
- [ ] Workflow import করা
- [ ] Environment variables setup করা
- [ ] SMTP credentials setup করা
- [ ] Workflow configure করা
- [ ] Webhook URL সংগ্রহ করা
- [ ] Testing করা
- [ ] Frontend/Backend integration করা
- [ ] Production deploy করা

---

**🎉 Congratulations! আপনি এখন n8n workflow সম্পূর্ণ setup করেছেন এবং ব্যবহার করতে পারবেন!**

**Questions থাকলে n8n documentation check করুন:** https://docs.n8n.io


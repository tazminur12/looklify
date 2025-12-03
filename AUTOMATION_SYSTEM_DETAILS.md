# Looklify Automation System - সম্পূর্ণ গাইড (বাংলায়)

## 📖 সূচিপত্র

1. [সিস্টেম পরিচিতি](#সিস্টেম-পরিচিতি)
2. [কিভাবে কাজ করে](#কিভাবে-কাজ-করে)
3. [System Architecture](#system-architecture)
4. [Event Types এবং তাদের Actions](#event-types-এবং-তাদের-actions)
5. [Discount Code System](#discount-code-system)
6. [n8n Workflow Setup](#n8n-workflow-setup)
7. [API Integration](#api-integration)
8. [Message Generation (AI)](#message-generation-ai)
9. [Google Sheets Integration](#google-sheets-integration)
10. [Testing এবং Troubleshooting](#testing-এবং-troubleshooting)

---

## 🎯 সিস্টেম পরিচিতি

Looklify Automation System একটি intelligent automation platform যা customer behavior, order events, এবং inventory changes এর উপর ভিত্তি করে automatically actions নেয়। এটি AI-powered message generation, discount code management, এবং multi-channel communication (Email, WhatsApp) support করে।

### মূল Features:

- ✅ **AI-Powered Messages**: Gemini AI ব্যবহার করে personalized Bengali-English mixed messages
- ✅ **Automatic Discount Codes**: Customer behavior অনুযায়ী automatic discount code generation এবং database save
- ✅ **Multi-Channel Communication**: Email এবং WhatsApp support
- ✅ **Smart Decision Making**: Customer data analyze করে intelligent decisions
- ✅ **Google Sheets Integration**: User data automatically Google Sheets এ save হয়
- ✅ **Event-Driven Architecture**: Real-time event processing

---

## 🔄 কিভাবে কাজ করে

### সম্পূর্ণ Flow (Step by Step):

```
1. Frontend/Backend থেকে Event Trigger হয়
   ↓
2. n8n Webhook এ Event Receive হয়
   ↓
3. Automation Brain API Call হয়
   ↓
4. Automation Brain Event Analyze করে:
   - Customer data fetch করে
   - Business logic apply করে
   - Decision নেয় (কি action নিতে হবে)
   - Discount code generate করে (যদি প্রয়োজন হয়)
   - Discount code database এ save করে
   ↓
5. Response return করে:
   {
     action: "send_vip_offer",
     message: "",
     data: {
       customer_name: "...",
       discount_code: "VIP15ABC",
       ...
     }
   }
   ↓
6. n8n Workflow Action Route করে
   ↓
7. Gemini AI Message Generate করে
   ↓
8. Email/WhatsApp Send হয়
   ↓
9. Google Sheets এ Data Save হয়
   ↓
10. Response Return হয়
```

### উদাহরণ: VIP Offer Flow

```
Customer Order Complete
   ↓
Automation Brain Check করে → Repeat Customer?
   ↓
হ্যাঁ হলে:
   - Discount Code Generate: "VIP15ABC"
   - Database এ Save করে (30 days validity)
   - Action: "send_vip_offer"
   ↓
n8n Workflow:
   - Gemini AI Message Generate করে
   - Email Send করে (discount code সহ)
   - WhatsApp Send করে (discount code সহ)
   - Google Sheets এ Save করে
   ↓
Customer Email/WhatsApp এ Code পায়
   ↓
Customer Checkout এ Code Use করতে পারে
```

---

## 🏗️ System Architecture

### Components:

1. **Automation Brain API** (`/api/automation/brain`)
   - Event process করে
   - Business logic apply করে
   - Discount code generate এবং save করে
   - Decision return করে

2. **n8n Workflow**
   - Webhook receive করে
   - Automation Brain call করে
   - AI message generate করে
   - Email/WhatsApp send করে
   - Google Sheets update করে

3. **Database (MongoDB)**
   - User data
   - Order data
   - Product data
   - PromoCode data (discount codes)

4. **AI Service (Gemini)**
   - Personalized messages generate করে
   - Bengali-English mixed content
   - Professional formatting

---

## 📋 Event Types এবং তাদের Actions

### 1. PRODUCT_VIEW
**কখন Trigger হয়**: Customer product page view করে

**Actions**:
- Product 3+ বার view হলে → Product recommendations send করে
- Otherwise → Database এ store করে

**Example**:
```javascript
{
  event: "PRODUCT_VIEW",
  userId: "user123",
  productId: "prod456",
  additionalData: {
    viewCount: 3
  }
}
```

---

### 2. ADD_TO_CART
**কখন Trigger হয়**: Customer cart এ product add করে

**Actions**:
- First time + High value cart (>2000৳) → Welcome email send করে
- Otherwise → Database এ store করে

**Example**:
```javascript
{
  event: "ADD_TO_CART",
  userId: "user123",
  productId: "prod456",
  additionalData: {
    cartValue: 2500,
    isFirstTime: true
  }
}
```

---

### 3. CHECKOUT_STARTED
**কখন Trigger হয়**: Customer checkout page এ যায়

**Actions**:
- Database এ store করে (cart recovery এর জন্য)

---

### 4. ORDER_SUCCESS
**কখন Trigger হয়**: Order successfully complete হয়

**Actions**:
- Invoice email send করে
- Admin notify করে
- **Repeat Customer হলে**:
  - VIP Discount Code generate করে (15% off)
  - Code database এ save করে
  - VIP offer email/WhatsApp send করে

**Discount Code Details**:
- Code Format: `VIP15ABC` (prefix + percentage + random)
- Validity: 30 days
- Usage: 1 time per user
- User-specific: Yes

**Example Response**:
```json
{
  "action": "send_invoice,notify_admin,send_vip_offer",
  "message": "",
  "data": {
    "order_id": "ORD123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "discount_code": "VIP15ABC",
    "discount_percentage": 15,
    "is_repeat_customer": true
  }
}
```

---

### 5. ORDER_DELIVERED
**কখন Trigger হয়**: Order deliver হয়

**Actions**:
- Delivery confirmation email send করে
- Review request করে

---

### 6. REVIEW_SUBMITTED
**কখন Trigger হয়**: Customer product review submit করে

**Actions**:
- Thank you email send করে
- **Discount Code generate করে (5% off)**
- Code database এ save করে

**Discount Code Details**:
- Code Format: `REVIEW5XYZ`
- Validity: 30 days
- Usage: 1 time per user

---

### 7. NEW_USER
**কখন Trigger হয়**: New user signup করে

**Actions**:
- Welcome email send করে
- **Welcome Discount Code generate করে (10% off)**
- Code database এ save করে

**Discount Code Details**:
- Code Format: `WELCOME10ABC`
- Validity: 30 days
- Usage: 1 time per user

---

### 8. CART_ABANDONED
**কখন Trigger হয়**: Customer checkout start করে কিন্তু complete না করে

**Actions**:
- Cart recovery email/WhatsApp send করে
- **Discount Code generate করে (8% off)**
- Code database এ save করে

**Discount Code Details**:
- Code Format: `CART8XYZ`
- Validity: 30 days
- Usage: 1 time per user

---

### 9. LOW_STOCK
**কখন Trigger হয়**: Product stock low হয়ে যায়

**Actions**:
- Admin কে alert email send করে

---

### 10. RESTOCK
**কখন Trigger হয়**: Product restock হয়

**Actions**:
- Wishlist users কে notification send করে
- Admin কে notify করে

---

### 11. RETURN_REQUEST
**কখন Trigger হয়**: Customer return request করে

**Actions**:
- Return confirmation email send করে
- Return process start করে

---

## 💳 Discount Code System

### দুই ধরনের Discount Code:

#### 1. Manual Promo Code (Dashboard থেকে)
- **কোথায় তৈরি**: Dashboard → Promo Codes → New Promo Code
- **কিভাবে কাজ করে**:
  1. Admin Dashboard এ যায়
  2. Promo Code তৈরি করে (code, discount %, validity, conditions)
  3. Database এ save হয়
  4. Customer checkout এ code use করতে পারে
  5. System code validate করে এবং discount apply করে

#### 2. Automated Discount Code (Automation Brain থেকে)
- **কোথায় তৈরি**: Automation Brain API automatically generate করে
- **কখন তৈরি হয়**:
  - **VIP Offer**: Repeat customer order complete → 15% discount
  - **Welcome Code**: New user signup → 10% discount
  - **Cart Recovery**: Cart abandon → 8% discount
  - **Review Code**: Product review submit → 5% discount

### Discount Code Generation Process:

```javascript
// Step 1: Code Generate
function generateDiscountCode(percentage, prefix = 'LOOK') {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${percentage}${random}`;
}
// Example: "VIP15ABC"

// Step 2: Database এ Save
async function saveDiscountCodeToDatabase(code, percentage, userId, context) {
  // Check if code already exists
  // Create PromoCode document
  // Save to database
  // Return saved code
}
```

### Discount Code Properties:

- **Validity**: 30 days (automated codes)
- **Usage Limit**: 1 time per user
- **User-Specific**: VIP/Welcome codes শুধু সেই user এর জন্য
- **Type**: Percentage discount
- **Minimum Order**: 0৳ (no minimum)

### Code Validation:

Checkout এ code validate হয় `/api/promo-codes/validate` endpoint দিয়ে:
- Database থেকে code check হয়
- Validity check হয়
- User eligibility check হয়
- Valid হলে discount apply হয়

---

## 🔧 n8n Workflow Setup

### Step 1: Workflow Import

1. n8n dashboard এ যান
2. **Workflows** → **Import from File**
3. `n8n-workflow-looklify-automation.json` file select করুন
4. Import করুন

### Step 2: Environment Variables

n8n এর environment variables এ add করুন:

```env
GEMINI_API_KEY=your_gemini_api_key_here
LOOKLIFY_API_URL=https://looklifybd.com
```

### Step 3: Credentials Setup

#### Gmail Credentials (Email পাঠানোর জন্য)

1. n8n → **Credentials** → **Add Credential**
2. **Gmail OAuth2** select করুন
3. Google OAuth setup করুন:
   - Google Cloud Console এ project create করুন
   - OAuth 2.0 credentials generate করুন
   - n8n এ credentials add করুন

#### WhatsApp Credentials (যদি WhatsApp ব্যবহার করতে চান)

1. n8n → **Credentials** → **Add Credential**
2. **WhatsApp API** select করুন
3. আপনার WhatsApp Business API credentials দিন

#### Google Sheets Credentials

1. n8n → **Credentials** → **Add Credential**
2. **Google Sheets OAuth2** select করুন
3. Google OAuth setup করুন

### Step 4: Google Sheets Setup

1. Google Sheets এ একটি spreadsheet তৈরি করুন
2. Sheet name: **"User List"**
3. First row এ headers add করুন:
   ```
   Timestamp | User Name | Email | Phone | User ID | Event Type | Action | Order ID | Product ID | Product Name | Order Total | Discount Code | Context | Status
   ```
4. Spreadsheet ID copy করুন (URL থেকে)
5. n8n workflow এর **Save User to Google Sheets** node এ:
   - Document ID: আপনার spreadsheet ID দিন
   - Sheet Name: "User List" select করুন

### Step 5: Webhook URL সংগ্রহ করুন

1. Workflow এ **Webhook Trigger** node এ ক্লিক করুন
2. **Execute Workflow** button এ ক্লিক করুন
3. Webhook URL copy করুন (যেমন: `https://your-n8n.com/webhook/looklify-automation`)

---

## 🔌 API Integration

### Frontend/Backend থেকে Event Send করা

```javascript
// Example: Order Success Event
const response = await fetch('https://your-n8n.com/webhook/looklify-automation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    event: 'ORDER_SUCCESS',
    userId: 'user_id_here',
    orderId: 'order_id_here',
    additionalData: {
      // optional additional data
    }
  })
});

const result = await response.json();
console.log(result);
```

### Supported Events:

1. `PRODUCT_VIEW` - Product view tracking
2. `ADD_TO_CART` - Add to cart event
3. `CHECKOUT_STARTED` - Checkout started
4. `ORDER_SUCCESS` - Order placed successfully
5. `ORDER_DELIVERED` - Order delivered
6. `REVIEW_SUBMITTED` - Review submitted
7. `PAGE_VISIT` - Page visit tracking
8. `LOW_STOCK` - Low stock alert
9. `RESTOCK` - Product restocked
10. `NEW_USER` - New user registered
11. `RETURN_REQUEST` - Return request
12. `CART_ABANDONED` - Cart abandoned

### Automation Brain API Response Format:

```json
{
  "action": "send_vip_offer",
  "message": "",
  "data": {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+8801234567890",
    "discount_code": "VIP15ABC",
    "discount_percentage": 15,
    "order_id": "ORD123",
    "order_total": 5000,
    "event_type": "ORDER_SUCCESS",
    "context": "repeat_customer_vip_offer"
  }
}
```

---

## 🤖 Message Generation (AI)

### Gemini AI Prompt:

System automatically Gemini AI ব্যবহার করে personalized messages generate করে। Prompt এ include আছে:

- **Brand Voice**: Warm, trustworthy, skincare-focused
- **Language**: Bengali-English mix (70% Bengali, 30% English)
- **Tone**: Professional yet friendly
- **Discount Code Display**: Prominent, clear, easy to copy
- **Format**: HTML for email, plain text for WhatsApp

### Message Structure:

#### Email Message:
- **Subject**: Max 60 characters, compelling
- **Body**: 150-300 words, HTML formatted
- **Structure**: Header → Content → Discount Code (if any) → CTA → Footer
- **Emojis**: 2-4 emojis strategically placed

#### WhatsApp Message:
- **Length**: Max 500 characters
- **Format**: Plain text with basic formatting
- **Structure**: Greeting → Message → Discount Code (if any) → CTA
- **Emojis**: 3-5 emojis for engagement

### Discount Code Display in Messages:

#### Email Format:
```html
<div style='background-color: #f0f0f0; padding: 20px; border-radius: 10px; text-align: center;'>
  <h2 style='color: #333;'>🎁 Your Exclusive VIP Discount Code</h2>
  <div style='background-color: #fff; padding: 15px; border: 2px dashed #ff6b6b;'>
    <p style='font-size: 32px; font-weight: bold; color: #ff6b6b;'>VIP15ABC</p>
  </div>
  <p><strong>15% OFF</strong> on your next purchase!</p>
</div>
```

#### WhatsApp Format:
```
🎟️ YOUR DISCOUNT CODE:
━━━━━━━━━━━━━━━━━━━━
📝 Code: *VIP15ABC*
💰 Discount: 15% OFF
🛒 Use at checkout!
```

---

## 📊 Google Sheets Integration

### Data Structure:

প্রতি event এর জন্য Google Sheets এ এই data save হয়:

| Column | Description | Example |
|--------|-------------|---------|
| Timestamp | Event time | 2024-01-15T10:30:00.000Z |
| User Name | Customer name | John Doe |
| Email | Customer email | john@example.com |
| Phone | Customer phone | +8801234567890 |
| User ID | User ID | user123 |
| Event Type | Event type | ORDER_SUCCESS |
| Action | Action taken | send_vip_offer |
| Order ID | Order ID | ORD123 |
| Product ID | Product ID | prod456 |
| Product Name | Product name | Face Cream |
| Order Total | Order amount | 5000 |
| Discount Code | Discount code | VIP15ABC |
| Context | Event context | repeat_customer_vip_offer |
| Status | Status | Active |

### Setup:

1. Google Sheets এ spreadsheet তৈরি করুন
2. Sheet name: **"User List"**
3. Headers add করুন (উপরে দেখানো format অনুযায়ী)
4. n8n workflow এ Google Sheets credentials connect করুন
5. Spreadsheet ID এবং Sheet name configure করুন

---

## 🧪 Testing এবং Troubleshooting

### Test Event Send করা

#### cURL Command:
```bash
curl -X POST https://your-n8n.com/webhook/looklify-automation \
  -H "Content-Type: application/json" \
  -d '{
    "event": "NEW_USER",
    "userId": "test_user_id",
    "additionalData": {}
  }'
```

#### JavaScript Example:
```javascript
// Test VIP Offer
const testEvent = async () => {
  const response = await fetch('https://your-n8n.com/webhook/looklify-automation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: 'ORDER_SUCCESS',
      userId: 'test_user_123',
      orderId: 'test_order_456',
      additionalData: {}
    })
  });
  
  const result = await response.json();
  console.log('Response:', result);
};

testEvent();
```

### Expected Response:

```json
{
  "action": "send_invoice,notify_admin,send_vip_offer",
  "message": "",
  "data": {
    "order_id": "test_order_456",
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "discount_code": "VIP15ABC",
    "discount_percentage": 15,
    "is_repeat_customer": true
  }
}
```

### Common Issues এবং Solutions:

#### 1. Email না যাচ্ছে?
- ✅ Gmail credentials check করুন
- ✅ Email node এর `toEmail` field check করুন
- ✅ n8n execution logs দেখুন
- ✅ Gmail OAuth token refresh করুন

#### 2. Discount Code Database এ Save হচ্ছে না?
- ✅ MongoDB connection check করুন
- ✅ Automation Brain API logs check করুন
- ✅ PromoCode model validation check করুন

#### 3. WhatsApp Message না যাচ্ছে?
- ✅ WhatsApp API credentials check করুন
- ✅ Phone number format check করুন (country code সহ)
- ✅ WhatsApp Business API quota check করুন

#### 4. Google Sheets এ Data Save হচ্ছে না?
- ✅ Google Sheets credentials check করুন
- ✅ Spreadsheet ID correct আছে কিনা check করুন
- ✅ Sheet name "User List" আছে কিনা check করুন
- ✅ Spreadsheet permissions check করুন (n8n service account access আছে কিনা)

#### 5. AI Message Generate হচ্ছে না?
- ✅ Gemini API key check করুন
- ✅ API quota check করুন
- ✅ Prompt format check করুন
- ✅ n8n execution logs দেখুন

#### 6. Automation Brain API Call Fail হচ্ছে?
- ✅ API URL check করুন (`https://looklifybd.com/api/automation/brain`)
- ✅ API running আছে কিনা check করুন
- ✅ CORS settings check করুন
- ✅ Request format check করুন

### Debugging Tips:

1. **n8n Execution Logs**: n8n dashboard এ execution history দেখুন
2. **Automation Brain Logs**: Server logs check করুন
3. **Browser Console**: Frontend থেকে call করলে browser console check করুন
4. **Database Check**: MongoDB এ PromoCode collection check করুন
5. **Google Sheets**: Manually spreadsheet check করুন data save হচ্ছে কিনা

---

## 📝 Important Notes

1. **Discount Code Uniqueness**: System automatically check করে code unique আছে কিনা
2. **Code Expiry**: Automated codes 30 days valid থাকে
3. **User-Specific Codes**: VIP/Welcome codes শুধু সেই user এর জন্য
4. **Multiple Actions**: Automation Brain comma-separated multiple actions return করতে পারে
5. **Error Handling**: যদি code save fail হয়, তবুও code return হয় (customer message পাবে)

---

## 🚀 Best Practices

1. **Event Timing**: Events real-time send করুন (delay avoid করুন)
2. **Error Handling**: Frontend এ proper error handling implement করুন
3. **Testing**: Production এ deploy করার আগে thorough testing করুন
4. **Monitoring**: Regular monitoring করুন automation properly কাজ করছে কিনা
5. **Code Management**: Dashboard থেকে expired codes regularly clean করুন

---

## 📞 Support

যদি কোনো সমস্যা হয়:

1. n8n execution logs check করুন
2. Automation Brain API logs check করুন
3. Database logs check করুন
4. Browser console check করুন (frontend থেকে call করলে)

---

**Happy Automating! 🚀**

*Last Updated: 2024*


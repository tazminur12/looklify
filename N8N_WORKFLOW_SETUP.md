# n8n Workflow Setup Guide for Looklify Automation

এই গাইড আপনাকে Looklify Automation Brain এর সাথে n8n workflow setup করতে সাহায্য করবে।

## 📋 Prerequisites

1. n8n installed (cloud বা self-hosted)
2. Looklify API running (localhost:3000 বা production URL)
3. SMTP credentials (email পাঠানোর জন্য)
4. WhatsApp API credentials (যদি WhatsApp ব্যবহার করতে চান)

## 🚀 Quick Start

### Step 1: n8n এ Workflow Import করুন

1. n8n dashboard এ যান
2. **Workflows** → **Import from File** এ ক্লিক করুন
3. `n8n-workflow-simple.json` file select করুন
4. Import করুন

### Step 2: Environment Variables Setup করুন

n8n এর environment variables এ এইগুলো add করুন:

```env
LOOKLIFY_API_URL=http://localhost:3000
# বা production URL: https://your-domain.com

EMAIL_FROM=noreply@looklify.com
ADMIN_EMAIL=admin@looklify.com
LOOKLIFY_WEB_URL=http://localhost:3000
```

### Step 3: Credentials Setup করুন

#### SMTP Credentials (Email পাঠানোর জন্য)

1. n8n → **Credentials** → **Add Credential**
2. **SMTP** select করুন
3. আপনার email provider এর details দিন:
   - **User**: your-email@gmail.com
   - **Password**: your-app-password
   - **Host**: smtp.gmail.com (Gmail এর জন্য)
   - **Port**: 465 (SSL) বা 587 (TLS)
   - **Secure**: true

#### WhatsApp Credentials (যদি WhatsApp ব্যবহার করতে চান)

1. n8n → **Credentials** → **Add Credential**
2. **WhatsApp API** select করুন
3. আপনার WhatsApp API credentials দিন

### Step 4: Webhook URL সংগ্রহ করুন

1. Workflow এ **Webhook** node এ ক্লিক করুন
2. **Execute Workflow** button এ ক্লিক করুন
3. Webhook URL copy করুন (যেমন: `https://your-n8n.com/webhook/looklify-event`)

## 📡 API Usage Examples

### Frontend/Backend থেকে Event Send করা

```javascript
// Example: Order Success Event
const response = await fetch('https://your-n8n.com/webhook/looklify-event', {
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
```

### Supported Events

1. **PRODUCT_VIEW** - Product view tracking
2. **ADD_TO_CART** - Add to cart event
3. **CHECKOUT_STARTED** - Checkout started
4. **ORDER_SUCCESS** - Order placed successfully
5. **ORDER_DELIVERED** - Order delivered
6. **REVIEW_SUBMITTED** - Review submitted
7. **PAGE_VISIT** - Page visit tracking
8. **LOW_STOCK** - Low stock alert
9. **RESTOCK** - Product restocked
10. **NEW_USER** - New user registered
11. **RETURN_REQUEST** - Return request
12. **AFFILIATE_ORDER** - Affiliate order
13. **CART_ABANDONED** - Cart abandoned

## 🔧 Workflow Customization

### Email Template Customize করা

**Send Email** node এ গিয়ে message field customize করুন:

```html
{{ $json.message }}

<br><br>
<strong>Customer:</strong> {{ $json.data.customer_name }}<br>
<strong>Order ID:</strong> {{ $json.data.order_id }}<br>
```

### Additional Actions যোগ করা

1. **Action Router** node এ নতুন condition add করুন
2. নতুন node (যেমন: Send SMS, Create Task, etc.) add করুন
3. Connection তৈরি করুন

## 📊 Workflow Structure

```
Webhook Trigger
    ↓
Automation Brain API Call
    ↓
Action Router (Switch Node)
    ├─→ Send Email
    ├─→ Send WhatsApp
    ├─→ Cart Recovery Email
    └─→ Other Actions...
    ↓
Response
```

## 🧪 Testing

### Test Event Send করা

```bash
curl -X POST https://your-n8n.com/webhook/looklify-event \
  -H "Content-Type: application/json" \
  -d '{
    "event": "NEW_USER",
    "userId": "test_user_id",
    "additionalData": {}
  }'
```

### Expected Response

```json
{
  "success": true,
  "action": "send_email",
  "message": "Welcome to Looklify, Test User! 🌟..."
}
```

## 🔍 Troubleshooting

### Email না যাচ্ছে?

1. SMTP credentials check করুন
2. Email node এর **toEmail** field check করুন
3. n8n execution logs দেখুন

### API Call fail হচ্ছে?

1. `LOOKLIFY_API_URL` environment variable check করুন
2. Looklify API running আছে কিনা check করুন
3. CORS settings check করুন

### Webhook response না পাচ্ছেন?

1. Webhook node এর **Response Mode** check করুন
2. **Response** node properly connected আছে কিনা check করুন

## 📝 Notes

- Workflow automatically handle করে multiple actions (comma-separated)
- Automation Brain API থেকে পাওয়া `action`, `message`, এবং `data` সব nodes এ available
- Environment variables use করে easily different environments (dev/prod) manage করতে পারবেন

## 🆘 Support

যদি কোনো সমস্যা হয়:
1. n8n execution logs check করুন
2. Automation Brain API logs check করুন
3. Browser console check করুন (frontend থেকে call করলে)

---

**Happy Automating! 🚀**



# Looklify Automation System - সম্পূর্ণ ব্যাখ্যা

## 🎯 সারসংক্ষেপ

আপনার Looklify e-commerce site এ একটি **Automation Brain** system তৈরি করা হয়েছে যা customer behavior track করে এবং automatically বিভিন্ন action নেয়। n8n workflow এর মাধ্যমে এই system email, WhatsApp, এবং অন্যান্য notifications পাঠায়।

---

## 📍 Route এর কাজ (`/api/automation/brain`)

### Route কি করে?

এই route হলো একটি **decision-making brain** যা:

1. **Events গ্রহণ করে** - Frontend/Backend থেকে বিভিন্ন events (যেমন: order success, product view, cart abandoned ইত্যাদি)
2. **Data analyze করে** - User এর past behavior, purchase history, preferences দেখে
3. **Decision নেয়** - কি action নিতে হবে (email পাঠাতে হবে, discount code generate করতে হবে, admin কে notify করতে হবে ইত্যাদি)
4. **Response দেয়** - n8n workflow কে বলে কি করতে হবে

### Route এর Structure:

```
POST /api/automation/brain
Body: {
  "event": "ORDER_SUCCESS",
  "data": {
    "userId": "...",
    "orderId": "...",
    "productId": "...",
    "additionalData": {...}
  }
}
```

### Route কি Response দেয়?

```json
{
  "action": "send_email,send_invoice,notify_admin",
  "message": "Hi John! 🎉 Your order has been confirmed...",
  "data": {
    "customer_name": "John",
    "customer_email": "john@example.com",
    "order_id": "ORD123",
    "discount_code": "VIP15ABC",
    ...
  }
}
```

---

## 🔄 n8n Workflow এর কাজ

### n8n কি করে?

n8n হলো একটি **workflow automation tool** যা:

1. **Webhook receive করে** - Frontend/Backend থেকে events পায়
2. **Automation Brain API call করে** - আপনার route কে call করে decision নিতে
3. **Actions execute করে** - Route থেকে পাওয়া decision অনুযায়ী email, WhatsApp, SMS ইত্যাদি পাঠায়
4. **Response দেয়** - Frontend/Backend কে জানায় কাজ সম্পন্ন হয়েছে

---

## 🔗 সম্পূর্ণ Flow (কিভাবে সব কিছু একসাথে কাজ করে)

### Step-by-Step Process:

```
1. Customer Action (Frontend)
   ↓
   Example: Customer একটি order complete করলো
   ↓
   
2. Frontend/Backend Event Send করে
   ↓
   POST request → n8n Webhook URL
   Body: {
     "event": "ORDER_SUCCESS",
     "userId": "123",
     "orderId": "ORD456"
   }
   ↓
   
3. n8n Webhook Trigger
   ↓
   n8n workflow start হয়
   ↓
   
4. n8n → Automation Brain API Call
   ↓
   POST → http://localhost:3000/api/automation/brain
   Body: {
     "event": "ORDER_SUCCESS",
     "data": {
       "userId": "123",
       "orderId": "ORD456"
     }
   }
   ↓
   
5. Automation Brain Route Processing
   ↓
   - Database থেকে user data fetch করে
   - Order details fetch করে
   - Past orders check করে (repeat customer কিনা)
   - Decision নেয়:
     * Invoice পাঠাতে হবে
     * Admin কে notify করতে হবে
     * Repeat customer হলে VIP discount code generate করতে হবে
   ↓
   
6. Route Response দেয় n8n কে
   ↓
   {
     "action": "send_invoice,notify_admin,send_vip_offer",
     "message": "Hi John! 🎉 Your order...",
     "data": {
       "customer_email": "john@example.com",
       "discount_code": "VIP15ABC",
       ...
     }
   }
   ↓
   
7. n8n Action Router (Switch Node)
   ↓
   Route থেকে পাওয়া "action" field check করে:
   - "send_email" আছে? → Send Email node
   - "send_invoice" আছে? → Send Invoice Email node
   - "notify_admin" আছে? → Notify Admin Email node
   - "send_vip_offer" আছে? → Send VIP Email node
   ↓
   
8. n8n Multiple Actions Execute করে
   ↓
   - Customer কে invoice email পাঠায়
   - Admin কে notification email পাঠায়
   - Customer কে VIP discount code email পাঠায়
   ↓
   
9. n8n Response দেয় Frontend/Backend কে
   ↓
   {
     "success": true,
     "actions_executed": ["send_invoice", "notify_admin", "send_vip_offer"]
   }
```

---

## 📊 বিভিন্ন Events এবং তাদের Actions

### 1. **ORDER_SUCCESS** (Order Complete হলে)

**Route কি করে:**
- User এর past orders count করে
- Repeat customer হলে VIP discount code generate করে (15% off)
- Invoice URL তৈরি করে

**n8n কি করে:**
- Customer কে invoice email পাঠায়
- Admin কে notification email পাঠায়
- Repeat customer হলে VIP discount code email পাঠায়

---

### 2. **PRODUCT_VIEW** (Product দেখলে)

**Route কি করে:**
- Product view count track করে
- যদি 3+ বার দেখে, তাহলে similar products recommend করে
- User এর past purchases দেখে matching products suggest করে

**n8n কি করে:**
- Customer কে product recommendations email পাঠায়

---

### 3. **ADD_TO_CART** (Cart এ add করলে)

**Route কি করে:**
- Cart value check করে
- First time cart addition এবং high value (>2000) হলে special message

**n8n কি করে:**
- Customer কে encouraging email পাঠায়

---

### 4. **CART_ABANDONED** (Cart abandon করলে)

**Route কি করে:**
- Cart abandonment detect করে
- 8% discount code generate করে

**n8n কি করে:**
- Customer কে cart recovery email + WhatsApp message পাঠায়
- Discount code সহ reminder পাঠায়

---

### 5. **NEW_USER** (নতুন user register করলে)

**Route কি করে:**
- Welcome discount code generate করে (10% off)

**n8n কি করে:**
- Customer কে welcome email পাঠায়
- Discount code সহ welcome message

---

### 6. **ORDER_DELIVERED** (Order deliver হলে)

**Route কি করে:**
- Delivery confirmation message তৈরি করে

**n8n কি করে:**
- Customer কে delivery confirmation email পাঠায়
- Review request সহ message

---

### 7. **REVIEW_SUBMITTED** (Review দিলে)

**Route কি করে:**
- Thank you message তৈরি করে
- 5% discount code generate করে

**n8n কি করে:**
- Customer কে thank you email পাঠায়
- Discount code সহ appreciation message

---

### 8. **LOW_STOCK** (Stock কম হলে)

**Route কি করে:**
- Product stock level check করে
- Low stock alert তৈরি করে

**n8n কি করে:**
- Admin কে low stock alert email পাঠায়

---

### 9. **RESTOCK** (Product restock হলে)

**Route কি করে:**
- Wishlist এ থাকা users খুঁজে বের করে
- Interested users list তৈরি করে

**n8n কি করে:**
- Interested users কে restock notification email পাঠায়

---

### 10. **RETURN_REQUEST** (Return request করলে)

**Route কি করে:**
- Return request ID generate করে
- Return process start করে

**n8n কি করে:**
- Customer কে return confirmation email পাঠায়
- Admin কে return request notification পাঠায়

---

## 🎨 Real-World Example

### Scenario: একজন Customer Order Complete করলো

**Step 1:** Customer checkout page এ order complete করলো

**Step 2:** Frontend code:
```javascript
// Checkout success page এ
await fetch('https://your-n8n.com/webhook/looklify-automation', {
  method: 'POST',
  body: JSON.stringify({
    event: 'ORDER_SUCCESS',
    userId: currentUser.id,
    orderId: order.id
  })
});
```

**Step 3:** n8n webhook receive করলো এবং Automation Brain API call করলো

**Step 4:** Automation Brain:
- Database থেকে user data fetch করলো
- Order details fetch করলো
- Past orders count করলো → 3 orders (repeat customer!)
- Decision: Invoice + Admin notification + VIP offer

**Step 5:** n8n received:
```json
{
  "action": "send_invoice,notify_admin,send_vip_offer",
  "message": "Hi John! 🎉 Your order ORD123...",
  "data": {
    "customer_email": "john@example.com",
    "discount_code": "VIP15XYZ",
    "order_id": "ORD123"
  }
}
```

**Step 6:** n8n executed:
- ✅ Invoice email → john@example.com
- ✅ Admin notification → admin@looklify.com
- ✅ VIP offer email → john@example.com (code: VIP15XYZ)

**Step 7:** Customer received:
- Invoice email with order details
- VIP discount code for next purchase

---

## 🔧 Technical Details

### Route Endpoints:

1. **POST `/api/automation/brain`**
   - Events receive করে
   - Processing করে
   - Decision return করে

2. **GET `/api/automation/brain`**
   - Health check
   - Supported events list

### n8n Workflow Nodes:

1. **Webhook Trigger** - Events receive করে
2. **Call Automation Brain** - Route কে call করে
3. **Route Actions (Switch)** - Actions route করে
4. **Send Email** - Email পাঠায়
5. **Send WhatsApp** - WhatsApp message পাঠায়
6. **Merge Results** - সব results combine করে
7. **Webhook Response** - Frontend কে response দেয়

---

## 💡 কেন এই Architecture?

### Benefits:

1. **Separation of Concerns**
   - Route = Business Logic (কি করতে হবে)
   - n8n = Execution (কিভাবে করতে হবে)

2. **Flexibility**
   - Route change করলে n8n workflow change করতে হবে না
   - n8n workflow change করলে route change করতে হবে না

3. **Scalability**
   - n8n multiple actions parallel execute করতে পারে
   - Route logic centralized থাকে

4. **Maintainability**
   - Business logic এক জায়গায়
   - Workflow logic visual editor এ

---

## 🚀 কিভাবে Use করবেন?

### Frontend থেকে Event Send করা:

```javascript
// Order success হলে
const sendAutomationEvent = async (event, data) => {
  try {
    const response = await fetch('https://your-n8n.com/webhook/looklify-automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: event,
        userId: data.userId,
        orderId: data.orderId,
        productId: data.productId,
        additionalData: data.additionalData || {}
      })
    });
    
    const result = await response.json();
    console.log('Automation triggered:', result);
  } catch (error) {
    console.error('Automation error:', error);
  }
};

// Usage
await sendAutomationEvent('ORDER_SUCCESS', {
  userId: user.id,
  orderId: order.id
});
```

### Backend থেকে Event Send করা:

```javascript
// Order model save করার পর
await fetch('https://your-n8n.com/webhook/looklify-automation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'ORDER_SUCCESS',
    userId: order.user.toString(),
    orderId: order._id.toString()
  })
});
```

---

## 📝 Summary

**Route (`/api/automation/brain`):**
- Events analyze করে
- Business logic apply করে
- Decisions নেয়
- Actions suggest করে

**n8n Workflow:**
- Events receive করে
- Route কে call করে
- Route এর suggestions execute করে
- Email, WhatsApp, SMS ইত্যাদি পাঠায়

**Together:**
- Complete automation system
- Customer engagement
- Business intelligence
- Automated marketing

---

**এই system আপনার Looklify site কে intelligent করে তোলে এবং automatically customer engagement handle করে! 🚀**


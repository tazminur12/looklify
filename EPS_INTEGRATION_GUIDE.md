# EPS Payment Gateway Integration

Complete Next.js (App Router) integration for Bangladesh EPS Payment Gateway.

## 🚀 Features

- ✅ Secure server-side API routes
- ✅ HMAC SHA512 + Base64 authentication
- ✅ Token-based authentication
- ✅ Payment initialization and verification
- ✅ Success/Fail/Cancel callbacks
- ✅ Ready-to-use React component
- ✅ Production-ready code
- ✅ No secrets exposed to client

## 📁 Folder Structure

```
looklify/
├── src/
│   ├── lib/
│   │   └── eps.js                          # EPS helper functions
│   ├── app/
│   │   ├── api/
│   │   │   └── eps/
│   │   │       ├── token/
│   │   │       │   └── route.js            # Get authentication token
│   │   │       ├── init/
│   │   │       │   └── route.js            # Initialize payment
│   │   │       ├── verify/
│   │   │       │   └── route.js            # Verify transaction
│   │   │       └── callback/
│   │   │           ├── success/
│   │   │           │   └── route.js        # Success callback
│   │   │           ├── fail/
│   │   │           │   └── route.js        # Fail callback
│   │   │           └── cancel/
│   │   │               └── route.js        # Cancel callback
│   │   └── components/
│   │       └── EPSPayment.js               # Payment component
└── .env.local.example                       # Environment variables template
```

## 🔧 Setup

### 1. Install Dependencies

All required dependencies are already in your project:
- `next` - Next.js framework
- `react` - React library
- `crypto` - Node.js built-in (no installation needed)
- `sweetalert2` - Already installed

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update with your EPS credentials:

```env
EPS_USERNAME=your_eps_username
EPS_PASSWORD=your_eps_password
EPS_HASH_KEY=your_eps_hash_key
EPS_MERCHANT_ID=your_merchant_id
EPS_STORE_ID=your_store_id
EPS_API_BASE=https://pgapi.eps.com.bd
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Restart Development Server

```bash
npm run dev
```

## 💻 Usage

### Basic Usage in Checkout Page

```jsx
import EPSPayment from '@/app/components/EPSPayment';

export default function CheckoutPage() {
  const handleSuccess = () => {
    console.log('Payment successful!');
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <div>
      <EPSPayment
        amount={1000.00}
        orderId="ORDER-123"
        customerInfo={{
          name: "Customer Name",
          email: "customer@example.com",
          phone: "01700000000"
        }}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}
```

### Manual API Calls

#### 1. Get Token

```javascript
const response = await fetch('/api/eps/token', {
  method: 'POST'
});
const { token } = await response.json();
```

#### 2. Initialize Payment

```javascript
const response = await fetch('/api/eps/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: token,
    amount: 1000.00,
    customerName: "Customer Name",
    customerEmail: "customer@example.com",
    customerPhone: "01700000000",
    orderId: "ORDER-123"
  })
});
const { redirectUrl } = await response.json();
window.location.href = redirectUrl;
```

#### 3. Verify Payment

```javascript
const response = await fetch('/api/eps/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: token,
    merchantTransactionId: "EPS-1234567890-ABC123"
  })
});
const result = await response.json();
```

## 🔄 Payment Flow

1. **Customer clicks "Pay with EPS"**
   - Component calls `/api/eps/token` to get authentication token
   
2. **Initialize Payment**
   - Component calls `/api/eps/init` with payment details
   - Server generates x-hash and calls EPS API
   - Returns redirect URL

3. **Customer Redirects to EPS**
   - Customer completes payment on EPS page
   
4. **EPS Redirects Back**
   - Success → `/api/eps/callback/success` → `/checkout/success`
   - Fail → `/api/eps/callback/fail` → `/checkout?error=payment_failed`
   - Cancel → `/api/eps/callback/cancel` → `/checkout?error=payment_cancelled`

5. **Verify Payment (Optional)**
   - Call `/api/eps/verify` to confirm transaction status

## 🔐 Security Features

- ✅ All sensitive operations on server-side
- ✅ HMAC SHA512 authentication
- ✅ Environment variables for secrets
- ✅ No credentials exposed to client
- ✅ Secure token-based authentication

## 📡 API Endpoints

### POST `/api/eps/token`
Get authentication token from EPS.

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### POST `/api/eps/init`
Initialize payment transaction.

**Request:**
```json
{
  "token": "auth_token",
  "amount": 1000.00,
  "customerName": "Customer Name",
  "customerEmail": "customer@example.com",
  "customerPhone": "01700000000",
  "orderId": "ORDER-123"
}
```

**Response:**
```json
{
  "success": true,
  "redirectUrl": "https://pgapi.eps.com.bd/payment/...",
  "merchantTransactionId": "EPS-1234567890-ABC123",
  "transactionId": "TXN123456"
}
```

### POST `/api/eps/verify`
Verify transaction status.

**Request:**
```json
{
  "token": "auth_token",
  "merchantTransactionId": "EPS-1234567890-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "merchantTransactionId": "EPS-1234567890-ABC123",
    "transactionId": "TXN123456",
    "amount": "1000.00",
    "currency": "BDT",
    "status": "Success",
    "timestamp": "2026-01-09T12:00:00Z"
  }
}
```

## 🧪 Testing

### Test in Development

1. Set up test credentials from EPS
2. Use test card numbers provided by EPS
3. Monitor server logs for detailed flow:
   - 🔐 Token requests
   - 💳 Payment initialization
   - ✅ Success callbacks
   - ❌ Error handling

### Test URLs

- Success: `http://localhost:3000/api/eps/callback/success?merchantTransactionId=TEST-123`
- Fail: `http://localhost:3000/api/eps/callback/fail?merchantTransactionId=TEST-123&message=Payment+failed`
- Cancel: `http://localhost:3000/api/eps/callback/cancel?merchantTransactionId=TEST-123`

## 🚀 Production Deployment

### Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Set `NEXT_PUBLIC_BASE_URL` to your production domain
3. Deploy

### Environment Variables

Make sure all these are set in production:
```
EPS_USERNAME
EPS_PASSWORD
EPS_HASH_KEY
EPS_MERCHANT_ID
EPS_STORE_ID
EPS_API_BASE
NEXT_PUBLIC_BASE_URL
```

## 🐛 Troubleshooting

### Token Generation Fails
- Check EPS_USERNAME and EPS_PASSWORD
- Verify EPS_HASH_KEY is correct
- Check EPS_API_BASE URL

### Payment Initialization Fails
- Ensure token is valid and not expired
- Check MERCHANT_ID and STORE_ID
- Verify x-hash generation

### Callbacks Not Working
- Check NEXT_PUBLIC_BASE_URL is correct
- Verify callback URLs in EPS dashboard
- Check server logs for errors

## 📞 Support

For EPS API issues, contact EPS support:
- Website: https://www.eps.com.bd
- Email: support@eps.com.bd

## 📄 License

This integration is part of the Looklify project.

---

**Built with ❤️ for Bangladesh E-commerce**

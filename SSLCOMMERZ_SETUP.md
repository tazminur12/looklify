# SSL Commerz Configuration

## Environment Variables

Update your `.env` file with the following SSL Commerz credentials:

```env
# SSL Commerz Payment Gateway (Sandbox)
STORE_ID=lookl693ab792ec47f
STORE_PASSWORD=lookl693ab792ec47f@ssl
SSLCOMMERZ_IS_LIVE=false

# For production, change to:
# SSLCOMMERZ_IS_LIVE=true
```

## Store Information

- **Store ID**: lookl693ab792ec47f
- **Store Password**: lookl693ab792ec47f@ssl
- **Store Name**: testlookl858k
- **Registered URL**: https://looklifybd.com
- **Environment**: Sandbox (Test Mode)

## API Endpoints

The `sslcommerz-lts` package automatically uses the correct endpoints based on `SSLCOMMERZ_IS_LIVE`:

### Sandbox (SSLCOMMERZ_IS_LIVE=false)
- **Session API**: https://sandbox.sslcommerz.com/gwprocess/v3/api.php
- **Validation API**: https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
- **Merchant Panel**: https://sandbox.sslcommerz.com/manage/

### Production (SSLCOMMERZ_IS_LIVE=true)
- **Session API**: https://securepay.sslcommerz.com/gwprocess/v3/api.php
- **Validation API**: https://securepay.sslcommerz.com/validator/api/validationserverAPI.php
- **Merchant Panel**: https://merchant.sslcommerz.com/

## Important Notes

1. **Sandbox Mode**: Keep `SSLCOMMERZ_IS_LIVE=false` for testing
2. **Production**: Change to `SSLCOMMERZ_IS_LIVE=true` when going live
3. **Callback URLs**: Make sure your registered URL (https://looklifybd.com) is properly configured
4. **Test Cards**: Use SSL Commerz test cards in sandbox mode

## Testing

After updating credentials, restart your Next.js server:

```bash
npm run dev
```

Then test the payment flow through the checkout page.

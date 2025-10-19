# Production Setup Guide

## Environment Variables Required for Vercel Deployment

To fix the dashboard authentication issue in production, you need to set up the following environment variables in your Vercel project:

### Required Environment Variables:

1. **NEXTAUTH_SECRET** (Required)
   - Generate a random secret key
   - You can use: `openssl rand -base64 32`
   - Or online generator: https://generate-secret.vercel.app/32

2. **NEXTAUTH_URL** (Required for Production)
   - Set this to your Vercel app URL
   - Example: `https://your-app-name.vercel.app`

3. **MONGODB_URI** (Required)
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/database`

### Optional Environment Variables:

4. **GOOGLE_CLIENT_ID** & **GOOGLE_CLIENT_SECRET** (For Google OAuth)
5. **GITHUB_CLIENT_ID** & **GITHUB_CLIENT_SECRET** (For GitHub OAuth)
6. **CLOUDINARY_*** variables (For image uploads)

## How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value
5. Redeploy your application

## Common Issues and Solutions:

### Issue: Dashboard redirects to login page in production
**Solution**: Make sure `NEXTAUTH_URL` is set to your exact Vercel domain

### Issue: Session not persisting
**Solution**: Ensure `NEXTAUTH_SECRET` is set and is the same across all deployments

### Issue: Database connection errors
**Solution**: Verify `MONGODB_URI` is correct and your MongoDB Atlas cluster allows connections from Vercel

## Testing the Fix:

1. Set all required environment variables
2. Redeploy your application
3. Try logging in and accessing the dashboard
4. Check browser developer tools for any console errors

The main issue was missing `NEXTAUTH_URL` which is required for NextAuth to work properly in production environments.

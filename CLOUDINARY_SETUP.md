# Cloudinary Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Cloudinary Configuration (Server-side)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## How to Get Cloudinary Credentials

1. **Sign up for Cloudinary**: Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. **Get your credentials**: 
   - Cloud Name: Found in your dashboard
   - API Key: Found in your dashboard
   - API Secret: Found in your dashboard
3. **Create an Upload Preset**:
   - Go to Settings > Upload
   - Click "Add upload preset"
   - Set signing mode to "Unsigned" for client-side uploads
   - Save the preset name

## Features Implemented

✅ **Client-side Image Upload**: Users can upload images directly from their device
✅ **Image Preview**: Real-time preview of uploaded images
✅ **Multiple Images**: Support for multiple product images
✅ **Primary Image Selection**: Mark one image as primary
✅ **Error Handling**: Proper error messages for failed uploads
✅ **Loading States**: Visual feedback during upload process

## Security Notes

- The upload preset should be set to "Unsigned" for client-side uploads
- API secret is only used server-side for security
- All uploads go through our API route for better control

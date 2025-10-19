# Image Upload Troubleshooting Guide

## Quick Test

1. Go to `/test-upload` page to test the upload system
2. Select an image file and click "Upload File"
3. Check the browser console for any error messages

## Common Issues & Solutions

### 1. "Image upload service not configured" Error

**Problem**: Cloudinary environment variables are not set up.

**Solution**: Add these to your `.env.local` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 2. "Upload failed" Error

**Possible Causes**:
- Cloudinary credentials are incorrect
- Upload preset is not set to "Unsigned"
- File size is too large (>5MB)
- File type is not an image

**Solutions**:
1. Verify Cloudinary credentials in your dashboard
2. Check upload preset settings in Cloudinary
3. Try with a smaller image file
4. Make sure you're selecting an image file

### 3. File Not Uploading

**Check**:
1. Browser console for JavaScript errors
2. Network tab for failed requests
3. Server logs for API errors

### 4. Images Not Displaying

**Possible Causes**:
- CORS issues
- Invalid image URLs
- Network connectivity

**Solutions**:
1. Check if the uploaded URL is accessible
2. Try opening the image URL in a new tab
3. Check browser network tab for failed image loads

## Debug Steps

1. **Check Environment Variables**:
   ```bash
   echo $CLOUDINARY_CLOUD_NAME
   echo $CLOUDINARY_UPLOAD_PRESET
   ```

2. **Test API Directly**:
   ```bash
   curl -X POST http://localhost:3000/api/upload \
     -F "file=@test-image.jpg"
   ```

3. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages when uploading

4. **Check Network Tab**:
   - Open Developer Tools (F12)
   - Go to Network tab
   - Try uploading and check for failed requests

## Manual Upload Alternative

If automatic upload doesn't work, users can:
1. Upload images to any image hosting service (Imgur, etc.)
2. Copy the image URL
3. Paste it in the "Image URL" field

## Support

If issues persist:
1. Check the server logs
2. Verify Cloudinary account status
3. Test with different image files
4. Check browser compatibility

# SweetAlert2 + Cloudinary Integration Setup

## Overview
This project now includes SweetAlert2 for beautiful user notifications and Cloudinary for cloud-based image uploads.

## Features Added

### SweetAlert2 Integration
- ✅ Beautiful loading animations
- ✅ Success/error notifications
- ✅ Confirmation dialogs
- ✅ Custom HTML content
- ✅ Timer-based alerts
- ✅ Promise-based API

### Cloudinary Integration
- ✅ Image upload to cloud
- ✅ Automatic optimization
- ✅ File size validation (2MB limit)
- ✅ Format validation (images only)
- ✅ CDN delivery
- ✅ Public ID management

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in your project root with the following variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Other existing variables...
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 2. Cloudinary Setup
1. Go to [Cloudinary.com](https://cloudinary.com) and create a free account
2. In your Cloudinary dashboard, go to "Settings" → "API Keys"
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env.local` file

### 3. Test the Integration
Visit `/test-sweetalert-cloudinary` to test both integrations:
- Test SweetAlert2 notifications
- Test Cloudinary image uploads
- View integration status

## Usage Examples

### SweetAlert2 Usage
```javascript
import Swal from 'sweetalert2';

// Basic alert
Swal.fire('Hello World!');

// Loading alert
Swal.fire({
  title: 'Loading...',
  text: 'Please wait',
  allowOutsideClick: false,
  didOpen: () => {
    Swal.showLoading();
  }
});

// Success alert
Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'Operation completed successfully'
});

// Confirmation dialog
Swal.fire({
  title: 'Are you sure?',
  text: 'This action cannot be undone',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes, delete it!',
  cancelButtonText: 'No, cancel'
}).then((result) => {
  if (result.isConfirmed) {
    // User confirmed
  }
});
```

### Cloudinary Upload
```javascript
const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'looklify');
  formData.append('type', 'image');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const json = await res.json();
  if (json.success) {
    console.log('Image URL:', json.data.url);
    console.log('Public ID:', json.data.publicId);
  }
};
```

## Files Modified

### Updated Files
- `src/app/dashboard/brands/new/page.jsx` - Added SweetAlert2 notifications
- `src/lib/cloudinary.js` - Cloudinary configuration (already existed)
- `src/app/api/upload/route.js` - Upload API endpoint (already existed)

### New Files
- `src/app/test-sweetalert-cloudinary/page.jsx` - Test page for both integrations

## Dependencies
The following packages are already installed:
- `sweetalert2: ^11.26.3`
- `cloudinary: ^2.7.0`

## Troubleshooting

### Cloudinary Issues
- Make sure your environment variables are correctly set
- Check that your Cloudinary account is active
- Verify the API keys have the correct permissions

### SweetAlert2 Issues
- Ensure the import statement is correct: `import Swal from 'sweetalert2';`
- Check browser console for any JavaScript errors
- Make sure the component is client-side (`'use client'` directive)

## Next Steps
1. Set up your Cloudinary account and add environment variables
2. Test the integration using the test page
3. Use SweetAlert2 in other parts of your application
4. Customize Cloudinary upload settings as needed

## Support
- [SweetAlert2 Documentation](https://sweetalert2.github.io/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

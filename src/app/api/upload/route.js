import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('Upload API called');
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET) {
      console.error('Cloudinary not configured');
      return NextResponse.json({ 
        error: 'Image upload service not configured. Please contact administrator.' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    
    console.log('File received:', file ? file.name : 'No file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Create FormData for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    console.log('Cloudinary response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to upload to image service' 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('Cloudinary response:', data);

    if (data.secure_url) {
      return NextResponse.json({
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
      });
    } else {
      console.error('No secure_url in response:', data);
      return NextResponse.json({ 
        error: 'Upload failed - no URL returned from image service' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed: ' + error.message 
    }, { status: 500 });
  }
}
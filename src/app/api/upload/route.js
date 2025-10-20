import { NextResponse } from 'next/server';
import { uploadToCloudinary, uploadFromBuffer } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    console.log('Upload API called');
    
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'looklify-images';
    const type = formData.get('type') || 'image';
    
    console.log('File received:', file ? file.name : 'No file');
    console.log('Folder:', folder, 'Type:', type);
    
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

    console.log('Converting file to buffer...');

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary using buffer
    const result = await uploadToCloudinary(buffer, {
      folder: folder,
      resource_type: type,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    console.log('Cloudinary upload result:', result);

    if (result.secure_url) {
      return NextResponse.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        }
      });
    } else {
      console.error('No secure_url in result:', result);
      return NextResponse.json({ 
        error: 'Upload failed - no URL returned from image service' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    
    // Check if it's a Cloudinary error
    if (error.http_code === 404) {
      return NextResponse.json({ 
        error: 'Cloudinary folder not found. Please check your Cloudinary configuration.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Upload failed: ' + error.message 
    }, { status: 500 });
  }
}
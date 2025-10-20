import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary environment variables are not defined');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'looklify-images', 
          resource_type: 'image', 
          ...options 
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          console.log('Cloudinary upload success:', result);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    } catch (err) {
      console.error('Upload stream error:', err);
      reject(err);
    }
  });
}

export function uploadFromFormData(file, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'looklify-images', resource_type: 'image', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
    // Convert file to buffer and upload
    const reader = file.stream().getReader();
    const pump = () => {
      return reader.read().then(({ done, value }) => {
        if (done) {
          uploadStream.end();
        } else {
          uploadStream.write(value);
          return pump();
        }
      });
    };
    
    pump().catch(reject);
  });
}

// Alternative upload method using buffer
export function uploadFromBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'looklify-images', resource_type: 'image', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;

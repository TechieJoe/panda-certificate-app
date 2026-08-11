// src/config/cloudinary.config.ts

// Ensure .env is loaded early, before this module is used for upload setup.
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET;

console.log('Cloudinary ENV:', {
  cloud_name: cloudName ? 'loaded' : 'missing',
  api_key: apiKey ? 'loaded' : 'missing',
  api_secret: apiSecret ? 'loaded' : 'missing',
});

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    'Missing Cloudinary credentials. Please set CLOUDINARY_NAME (or CLOUDINARY_CLOUD_NAME), CLOUDINARY_KEY (or CLOUDINARY_API_KEY), and CLOUDINARY_SECRET (or CLOUDINARY_API_SECRET)'
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;
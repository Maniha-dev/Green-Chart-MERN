import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
    console.error(`Missing Cloudinary environment variable(s): ${missing.join(', ')}`);
    process.exitCode = 1;
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });

    try {
        const result = await cloudinary.api.ping();
        console.log('Cloudinary connected:', result);
    } catch (error) {
        console.error('Cloudinary ping failed:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
        });
        process.exitCode = 1;
    }
}

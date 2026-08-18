import { v2 as cloudinary } from 'cloudinary';

const requiredCloudinaryEnv = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

const connectCloudinary = () => {
    const missing = requiredCloudinaryEnv.filter((name) => !process.env[name]);

    if (missing.length > 0) {
        throw new Error(
            `Missing Cloudinary environment variable(s): ${missing.join(', ')}. ` +
            'Create server/.env with the values from Cloudinary Console > Settings > API Keys.'
        );
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
};

export default connectCloudinary;

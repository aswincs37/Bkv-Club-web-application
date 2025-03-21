// pages/api/upload-cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req: { method: string; body: { data: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; url?: any; thumbnailUrl?: any; publicId?: any; }): void; new(): any; }; }; }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });

    res.status(200).json({
      url: uploadResponse.secure_url,
      thumbnailUrl: uploadResponse.secure_url.replace('/upload/', '/upload/c_fill,h_150,w_150/'),
      publicId: uploadResponse.public_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}